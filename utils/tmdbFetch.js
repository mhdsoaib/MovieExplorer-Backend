const fs = require('fs');
const path = require('path');

const fetchWithFallback = async (apiFn, fallbackPath, retries = 3) => {
  try {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const res = await apiFn();
        return res.data || res;
      } catch (err) {
        console.warn(`⚠️ Attempt ${attempt} failed`);
        if (attempt === retries) throw err;
        await new Promise(res => setTimeout(res, 500)); // wait before retry
      }
    }
  } catch (err) {
    console.warn(`🔁 Using fallback for ${fallbackPath}`);
    const filePath = path.resolve(__dirname, fallbackPath);
    const rawData = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(rawData);
  }
};

module.exports = { fetchWithFallback };
