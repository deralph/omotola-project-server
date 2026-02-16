const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const Tesseract = require('tesseract.js');

const extractTextFromPDF = async (filePath) => (await pdfParse(fs.readFileSync(filePath))).text;
const extractTextFromDOCX = async (filePath) => (await mammoth.extractRawText({ path: filePath })).value;
const extractTextFromImage = async (filePath) => (await Tesseract.recognize(filePath, 'eng')).data.text;

module.exports = { extractTextFromPDF, extractTextFromDOCX, extractTextFromImage };
