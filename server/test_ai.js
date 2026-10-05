require('dotenv').config({path: 'd:/smart-city-health-highway/server/.env'});
const { analyzeSymptoms } = require('d:/smart-city-health-highway/server/src/services/ai.service.js');

async function run() {
  try {
    const result = await analyzeSymptoms("I have headache, fever, running nose for 3 days", 25, "male", []);
    console.log("Result:", result);
  } catch (e) {
    console.log("Global error:", e);
  }
}
run();
