require('dotenv').config();
const { healthChatbot } = require('./src/services/ai.service');

async function testAI() {
  try {
    console.log("Testing healthChatbot...");
    const response = await healthChatbot("What are common cold remedies?", "patient");
    console.log("AI Response: ", response);
  } catch (err) {
    console.error("AI Error: ", err);
  }
}

testAI();
