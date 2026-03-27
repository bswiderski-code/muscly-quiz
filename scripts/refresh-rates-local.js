/**
 * Local: POST /api/exchange-rates using EXCHANGE_RATE_APIKEY from .env
 * (matches dev server port: 3003 from package.json "dev", or PORT env)
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const key = process.env.EXCHANGE_RATE_APIKEY;
const port = process.env.PORT || '3003';

if (!key) {
  console.error('Set EXCHANGE_RATE_APIKEY in .env');
  process.exit(1);
}

const url = `http://127.0.0.1:${port}/api/exchange-rates`;

fetch(url, {
  method: 'POST',
  headers: { 'X-Admin-Secret': key },
})
  .then(async (res) => {
    const body = await res.text();
    console.log(body);
    if (!res.ok) process.exit(1);
  })
  .catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
