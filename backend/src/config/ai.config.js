module.exports = {
  huggingFace: {
    baseUrl: 'https://api-inference.huggingface.co/models',
    summaryModel: 'facebook/bart-large-cnn',
    embeddingModel: 'sentence-transformers/all-MiniLM-L6-v2'
  },
  gemini: { model: 'gemini-pro' },
  openai: { model: 'gpt-3.5-turbo' }
};
