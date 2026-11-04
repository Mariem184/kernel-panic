import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getQdrantClient, isQdrantHealthy, markQdrantUnavailable } from './qdrantClient.js';
import { generateEmbedding, cosineSimilarity } from '../embeddings/embeddingService.js';
import { config } from '../../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fallbackIndexPath = path.resolve(__dirname, '../../../knowledge/local_index.json');

let cachedLocalIndex = null;

const STOP_WORDS = new Set([
  'the', 'is', 'in', 'at', 'of', 'on', 'and', 'a', 'an', 'to', 'for', 'with', 'by',
  'what', 'who', 'how', 'why', 'when', 'where', 'are', 'we', 'you', 'it', 'can', 'do',
  'في', 'من', 'على', 'إلى', 'عن', 'هو', 'هي', 'هل', 'ما', 'ماذا', 'كيف', 'مع', 'أو'
]);

/**
 * Loads the local fallback index if available.
 */
export function getLocalFallbackIndex() {
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

export function _setCachedIndexForTesting(index) {
  cachedLocalIndex = index;
}

export function _resetCachedIndexForTesting() {
  cachedLocalIndex = null;
}

/**
 * Fast keyword search used only when embedding is unavailable.
 */
export function searchLocalFallbackByKeywords(query, topK = config.rag.topK) {
  const localIndex = getLocalFallbackIndex();
  if (!localIndex || !Array.isArray(localIndex.chunks) || localIndex.chunks.length === 0) {
    return [];
  }

  const words = (query || '')
    .toLowerCase()
    .split(/[\s,?.!؟]+/)
    .filter((w) => w.length >= 3 && !STOP_WORDS.has(w));

  if (words.length === 0) return [];

  const scored = localIndex.chunks.map((chunk) => {
    const combined = `${chunk.title || ''} ${chunk.section || ''} ${chunk.text || ''}`.toLowerCase();
    let matches = 0;
    for (const w of words) {
      if (combined.includes(w)) {
        matches += (chunk.title && chunk.title.toLowerCase().includes(w)) ? 3 : 1;
      }
    }
    const score = matches / (words.length * 2);
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
    .filter((item) => item.score >= 0.25)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

/**
 * Performs local similarity search using in-memory cosine similarity.
 */
export function searchLocalFallback(
  queryEmbedding,
  topK = config.rag.topK,
  minScore = config.rag.scoreThreshold,
  queryText = ''
) {
  if (queryEmbedding && Array.isArray(queryEmbedding)) {
    const localIndex = getLocalFallbackIndex();
    if (!localIndex || !Array.isArray(localIndex.chunks) || localIndex.chunks.length === 0) {
      return [];
    }

    return localIndex.chunks
      .map((chunk) => ({
        id: chunk.id,
        score: cosineSimilarity(queryEmbedding, chunk.vector),
        payload: {
          text: chunk.text,
          title: chunk.title,
          section: chunk.section,
          source: chunk.source
        }
      }))
      .filter((item) => item.score >= minScore)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  // Fallback to keyword search only if embedding was not generated
  if (queryText) {
    return searchLocalFallbackByKeywords(queryText, topK);
  }

  return [];
}

/**
 * Retrieves the most relevant company knowledge chunks for a query.
 */
export async function retrieveContext(query, limit = config.rag.topK, threshold = config.rag.scoreThreshold) {
  const startTime = performance.now();
  let usedFallback = false;

  try {
    if (!query || typeof query !== 'string' || !query.trim()) {
      return {
        contextText: '',
        chunks: [],
        hasRelevantKnowledge: false,
        retrievalMs: Math.round(performance.now() - startTime),
        usedFallback: false
      };
    }

    let queryEmbedding = null;
    try {
      const embPromise = generateEmbedding(query);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Embedding generation timeout')), 800)
      );
      queryEmbedding = await Promise.race([embPromise, timeoutPromise]);
    } catch (embErr) {
      console.warn('[RAG] Embedding timed out or failed, falling back to keyword search:', embErr.message);
    }

    let matchedResults = [];

    // 1. Try Qdrant retrieval if healthy and embedding available
    if (queryEmbedding && (await isQdrantHealthy())) {
      try {
        const client = getQdrantClient();
        const queryPromise = client.query(config.qdrant.collection, {
          query: queryEmbedding,
          limit,
          with_payload: true,
          score_threshold: threshold
        });
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Qdrant query timeout')), 800)
        );

        const response = await Promise.race([queryPromise, timeoutPromise]);
        const points = response?.points || [];
        if (Array.isArray(points) && points.length > 0) {
          matchedResults = points;
        }
      } catch (qdrantErr) {
        markQdrantUnavailable();
        usedFallback = true;
      }
    }

    // 2. If Qdrant had no results or failed, use local index
    if (matchedResults.length === 0) {
      matchedResults = searchLocalFallback(queryEmbedding, limit, threshold, query);
      if (matchedResults.length > 0) {
        usedFallback = true;
      }
    }

    const retrievalMs = Math.round(performance.now() - startTime);

    if (matchedResults.length === 0) {
      return {
        contextText: '',
        chunks: [],
        hasRelevantKnowledge: false,
        retrievalMs,
        usedFallback
      };
    }

    // Deduplicate and format context
    const seenTexts = new Set();
    const chunks = [];

    for (const r of matchedResults) {
      const text = r.payload?.text || '';
      if (!text || seenTexts.has(text)) continue;
      seenTexts.add(text);

      chunks.push({
        score: r.score,
        title: r.payload?.title || 'Knowledge',
        section: r.payload?.section || '',
        text,
        source: r.payload?.source || ''
      });
    }

    if (chunks.length === 0) {
      return {
        contextText: '',
        chunks: [],
        hasRelevantKnowledge: false,
        retrievalMs,
        usedFallback
      };
    }

    const contextText = chunks
      .map((c, i) => `--- [Knowledge Chunk ${i + 1}: ${c.title}${c.section ? ' - ' + c.section : ''}] ---\n${c.text}`)
      .join('\n\n');

    return {
      contextText,
      chunks,
      hasRelevantKnowledge: true,
      retrievalMs,
      usedFallback
    };
  } catch (err) {
    console.error('[RAG] Error during context retrieval:', err);
    return {
      contextText: '',
      chunks: [],
      hasRelevantKnowledge: false,
      retrievalMs: Math.round(performance.now() - startTime),
      usedFallback,
      error: err.message
    };
  }
}
