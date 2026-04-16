import { GoogleGenerativeAI } from '@google/generative-ai';
import 'dotenv/config';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function testNeural() {
  console.log("Testing Pure Neural Estimation for '150ml milk'...");
  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Act as a clinical nutritionist. Analyze '150ml milk' and provide a JSON array of components with macros. 
    Format: [{"name": "milk", "quantity": 150, "unit": "ml", "calories": 63, "protein": 5, "fat": 2, "carbs": 7, "fiber": 0}]`;
    
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    console.log("AI Response:", responseText);
    const json = JSON.parse(responseText.match(/\[[\s\S]*\]/)[0]);
    console.log("Parsed Macros:", json[0]);
  } catch (err) {
    console.error("Neural Test Failed:", err);
  }
}

testNeural();
