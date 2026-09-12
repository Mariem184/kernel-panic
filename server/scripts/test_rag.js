import { retrieveContext } from '../services/rag/ragService.js';

async function test() {
  console.log('--- TEST 1: English Query ---');
  const q1 = 'What cybersecurity services does your company provide?';
  console.log('Query:', q1);
  const res1 = await retrieveContext(q1, 3);
  console.log('Found relevant context?', res1.hasRelevantKnowledge);
  console.log('Matched chunks count:', res1.chunks.length);
  res1.chunks.forEach((c) => console.log(` - [${c.title} - ${c.section}] (score: ${c.score.toFixed(3)})`));

  console.log('\n--- TEST 2: Arabic Query ---');
  const q2 = 'ما هي خدماتكم في الشبكات وتجهيز السيرفرات؟';
  console.log('Query:', q2);
  const res2 = await retrieveContext(q2, 3);
  console.log('Found relevant context?', res2.hasRelevantKnowledge);
  console.log('Matched chunks count:', res2.chunks.length);
  res2.chunks.forEach((c) => console.log(` - [${c.title} - ${c.section}] (score: ${c.score.toFixed(3)})`));

  console.log('\n--- TEST 3: Contact & Consultation Query ---');
  const q3 = 'كيف احجز استشارة مجانية او اتواصل عبر واتساب؟';
  console.log('Query:', q3);
  const res3 = await retrieveContext(q3, 3);
  console.log('Found relevant context?', res3.hasRelevantKnowledge);
  console.log('Matched chunks count:', res3.chunks.length);
  res3.chunks.forEach((c) => console.log(` - [${c.title} - ${c.section}] (score: ${c.score.toFixed(3)})`));
}

test().catch(console.error);
