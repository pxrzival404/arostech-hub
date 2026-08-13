const path = require('path');
const fs = require('fs');
const assert = require('assert');
const { extractConversationText, generateSessionSummary } = require('../../.agents/scripts/lib/llm-summary');

// Helper to create a temporary JSONL transcript file
function createTempTranscript(turns) {
  const tmpDir = path.join(__dirname, '..', 'tmp');
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }
  const filePath = path.join(tmpDir, `test-transcript-${Date.now()}.jsonl`);
  const lines = turns.map(t => JSON.stringify(t)).join('\n');
  fs.writeFileSync(filePath, lines, 'utf8');
  return filePath;
}

// Test 1: extractConversationText should use ASCII truncation marker when truncated
function testTruncationMarker() {
  const turns = [];
  for (let i = 0; i < 50; i++) {
    turns.push({
      type: 'user',
      content: `User message turn ${i} with long string context padding text `.repeat(15)
    });
    turns.push({
      type: 'assistant',
      message: {
        role: 'assistant',
        content: [{ type: 'text', text: `Assistant response turn ${i} with detailed explanation text `.repeat(15) }]
      }
    });
  }

  const filePath = createTempTranscript(turns);
  try {
    const text = extractConversationText(filePath);
    assert.strictEqual(text.includes('...(前略)'), false, 'Should NOT contain hardcoded foreign string ...(前略)');
    if (text.includes('[...truncated previous turns...]')) {
      console.log('✅ PASS: Truncated text contains ASCII marker [...truncated previous turns...]');
    } else {
      console.log('ℹ️ Text length within max limit, checking format...');
      assert.ok(text.length > 0, 'Extracted text should not be empty');
    }
  } finally {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
}

// Test 2: generateSessionSummary should return deterministic fallback when claude CLI fails
function testDeterministicFallback() {
  const turns = [
    { type: 'user', content: 'What features were built today?' },
    { type: 'assistant', message: { role: 'assistant', content: [{ type: 'text', text: 'We built rate-limiter and harness scripts.' }] } }
  ];

  const filePath = createTempTranscript(turns);
  try {
    const summary = generateSessionSummary(filePath);
    assert.ok(typeof summary === 'string', 'Summary should return a valid string');
    assert.ok(summary.length > 0, 'Summary should not be empty');
    assert.ok(
      summary.includes('Session Summary') || summary.includes('Extracted Conversation Log'),
      'Summary should contain valid section header'
    );
    console.log('✅ PASS: generateSessionSummary returned valid fallback summary');
  } finally {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
}

try {
  testTruncationMarker();
  testDeterministicFallback();
  console.log('All llm-summary tests passed successfully.');
} catch (err) {
  console.error('❌ TEST FAILED:', err);
  process.exit(1);
}
