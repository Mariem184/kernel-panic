import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from workspace root first, then fallback to server dir
const rootEnvPath = path.resolve(__dirname, '../../.env');
const serverEnvPath = path.resolve(__dirname, '../.env');

if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
} else if (fs.existsSync(serverEnvPath)) {
  dotenv.config({ path: serverEnvPath });
} else {
  dotenv.config();
}

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  groq: {
    apiKey: process.env.GROQ_API_KEY || '',
    model: process.env.GROQ_MODEL || 'openai/gpt-oss-120b'
  },
  qdrant: {
    url: process.env.QDRANT_URL || 'http://localhost:6333',
    apiKey: process.env.QDRANT_API_KEY || undefined,
    collection: process.env.QDRANT_COLLECTION || 'kernel_panic_knowledge'
  },
  embedding: {
    model: process.env.EMBEDDING_MODEL || 'Xenova/paraphrase-multilingual-MiniLM-L12-v2',
    dimension: 384
  }
};

export function validateConfig() {
  const warnings = [];
  if (!config.groq.apiKey) {
    warnings.push('GROQ_API_KEY is not set. Chat generation will fail without a valid Groq key.');
  }
  if (!config.qdrant.url) {
    warnings.push('QDRANT_URL is not set. Defaulting to http://localhost:6333.');
  }
  return { valid: warnings.length === 0, warnings };
}
