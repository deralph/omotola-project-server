const Material = require('../models/Material');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { uploadToCloudinary } = require('../services/fileService');
const { summarizeText, extractKeyTopics } = require('../services/aiService');
const { extractTextFromPDF, extractTextFromDOCX, extractTextFromImage } = require('../services/textExtraction');

const detectType = (name) => {
  if (name.endsWith('.pdf')) return 'pdf';
  if (name.endsWith('.docx')) return 'docx';
  if (name.endsWith('.txt')) return 'txt';
  return 'image';
};

exports.uploadMaterial = asyncHandler(async (req, res) => {
  const type = detectType(req.file.originalname.toLowerCase());
  const upload = await uploadToCloudinary(req.file.path, 'materials');
  let extractedText = '';
  if (type === 'pdf') extractedText = await extractTextFromPDF(req.file.path);
  else if (type === 'docx') extractedText = await extractTextFromDOCX(req.file.path);
  else if (type === 'txt') extractedText = require('fs').readFileSync(req.file.path, 'utf8');
  else extractedText = await extractTextFromImage(req.file.path);

  const material = await Material.create({ user: req.user._id, title: req.body.title, subject: req.body.subject, fileType: type, fileUrl: upload.secure_url, fileName: req.file.originalname, fileSize: req.file.size, extractedText, processingStatus: 'completed' });
  res.status(201).json({ material });
});

exports.listMaterials = asyncHandler(async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 10);
  const filter = { user: req.user._id };
  if (req.query.subject) filter.subject = req.query.subject;
  if (req.query.fileType) filter.fileType = req.query.fileType;
  if (req.query.search) filter.title = { $regex: req.query.search, $options: 'i' };
  const [materials, total] = await Promise.all([
    Material.find(filter).sort({ uploadedAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Material.countDocuments(filter)
  ]);
  res.json({ materials, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

exports.getMaterial = asyncHandler(async (req, res) => {
  const material = await Material.findOne({ _id: req.params.id, user: req.user._id });
  if (!material) throw new ApiError(404, 'Material not found');
  res.json({ material });
});
exports.updateMaterial = asyncHandler(async (req, res) => {
  const material = await Material.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, req.body, { new: true });
  if (!material) throw new ApiError(404, 'Material not found');
  res.json({ material });
});
exports.deleteMaterial = asyncHandler(async (req, res) => {
  await Material.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  res.json({ message: 'Material deleted' });
});
exports.getSummary = asyncHandler(async (req, res) => {
  const material = await Material.findOne({ _id: req.params.id, user: req.user._id });
  if (!material) throw new ApiError(404, 'Material not found');
  res.json({ summary: material.aiSummary, keyTopics: material.keyTopics || [] });
});
exports.analyzeMaterial = asyncHandler(async (req, res) => {
  const material = await Material.findOne({ _id: req.params.id, user: req.user._id });
  if (!material) throw new ApiError(404, 'Material not found');
  material.processingStatus = 'processing';
  await material.save();
  const summary = await summarizeText(material.extractedText || material.title);
  const topics = await extractKeyTopics(material.extractedText || material.title);
  material.aiSummary = summary;
  material.keyTopics = topics;
  material.processingStatus = 'completed';
  await material.save();
  res.json({ status: material.processingStatus, summary, topics });
});
