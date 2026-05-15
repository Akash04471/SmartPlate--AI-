import 'dotenv/config';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function testRaw() {
  console.log("Testing Raw Gemini API with Fetch...");
  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Say hello" }] }]
      })
    });
    
    console.log("Status:", response.status);
    console.log("Status Text:", response.statusText);
    const data = await response.json();
    console.log("Data:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Raw Test Failed:", err);
  }
}

testRaw();
