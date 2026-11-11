// The money a new garage can be added with (src/garages.js): US dollars first
// and already picked, then the other currencies of the Americas and Europe,
// and Australia's, Japan's and New Zealand's, and nothing else. A garage saved before in a currency no longer offered is
// still named, typed and shown with its own digits: only the offer changed.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DICTIONARIES } from '../src/i18n/index.js';
import { CURRENCY_CODES, MONEY_PRESELECTED, moneyChoices, moneyWords } from '../src/garages.js';
import { MINOR_UNIT_DIGITS } from '../src/currencyDigits.js';
import { currencyDigits, moneyText, parseMoney, typedMoney } from '../src/rates.js';

const t = (language) => (key) => {
  const text = DICTIONARIES[language][key];
  assert.ok(typeof text === 'string', `${language}: no words for ${key}`);
  return text;
};

// One of every other part of the world, Afghanistan's first.
const ELSEWHERE = ['AFN', 'KRW', 'CNY', 'INR', 'ZAR', 'AED', 'ILS', 'FJD', 'ZWG'];

test('US dollars are listed first and are the money a new garage starts with, in both languages', () => {
  assert.equal(MONEY_PRESELECTED, 'USD');
  for (const language of ['en', 'es']) {
    const choices = moneyChoices(t(language), language);
    assert.equal(choices[0].code, 'USD', language);
    assert.equal(choices[0].words, DICTIONARIES[language]['money.usd'], language);
    assert.equal(choices.filter((c) => c.code === 'USD').length, 1, `${language}: US dollars once`);
  }
});

test('only the Americas, Europe, Australia, Japan and New Zealand are offered: no currency of anywhere else, Afghanistan included', () => {
  assert.equal(CURRENCY_CODES.length, 59);
  for (const language of ['en', 'es']) {
    const offered = moneyChoices(t(language), language).map((c) => c.code);
    // Each offered is of the list. (A code the browser has no name for is left off, as it always was.)
    for (const code of offered) assert.ok(CURRENCY_CODES.includes(code), `${language}: ${code} is offered and is not of the list`);
    assert.ok(offered.length >= CURRENCY_CODES.length - 2, `${language}: only ${offered.length} of ${CURRENCY_CODES.length} offered`);
    for (const code of ELSEWHERE) assert.ok(!offered.includes(code), `${language}: ${code} is offered`);
  }
  for (const code of ['USD', 'CAD', 'MXN', 'BRL', 'EUR', 'GBP', 'CHF', 'NOK', 'TRY', 'AUD', 'JPY', 'NZD']) assert.ok(CURRENCY_CODES.includes(code), code);
});

test('a garage already saved in a currency no longer offered is still named, typed and shown with its own digits', () => {
  // The digits table is the engine's, untouched: every code it had before is still in it.
  for (const code of ELSEWHERE) assert.ok(Object.hasOwn(MINOR_UNIT_DIGITS, code), `${code} left the digits table`);
  assert.equal(currencyDigits('KRW'), 0);
  assert.equal(typedMoney(1200, 'KRW'), '1200');
  assert.equal(parseMoney('1200', 'KRW').minor, 1200);
  assert.equal(moneyText(1200, 'KRW', 'en'), '₩1,200');
  assert.equal(moneyText(1250, 'CNY', 'en'), 'CN¥12.50');
  for (const language of ['en', 'es']) {
    for (const code of ELSEWHERE) assert.ok(moneyWords(t(language), code, language), `${language}: ${code} has no name`);
  }
});
