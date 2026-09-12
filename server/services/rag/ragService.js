import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getQdrantClient } from './qdrantClient.js';
import { generateEmbedding, cosineSimilarity } from '../embeddings/embeddingService.js';
import { config } from '../../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fallbackIndexPath = path.resolve(__dirname, '../../../knowledge/local_index.json');

let cachedLocalIndex = null;

/**
 * Loads the local fallback index if available.
 */
function getLocalFallbackIndex() {
  if (cachedLocalIndex) return cachedLocalIndex;
  try {
    if (fs.existsSync(fallbackIndexPath)) {
      const data = fs.readFileSync(fallbackIndexPath, 'utf-8');
      cachedLocalIndex = JSON.parse(data);
      return cachedLocalIndex;
    }
  } catch (err) {
    console.warn('[RAG] Failed to load local fallback index:', err.message);
  }
  return null;
}

/**
 * Performs local similarity search using in-memory cosine similarity.
 */
function searchLocalFallback(queryEmbedding, topK = 5, minScore = 0.32) {
  const localIndex = getLocalFallbackIndex();
  if (!localIndex || !Array.isArray(localIndex.chunks) || localIndex.chunks.length === 0) {
    return [];
  }

  const scored = localIndex.chunks.map((chunk) => {
    const score = cosineSimilarity(queryEmbedding, chunk.vector);
    return {
      id: chunk.id,
      score,
      payload: {
        text: chunk.text,
        title: chunk.title,
        section: chunk.section,
        source: chunk.source
      }
    };
  });

  return scored
    .filter((item) => item.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

/**
 * Retrieves the most relevant company knowledge chunks for a query.
 * Queries Qdrant first, falling back gracefully to local vector index.
 *
 * @param {string} query
 * @param {number} limit
 * @returns {Promise<{ contextText: string, chunks: any[], hasRelevantKnowledge: boolean }>}
 */
export async function retrieveContext(query, limit = 4) {
  try {
    const queryEmbedding = await generateEmbedding(query);
    let matchedResults = [];
    let usedFallback = false;

    // 1. Try Qdrant retrieval
    try {
      const client = getQdrantClient();
      const response = await client.query(config.qdrant.collection, {
        query: queryEmbedding,
        limit,
        with_payload: true,
        score_threshold: 0.32
      });

      const points = response?.points || [];
      if (Array.isArray(points) && points.length > 0) {
        matchedResults = points;
      }
    } catch (qdrantErr) {
      console.warn('[RAG] Qdrant search unavailable, using local fallback index:', qdrantErr.message);
      usedFallback = true;
    }

    // 2. If Qdrant had no results or failed, try local fallback
    if (matchedResults.length === 0) {
      matchedResults = searchLocalFallback(queryEmbedding, limit, 0.32);
      if (matchedResults.length > 0) {
        usedFallback = true;
      }
    }

    if (matchedResults.length === 0) {
      return {
        contextText: '',
        chunks: [],
        hasRelevantKnowledge: false,
        usedFallback
      };
    }

    // Deduplicate and format context
    const chunks = matchedResults.map((r) => ({
      score: r.score,
      title: r.payload?.title || 'Knowledge',
      section: r.payload?.section || '',
      text: r.payload?.text || '',
      source: r.payload?.source || ''
    }));

    const contextText = chunks
      .map((c, i) => `--- [Knowledge Chunk ${i + 1}: ${c.title}${c.section ? ' - ' + c.section : ''}] ---\n${c.text}`)
      .join('\n\n');

    return {
      contextText,
      chunks,
      hasRelevantKnowledge: true,
      usedFallback
    };
  } catch (err) {
    console.error('[RAG] Error during context retrieval:', err);
    return {
      contextText: '',
      chunks: [],
      hasRelevantKnowledge: false,
      error: err.message
    };
  }
}
