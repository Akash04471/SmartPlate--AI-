import { GoogleGenerativeAI } from '@google/generative-ai';
import 'dotenv/config';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function test() {
  console.log("Testing Gemini with key:", GEMINI_API_KEY ? "EXISTS" : "MISSING");
  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Say hello");
    console.log("Response:", result.response.text());
  } catch (err) {
    console.error("Gemini Error:", err);
  }
}

test();
