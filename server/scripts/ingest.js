import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from '../config/env.js';
import { generateEmbedding } from '../services/embeddings/embeddingService.js';
import { getQdrantClient, ensureCollectionExists } from '../services/rag/qdrantClient.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const knowledgeDir = path.resolve(__dirname, '../../knowledge');
const localIndexPath = path.resolve(knowledgeDir, 'local_index.json');

/**
 * Splits markdown content into logical semantic chunks based on headers.
 */
function chunkMarkdown(filename, content) {
  const chunks = [];
  const lines = content.split('\n');
  let currentTitle = filename.replace('.md', '');
  let currentSection = '';
  let buffer = [];

  for (const line of lines) {
    if (line.startsWith('# ')) {
      if (buffer.length > 0) {
        const text = buffer.join('\n').trim();
        if (text.length > 30) {
          chunks.push({ title: currentTitle, section: currentSection, text, source: filename });
        }
        buffer = [];
      }
      currentTitle = line.replace('# ', '').trim();
    } else if (line.startsWith('## ') || line.startsWith('### ')) {
      if (buffer.length > 0) {
        const text = buffer.join('\n').trim();
        if (text.length > 30) {
          chunks.push({ title: currentTitle, section: currentSection, text, source: filename });
        }
        buffer = [];
      }
      currentSection = line.replace(/^#+\s*/, '').trim();
    } else {
      buffer.push(line);
    }
  }

  if (buffer.length > 0) {
    const text = buffer.join('\n').trim();
    if (text.length > 30) {
      chunks.push({ title: currentTitle, section: currentSection, text, source: filename });
    }
  }

  return chunks;
}

async function runIngestion() {
  console.log('====================================================');
  console.log(' Kernel Panic AI Assistant — Knowledge Ingestion');
  console.log('====================================================');

  if (!fs.existsSync(knowledgeDir)) {
    console.error(`Error: Knowledge directory not found at ${knowledgeDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(knowledgeDir).filter((f) => f.endsWith('.md'));
  console.log(`Found ${files.length} knowledge markdown file(s): ${files.join(', ')}`);

  const allChunks = [];
  for (const file of files) {
    const filePath = path.join(knowledgeDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const chunks = chunkMarkdown(file, content);
    allChunks.push(...chunks);
  }

  console.log(`Extracted total of ${allChunks.length} semantic chunks.`);
  console.log('Generating multilingual embeddings for chunks...');

  const embeddedChunks = [];
  for (let i = 0; i < allChunks.length; i++) {
    const chunk = allChunks[i];
    const embeddingText = `${chunk.title} - ${chunk.section}\n${chunk.text}`;
    process.stdout.write(`\rEmbedding chunk [${i + 1}/${allChunks.length}]...`);
    const vector = await generateEmbedding(embeddingText);
    embeddedChunks.push({
      id: i + 1,
      title: chunk.title,
      section: chunk.section,
      text: chunk.text,
      source: chunk.source,
      vector
    });
  }
  console.log('\nAll embeddings generated successfully.');

  // Save local fallback index
  fs.writeFileSync(
    localIndexPath,
    JSON.stringify({ generatedAt: new Date().toISOString(), chunks: embeddedChunks }, null, 2),
    'utf-8'
  );
  console.log(`Saved local fallback index with ${embeddedChunks.length} chunks to ${localIndexPath}`);

  // Ingest into Qdrant if available
  console.log(`Attempting to upload to Qdrant at ${config.qdrant.url} (collection: "${config.qdrant.collection}")...`);
  const collectionReady = await ensureCollectionExists();

  if (collectionReady) {
    try {
      const client = getQdrantClient();
      const points = embeddedChunks.map((c) => ({
        id: c.id,
        vector: c.vector,
        payload: {
          title: c.title,
          section: c.section,
          text: c.text,
          source: c.source
        }
      }));

      await client.upsert(config.qdrant.collection, {
        wait: true,
        points
      });
      console.log(`Successfully indexed ${points.length} points in Qdrant!`);
    } catch (err) {
      console.warn(`Warning: Failed to upsert to Qdrant (${err.message}). Local fallback index will be used.`);
    }
  } else {
    console.log('Note: Qdrant was not reachable. Local fallback index will be used seamlessly by RAG service.');
  }

  console.log('Ingestion completed successfully.');
}

runIngestion().catch((err) => {
  console.error('Ingestion failed:', err);
  process.exit(1);
});
