const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const OpenAI = require('openai');
const aiConfig = require('../config/ai.config');

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const geminiClient = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

async function retry(fn, retries = 2, delayMs = 500) {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    await new Promise((r) => setTimeout(r, delayMs));
    return retry(fn, retries - 1, delayMs * 2);
  }
}

async function summarizeText(text) {
  const truncated = text.slice(0, 6000);
  if (geminiClient) {
    const model = geminiClient.getGenerativeModel({ model: aiConfig.gemini.model });
    const result = await retry(() => model.generateContent(`Summarize this for a Nigerian university student in concise bullet points:\n${truncated}`));
    return result.response.text();
  }
  const response = await axios.post(
    `${aiConfig.huggingFace.baseUrl}/${aiConfig.huggingFace.summaryModel}`,
    { inputs: truncated },
    { headers: { Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}` } }
  );
  return response.data?.[0]?.summary_text || 'Summary unavailable.';
}

async function extractKeyTopics(text) {
  const summary = await summarizeText(text);
  return summary
    .replace(/[-*]/g, '')
    .split(/[\n,]/)
    .map((x) => x.trim())
    .filter(Boolean)
    .slice(0, 8);
}

async function chatWithAI(message, context = '') {
  if (geminiClient) {
    const model = geminiClient.getGenerativeModel({ model: aiConfig.gemini.model });
    const result = await retry(() => model.generateContent(`Context:\n${context}\n\nUser: ${message}`));
    return result.response.text();
  }
  if (openai) {
    const completion = await retry(() => openai.chat.completions.create({
      model: aiConfig.openai.model,
      messages: [{ role: 'system', content: 'You are a helpful study assistant.' }, { role: 'user', content: `${context}\n${message}` }]
    }));
    return completion.choices[0].message.content;
  }
  return 'AI service not configured.';
}

async function generateQuizQuestions(text, difficulty = 'medium', count = 5) {
  const prompt = `Generate ${count} ${difficulty} multiple choice questions from this text. Return strict JSON array with question, options (4), correctAnswer, explanation, type=multiple_choice, points=1. Text: ${text.slice(0, 5000)}`;
  const raw = await chatWithAI(prompt, 'You are a quiz generator.');
  try {
    return JSON.parse(raw);
  } catch (_e) {
    return [];
  }
}

async function analyzeStudentPerformance(data) {
  const prompt = `Analyze this student performance object and provide strengths, weaknesses and tips in JSON: ${JSON.stringify(data)}`;
  const response = await chatWithAI(prompt);
  return response;
}

async function generateRecommendations(userContext, performance) {
  const prompt = `Generate personalized study recommendations for low-bandwidth Nigerian context. Context: ${JSON.stringify(userContext)} Performance: ${JSON.stringify(performance)} Return concise JSON array.`;
  const response = await chatWithAI(prompt);
  return response;
}

module.exports = { summarizeText, extractKeyTopics, generateQuizQuestions, chatWithAI, analyzeStudentPerformance, generateRecommendations };
