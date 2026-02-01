const fs = require('fs');
const path = require('path');

const locales = ['pl', 'en', 'fr', 'de', 'ro', 'it'];
const transDir = 'i18n/translations';

// Helper to flatten object keys
function flattenKeys(obj, prefix = '') {
  let keys = [];
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      keys = keys.concat(flattenKeys(obj[key], prefix + key + '.'));
    } else {
      keys.push(prefix + key);
    }
  }
  return keys;
}

// Read all files
const files = {};
locales.forEach(loc => {
  try {
    const content = fs.readFileSync(path.join(transDir, `${loc}.json`), 'utf8');
    files[loc] = JSON.parse(content);
  } catch (e) {
    console.log(`Could not read ${loc}.json`);
  }
});

const baseKeys = flattenKeys(files['pl']); // Use PL as base

locales.forEach(loc => {
  if (loc === 'en') return;
  const locKeys = flattenKeys(files[loc]);
  const missing = baseKeys.filter(k => !locKeys.includes(k));
  if (missing.length > 0) {
    console.log(`Missing in ${loc}:`, missing);
  } else {
    console.log(`${loc} is complete.`);
  }
});

