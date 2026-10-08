'use strict';
// js/ui/terms.js — the term matcher behind the Terms & FAQ panel (pure parts; the DOM linker is checked in the selftest).
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadKit } = require('./helpers/load.js');
const KIT = loadKit();
const T = () => KIT.ui.terms;

const ENTRIES = [
  { id: 'nrz', term: 'NRZ', alt: ['non-return-to-zero'] },
  { id: 'nrzi', term: 'NRZ-I', alt: [] },
  { id: 'man', term: 'Manchester', alt: [] },
  { id: 'dman', term: 'Differential Manchester', alt: [] },
  { id: '4b5b', term: '4B/5B', alt: [] },
  { id: 'ami', term: 'AMI', alt: ['alternate mark inversion'] },
  { id: 'se', term: 'Signal element', alt: [] },
  { id: 'cf', term: 'Case factor (c)', alt: [] },
  { id: 'nrzfull', term: 'Non-return-to-zero level (NRZ-L)', alt: [] },
  { id: 'x', term: 'X', alt: [] }
];
function hits(text) { return T().find(text, T().forms(ENTRIES)).map((m) => text.slice(m.start, m.end) + '=' + m.id); }

test('forms(): names, alt names, parentheticals stripped, abbreviation in brackets kept, single letters dropped', () => {
  const f = T().forms(ENTRIES);
  const names = f.map((x) => x.s);
  assert.ok(names.includes('Case factor') && !names.includes('Case factor (c)') && !names.includes('c'));
  assert.ok(names.includes('NRZ-L'), 'an abbreviation in brackets becomes a form of its own');
  assert.ok(!names.includes('X'), 'single letters are never linked');
  assert.equal(f.find((x) => x.s === 'AMI').cs, true, 'abbreviations are case-sensitive');
  assert.equal(f.find((x) => x.s === 'Signal element').cs, false);
});

test('find(): whole terms only, longest first', () => {
  assert.deepEqual(hits('NRZ-I inverts on a 1; plain NRZ does not.'), ['NRZ-I=nrzi', 'NRZ=nrz']);
  assert.deepEqual(hits('Differential Manchester and Manchester'), ['Differential Manchester=dman', 'Manchester=man']);
  assert.deepEqual(hits('4B/5B then NRZ-I'), ['4B/5B=4b5b', 'NRZ-I=nrzi']);
  assert.deepEqual(hits('4B and 5B alone'), []);
  assert.deepEqual(hits('NRZ-L is drawn'), ['NRZ-L=nrzfull']);
});

test('find(): case rules and plurals', () => {
  assert.deepEqual(hits('AMI pulses'), ['AMI=ami']);
  assert.deepEqual(hits('Miami and ami'), [], 'case-sensitive abbreviations, word boundaries');
  assert.deepEqual(hits('two signal elements per bit'), ['signal elements=se'], 'plurals of ordinary terms');
  assert.deepEqual(hits('the case factor is ½'), ['case factor=cf']);
  assert.deepEqual(hits('Alternate Mark Inversion'), ['Alternate Mark Inversion=ami'], 'long alt names ignore case');
});

test('index(): every glossary and walkthrough term, with its topic', () => {
  const idx = T().index();
  const glossary = KIT.topics().reduce((n, t) => n + (t.glossary || []).length, 0);
  const walk = KIT.walks().reduce((n, w) => n + w.terms.length, 0);
  assert.equal(idx.length, glossary + walk);
  assert.ok(idx.every((e) => e.id && e.term && e.def && KIT.TOPIC_IDS.includes(e.topic)));
});
