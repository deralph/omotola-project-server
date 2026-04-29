const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;

function getModel() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      throw new Error('GEMINI_API_KEY not set. Get a free key at https://aistudio.google.com');
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
}

async function chatWithContext(userMessage, materialTexts = [], chatHistory = []) {
  const model = getModel();

  const systemContext = materialTexts.length > 0
    ? `You are StudyAI, an intelligent academic assistant for students at Adekunle Ajasin University (AAUA), Nigeria. You have access to the student's uploaded study materials. Answer questions based on these materials whenever relevant. Be helpful, clear, and encouraging.\n\nUPLOADED MATERIALS:\n${materialTexts.join('\n---\n').substring(0, 8000)}`
    : `You are StudyAI, an intelligent academic assistant for AAUA students in Nigeria. Be helpful, clear, and encouraging with academic questions.`;

  const history = chatHistory.slice(-10).map(msg => ({
    role: msg.role === 'ai' ? 'model' : 'user',
    parts: [{ text: msg.content }],
  }));

  const chat = model.startChat({ history, systemInstruction: systemContext });
  const result = await chat.sendMessage(userMessage);
  return result.response.text();
}

async function generateQuiz(materialText, subject, questionCount = 10) {
  const model = getModel();

  const prompt = `Generate exactly ${questionCount} quiz questions based on this study material about "${subject}".

MATERIAL:
${materialText.substring(0, 6000)}

Return ONLY a valid JSON array (no markdown, no extra text):
[
  {
    "id": "1",
    "question": "Question text?",
    "type": "multiple-choice",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Option A",
    "explanation": "Brief explanation"
  }
]

Mix: 70% multiple-choice, 20% true-false (options: ["True","False"]), 10% short-answer (no options field).
Test understanding, not just memorization.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error('AI returned invalid quiz format');
  return JSON.parse(jsonMatch[0]);
}

async function summarizeText(text) {
  const model = getModel();

  const prompt = `Summarize the following study notes into a structured academic summary in Markdown format.

TEXT:
${text.substring(0, 8000)}

Provide:
## Overview
(2-3 sentence overview)

## Key Concepts
- bullet points

## Important Definitions / Formulas
- bullet points

## Exam Tips
- bullet points

Keep it concise but comprehensive.`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

async function generateStudyPlan(examDate, subject, userLevel, weakAreas = []) {
  const model = getModel();

  const today = new Date();
  const exam = new Date(examDate);
  const daysLeft = Math.max(1, Math.ceil((exam - today) / (1000 * 60 * 60 * 24)));
  const planDays = Math.min(daysLeft, 30);

  const prompt = `Create a day-by-day study plan for an AAUA student.

Details:
- Subject: ${subject || 'General Studies'}
- Days until exam: ${daysLeft}
- Student level: ${userLevel}
- Weak areas: ${weakAreas.length > 0 ? weakAreas.join(', ') : 'None specified'}

Generate a plan for ${planDays} days. Return ONLY a valid JSON array:
[
  {
    "day": 1,
    "date": "Mon, Apr 21",
    "topics": ["Topic 1", "Topic 2"],
    "hours": 2.5,
    "type": "study"
  }
]

Rules:
- Types: "study", "revision", "practice", "rest"
- Sundays should be "rest" (1 hour light review)
- Every 5th day: revision
- Every 3rd day: practice
- Last 2 days before exam: revision only
- Hours: 1-4 per day`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error('AI returned invalid study plan format');
  return JSON.parse(jsonMatch[0]);
}

async function generateRecommendations(quizAttempts, materials, userDepartment) {
  const model = getModel();

  const weakAreas = quizAttempts
    .filter(a => a.percentage < 70)
    .map(a => `${a.quiz_title} (${Math.round(a.percentage)}%)`);

  const subjects = [...new Set(materials.map(m => m.subject).filter(Boolean))];

  const prompt = `Generate 5 personalized study recommendations for a ${userDepartment || 'university'} student at AAUA, Nigeria.

Recent weak quiz areas:
${weakAreas.length > 0 ? weakAreas.join('\n') : 'No quiz data yet — suggest foundational topics'}

Student's subjects:
${subjects.length > 0 ? subjects.join(', ') : 'Computer Science'}

Return ONLY a valid JSON array:
[
  {
    "topic": "Topic name",
    "subject": "Subject area",
    "estimatedTime": "30 min",
    "difficulty": "Medium",
    "reason": "Why this is recommended",
    "priority": "high"
  }
]

Priority: "high", "medium", or "low". Difficulty: "Easy", "Medium", or "Hard".`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error('AI returned invalid recommendations format');
  return JSON.parse(jsonMatch[0]);
}

module.exports = { chatWithContext, generateQuiz, summarizeText, generateStudyPlan, generateRecommendations };
