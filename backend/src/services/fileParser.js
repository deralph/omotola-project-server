const path = require('path');
const fs = require('fs');

async function parseFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  try {
    if (ext === '.pdf') return await parsePDF(filePath);
    if (ext === '.docx') return await parseDOCX(filePath);
    if (['.txt', '.md'].includes(ext)) return fs.readFileSync(filePath, 'utf8');
    if (['.png', '.jpg', '.jpeg'].includes(ext)) return `[Image: ${path.basename(filePath)}]`;
    return null;
  } catch (err) {
    console.error('File parse error:', err.message);
    return null;
  }
}

async function parsePDF(filePath) {
  const pdfParse = require('pdf-parse');
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(dataBuffer);
  return data.text;
}

async function parseDOCX(filePath) {
  const mammoth = require('mammoth');
  const result = await mammoth.extractRawText({ path: filePath });
  return result.value;
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

module.exports = { parseFile, formatFileSize };
