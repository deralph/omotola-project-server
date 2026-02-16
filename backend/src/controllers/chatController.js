const { v4: uuidv4 } = require('uuid');
const Chat = require('../models/Chat');
const Material = require('../models/Material');
const asyncHandler = require('../utils/asyncHandler');
const { chatWithAI } = require('../services/aiService');

exports.sendMessage = asyncHandler(async (req, res) => {
  const sessionId = req.body.sessionId || uuidv4();
  const contextMaterialIds = req.body.contextMaterialIds || [];
  const materials = await Material.find({ _id: { $in: contextMaterialIds }, user: req.user._id }).lean();
  const context = materials.map((m) => `${m.title}: ${(m.aiSummary || m.extractedText || '').slice(0, 1000)}`).join('\n');
  const response = await chatWithAI(req.body.message, context);

  const chat = await Chat.findOneAndUpdate(
    { user: req.user._id, sessionId },
    {
      $setOnInsert: { contextMaterials: contextMaterialIds },
      $push: { messages: [{ role: 'user', content: req.body.message }, { role: 'assistant', content: response }] }
    },
    { upsert: true, new: true }
  );
  res.json({ response, sessionId: chat.sessionId });
});

exports.getHistory = asyncHandler(async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 20);
  const chat = await Chat.findOne({ user: req.user._id, sessionId: req.query.sessionId }).lean();
  const messages = chat?.messages || [];
  const start = (page - 1) * limit;
  res.json({ messages: messages.slice(start, start + limit), pagination: { page, limit, total: messages.length } });
});
exports.deleteHistory = asyncHandler(async (req, res) => {
  await Chat.findOneAndDelete({ user: req.user._id, sessionId: req.params.sessionId });
  res.json({ message: 'Chat history deleted' });
});
exports.setContext = asyncHandler(async (req, res) => res.json({ message: 'Context materials set', materialIds: req.body.materialIds || [] }));
