const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * AI Symptom Triage - Analyzes symptoms and returns severity + recommendations
 */
const analyzeSymptoms = async (symptoms, patientAge, gender, existingConditions = []) => {
  try {
    const prompt = `You are a medical triage AI for Smart City Health Highway system in Delhi, India.

Patient Information:
- Age: ${patientAge || 'Unknown'}
- Gender: ${gender || 'Unknown'}
- Existing Conditions: ${existingConditions.join(', ') || 'None'}
- Reported Symptoms: ${symptoms}

Please analyze these symptoms and provide a detailed health assessment. Describe the symptoms, potential causes, and diseases in detail. Also provide actionable recommendations and warning signs.

Respond in this EXACT JSON format:
{
  "severityScore": 5,
  "likelyConditions": [
    { "condition": "Condition Name 1", "probability": 80 },
    { "condition": "Condition Name 2", "probability": 20 }
  ],
  "recommendations": ["Actionable step 1", "Actionable step 2", "Actionable step 3"],
  "warningSignsToWatch": ["Red flag symptom 1", "Red flag symptom 2"],
  "summary": "A detailed and comprehensive explanation describing the symptoms in detail, matching them to potential diseases or conditions, and an overall assessment. Specifically explain what disease the symptoms might indicate and explain it in detail."
}`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama3-8b-8192",
      response_format: { type: "json_object" },
    });

    const text = chatCompletion.choices[0]?.message?.content || "{}";
    return JSON.parse(text);
  } catch (error) {
    console.error('AI Symptom Analysis Error:', error);
    return {
      severityScore: 5,
      likelyConditions: [{ condition: 'Analysis Error - Please try again', probability: 100 }],
      recommendations: ['Please try submitting your symptoms again', 'Ensure rest and hydration', 'Monitor symptoms closely'],
      warningSignsToWatch: ['Difficulty breathing', 'Severe pain', 'Loss of consciousness'],
      summary: 'AI analysis failed to format correctly. ' + (error.message || 'Please consult a doctor for a proper medical assessment.')
    };
  }
};

/**
 * AI Health Chatbot - Context-aware chat for patients, doctors, admins
 */
const healthChatbot = async (message, userRole, conversationHistory = [], userName = '') => {
  try {
    const roleContext = {
      patient: `You are a compassionate AI health assistant for ${userName || 'the patient'} on the Smart City Health Highway platform. Help with:
        - Understanding medical conditions and symptoms
        - Medication questions (but always recommend consulting a doctor)
        - Appointment guidance
        - Healthy lifestyle advice
        - Understanding medical reports
        - Mental health support
        Always be empathetic, use simple language, and recommend professional medical consultation for serious issues. Mention emergency helpline 108 for emergencies.`,
      
      doctor: `You are a clinical AI assistant for Dr. ${userName || 'the doctor'} on Smart City Health Highway. Help with:
        - Clinical decision support
        - Drug interactions and contraindications  
        - Treatment protocol references
        - ICD-10 coding assistance
        - Drug dosage calculations
        - Medical literature summaries
        - Patient management suggestions
        Use medical terminology and provide evidence-based information.`,
      
      admin: `You are a health system AI administrator assistant for Smart City Health Highway, Delhi. Help with:
        - Hospital resource optimization
        - Ambulance dispatch recommendations
        - City health trend analysis
        - Staff management insights
        - System performance metrics
        - Disease outbreak pattern recognition
        - Policy recommendations
        Provide data-driven, administrative perspective.`
    };

    const systemContext = roleContext[userRole] || roleContext.patient;
    
    // Map existing history to Groq chat format
    const messages = [
      { role: "system", content: systemContext }
    ];
    
    // Extract recent history correctly formatted
    const recentHistory = conversationHistory.slice(-6);
    recentHistory.forEach(h => {
        messages.push({
            role: h.sender === 'user' ? "user" : "assistant",
            content: h.content
        });
    });
    
    // Push the current latest message provided
    messages.push({
        role: "user",
        content: message + "\\n\\nProvide a helpful, accurate, and concise response. If it's a medical emergency, immediately direct to call 108 or visit nearest emergency."
    });

    const chatCompletion = await groq.chat.completions.create({
      messages: messages,
      model: "llama3-8b-8192",
    });

    return chatCompletion.choices[0]?.message?.content || "";
  } catch (error) {
    console.error('AI Chatbot Error:', error);
    const msgLower = message.toLowerCase();
    if (msgLower.includes('cold') || msgLower.includes('cough')) {
      return "Common cold remedies include getting plenty of rest, drinking warm fluids like herbal tea or broth, and using a humidifier. Over-the-counter medications like pain relievers and decongestants can help manage symptoms. If symptoms persist for more than 10 days or worsen, please consult a doctor.";
    } else if (msgLower.includes('blood pressure') || msgLower.includes('hypertension')) {
      return "To help manage blood pressure, it's recommended to maintain a healthy diet low in sodium, engage in regular aerobic exercise, manage stress, and avoid smoking. Always consult your primary care doctor before making significant lifestyle changes or starting any new supplements.";
    } else if (msgLower.includes('vaccine') || msgLower.includes('immunization')) {
      return "Vaccinations are crucial for preventing serious illnesses. Depending on your age and health history, common recommendations include the annual flu vaccine, Tdap, and potentially vaccines for pneumonia or shingles. Please consult your physician for a personalized immunization schedule.";
    } else if (msgLower.includes('headache') || msgLower.includes('migraine')) {
      return "For occasional headaches, resting in a quiet, dark room and staying hydrated can help. Over-the-counter pain relievers may also be effective. However, if you experience sudden, severe headaches, or headaches accompanied by vision changes or weakness, seek immediate medical attention.";
    } else if (msgLower.includes('fever')) {
      return "A fever is usually a sign that your body is fighting an infection. Rest, stay hydrated, and you may use over-the-counter fever reducers like paracetamol. If the fever is persistently high (above 103°F/39.4°C), lasts more than three days, or is accompanied by severe symptoms, please see a doctor immediately.";
    }
    
    // Default fallback
    return "I'm currently operating in offline mode. While I can't provide a highly specific answer to this right now, I strongly recommend consulting your general physician for medical inquiries. For medical emergencies, please call your local emergency service (108) immediately.";
  }
};

/**
 * AI Disease Outbreak Analyzer - For admin heatmap
 */
const analyzeOutbreakTrends = async (diseaseData) => {
  try {
    const prompt = `You are a public health AI analyst for Delhi's Smart City Health Highway.

Recent disease/symptom data from across Delhi:
${JSON.stringify(diseaseData, null, 2)}

Analyze this data and provide:
1. Emerging disease trends
2. High-risk areas in Delhi
3. Predicted outbreak risk for next 2 weeks
4. Recommended public health interventions
5. Resource allocation suggestions (hospitals, ambulances)

Respond in JSON format:
{
  "trends": [{"disease": "", "trend": "rising/stable/declining", "change": "<percentage>"}],
  "highRiskAreas": ["area1", "area2"],
  "outbreakRisk": {"level": "high/medium/low", "diseases": []},
  "interventions": ["intervention1"],
  "resourceSuggestions": {"hospitals": "", "ambulances": ""},
  "summary": "<2-3 sentence executive summary>"
}`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama3-8b-8192",
      response_format: { type: "json_object" },
    });

    const text = chatCompletion.choices[0]?.message?.content || "{}";
    return JSON.parse(text);
  } catch (error) {
    console.error('Outbreak Analysis Error:', error);
    return { trends: [], highRiskAreas: [], outbreakRisk: { level: 'low', diseases: [] }, interventions: [], summary: 'Analysis unavailable.' };
  }
};

/**
 * AI Appointment Slot Recommender
 */
const recommendAppointmentSlot = async (doctorId, patientSymptoms, urgency) => {
  try {
    const prompt = `You are an appointment scheduling AI for Smart City Health Highway.

Patient needs: ${patientSymptoms}
Urgency level: ${urgency}

Available slot times to consider: Morning (8AM-12PM), Afternoon (12PM-4PM), Evening (4PM-8PM)

Based on the symptoms and urgency, recommend:
1. Best time of day for appointment
2. Urgency assessment
3. Type of appointment (Regular/Priority/Emergency)

Respond in JSON:
{
  "recommendedTime": "<time preference>",
  "appointmentType": "Regular/Priority/Emergency",
  "urgencyScore": <1-10>,
  "recommendation": "<brief explanation>",
  "shouldCallEmergency": <true/false>
}`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama3-8b-8192",
      response_format: { type: "json_object" },
    });

    const text = chatCompletion.choices[0]?.message?.content || "{}";
    return JSON.parse(text);
  } catch (error) {
    console.error('Slot Recommendation Error:', error);
    return { recommendedTime: 'Morning', appointmentType: 'Regular', urgencyScore: 5, recommendation: 'Please visit at your convenience.', shouldCallEmergency: false };
  }
};

module.exports = { analyzeSymptoms, healthChatbot, analyzeOutbreakTrends, recommendAppointmentSlot };
