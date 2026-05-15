import 'dotenv/config';

const EDAMAM_APP_ID = process.env.EDAMAM_APP_ID;
const EDAMAM_APP_KEY = process.env.EDAMAM_APP_KEY;
const EDAMAM_FOOD_DB_URL = 'https://api.edamam.com/api/food-database/v2/parser';

async function test() {
  console.log("Testing Edamam with ID:", EDAMAM_APP_ID ? "EXISTS" : "MISSING");
  try {
    const searchUrl = `${EDAMAM_FOOD_DB_URL}?app_id=${EDAMAM_APP_ID}&app_key=${EDAMAM_APP_KEY}&ingr=milk&nutrition-type=logging`;
    const response = await fetch(searchUrl);
    console.log("Status:", response.status);
    const data = await response.json();
    console.log("Data hints count:", data.hints?.length || 0);
  } catch (err) {
    console.error("Edamam Error:", err);
  }
}

test();
