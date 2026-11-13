import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeProductKey, getProductBrandMeta, PRODUCT_BRAND_CONFIG } from './productIdentity';

test('normalizeProductKey accurately normalizes various product identifiers and names', () => {
  // ChatGPT variations
  assert.equal(normalizeProductKey('chatgpt-premium'), 'chatgpt');
  assert.equal(normalizeProductKey('chatgpt'), 'chatgpt');
  assert.equal(normalizeProductKey('ChatGPT Premium'), 'chatgpt');
  assert.equal(normalizeProductKey('GPT'), 'chatgpt');
  assert.equal(normalizeProductKey('openai'), 'chatgpt');

  // Claude variations
  assert.equal(normalizeProductKey('claude-ai'), 'claude');
  assert.equal(normalizeProductKey('claude'), 'claude');
  assert.equal(normalizeProductKey('Claude AI'), 'claude');
  assert.equal(normalizeProductKey('anthropic'), 'claude');

  // QuillBot variations
  assert.equal(normalizeProductKey('quillbot-pro'), 'quillbot');
  assert.equal(normalizeProductKey('quillbot'), 'quillbot');
  assert.equal(normalizeProductKey('QuillBot Pro'), 'quillbot');
  assert.equal(normalizeProductKey('quill'), 'quillbot');

  // Stealth Writer variations
  assert.equal(normalizeProductKey('stealth-writer'), 'stealth');
  assert.equal(normalizeProductKey('stealth'), 'stealth');
  assert.equal(normalizeProductKey('Stealth Writer'), 'stealth');

  // Turnitin variations
  assert.equal(normalizeProductKey('turnitin-instructor'), 'turnitin');
  assert.equal(normalizeProductKey('turnitin'), 'turnitin');
  assert.equal(normalizeProductKey('Turnitin Instructor'), 'turnitin');

  // Unknown / null
  assert.equal(normalizeProductKey(''), null);
  assert.equal(normalizeProductKey(null), null);
  assert.equal(normalizeProductKey('random-tool-id'), null);
});

test('getProductBrandMeta returns correct brand configuration for each tool', () => {
  const gptMeta = getProductBrandMeta('chatgpt-premium');
  assert.ok(gptMeta);
  assert.equal(gptMeta?.brandColor, '#10a37f');
  assert.equal(gptMeta?.symbolHref, '#brand-openai');

  const claudeMeta = getProductBrandMeta('Claude AI');
  assert.ok(claudeMeta);
  assert.equal(claudeMeta?.brandColor, '#d7764d');

  const quillMeta = getProductBrandMeta('quillbot-pro');
  assert.ok(quillMeta);
  assert.equal(quillMeta?.brandColor, '#21a36a');

  const stealthMeta = getProductBrandMeta('Stealth Writer');
  assert.ok(stealthMeta);
  assert.equal(stealthMeta?.brandColor, '#9b4cf5');

  const turnitinMeta = getProductBrandMeta('turnitin');
  assert.ok(turnitinMeta);
  assert.equal(turnitinMeta?.brandColor, '#0863ae');
});
