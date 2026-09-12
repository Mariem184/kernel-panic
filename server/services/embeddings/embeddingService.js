import { pipeline } from '@xenova/transformers';
import { config } from '../../config/env.js';

let extractorInstance = null;
let isInitializing = false;
let initPromise = null;

/**
 * Initializes and caches the feature extraction pipeline.
 */
async function getExtractor() {
  if (extractorInstance) {
    return extractorInstance;
  }
  if (initPromise) {
    return initPromise;
  }

  isInitializing = true;
  initPromise = (async () => {
    try {
      console.log(`[EmbeddingService] Loading embedding model: ${config.embedding.model}...`);
      const extractor = await pipeline('feature-extraction', config.embedding.model, {
        quantized: true
      });
      console.log(`[EmbeddingService] Embedding model loaded successfully.`);
      extractorInstance = extractor;
      return extractor;
    } catch (err) {
      console.error('[EmbeddingService] Failed to load embedding model:', err);
      throw err;
    } finally {
      isInitializing = false;
    }
  })();

  return initPromise;
}

/**
 * Generates a normalized dense vector embedding for input text.
 * @param {string} text
 * @returns {Promise<number[]>} Array of floating point numbers (dimension 384)
 */
export async function generateEmbedding(text) {
  if (!text || typeof text !== 'string') {
    throw new Error('Input text must be a non-empty string');
  }

  const cleanText = text.replace(/\s+/g, ' ').trim();
  const extractor = await getExtractor();
  const output = await extractor(cleanText, { pooling: 'mean', normalize: true });

  return Array.from(output.data);
}

/**
 * Generates embeddings for an array of texts in sequence or small batches.
 * @param {string[]} texts
 * @returns {Promise<number[][]>}
 */
export async function generateEmbeddingsBatch(texts) {
  const embeddings = [];
  for (const text of texts) {
    const vec = await generateEmbedding(text);
    embeddings.push(vec);
  }
  return embeddings;
}

/**
 * Calculates cosine similarity between two normalized vectors.
 * Useful for local fallback search.
 */
export function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
