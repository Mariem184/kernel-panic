import { QdrantClient } from '@qdrant/js-client-rest';
import { config } from '../../config/env.js';

let clientInstance = null;
let isAvailable = null;
let lastCheckTime = 0;
const COOLDOWN_MS = 60000;

/**
 * Returns a configured QdrantClient instance.
 */
export function getQdrantClient() {
  if (!clientInstance) {
    const options = {
      url: config.qdrant.url,
      checkCompatibility: false
    };
    if (config.qdrant.apiKey && (config.qdrant.url.startsWith('https') || !config.qdrant.url.includes('localhost'))) {
      options.apiKey = config.qdrant.apiKey;
    }
    clientInstance = new QdrantClient(options);
  }
  return clientInstance;
}

/**
 * Checks if Qdrant is connected and reachable with cached cooldown and fast timeout to avoid request hangs.
 */
export async function isQdrantHealthy() {
  const now = Date.now();
  if (isAvailable !== null && now - lastCheckTime < COOLDOWN_MS) {
    return isAvailable;
  }

  // Fast check with 800ms timeout
  try {
    const client = getQdrantClient();
    const checkPromise = client.getCollections();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Qdrant health check timeout')), 800)
    );

    await Promise.race([checkPromise, timeoutPromise]);
    isAvailable = true;
    lastCheckTime = now;
    return true;
  } catch {
    isAvailable = false;
    lastCheckTime = now;
    return false;
  }
}

/**
 * Marks Qdrant as temporarily unavailable to immediately use local fallback index.
 */
export function markQdrantUnavailable() {
  isAvailable = false;
  lastCheckTime = Date.now();
}

export function _resetQdrantStatusForTesting() {
  isAvailable = null;
  lastCheckTime = 0;
  clientInstance = null;
}

/**
 * Ensures the Qdrant collection exists with proper dimensions and metric.
 */
export async function ensureCollectionExists() {
  const client = getQdrantClient();
  const collectionName = config.qdrant.collection;

  try {
    const { collections } = await client.getCollections();
    const exists = collections.some((c) => c.name === collectionName);

    if (!exists) {
      console.log(`[Qdrant] Collection "${collectionName}" not found. Creating collection...`);
      await client.createCollection(collectionName, {
        vectors: {
          size: config.embedding.dimension,
          distance: 'Cosine'
        }
      });
      console.log(`[Qdrant] Collection "${collectionName}" created successfully.`);
    } else {
      console.log(`[Qdrant] Collection "${collectionName}" already exists.`);
    }
    isAvailable = true;
    lastCheckTime = Date.now();
    return true;
  } catch (err) {
    console.warn(`[Qdrant] Could not ensure collection exists (Qdrant may be offline):`, err.message);
    isAvailable = false;
    lastCheckTime = Date.now();
    return false;
  }
}
