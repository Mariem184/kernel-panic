import { QdrantClient } from '@qdrant/js-client-rest';
import { config } from '../../config/env.js';

let clientInstance = null;

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
    return true;
  } catch (err) {
    console.warn(`[Qdrant] Could not ensure collection exists (Qdrant may be offline):`, err.message);
    return false;
  }
}

/**
 * Checks if Qdrant is connected and reachable.
 */
export async function isQdrantHealthy() {
  try {
    const client = getQdrantClient();
    await client.getCollections();
    return true;
  } catch {
    return false;
  }
}
