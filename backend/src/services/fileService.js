const cloudinary = require('../config/cloudinary.config');

async function uploadToCloudinary(localPath, folder = 'study-companion') {
  return cloudinary.uploader.upload(localPath, { folder, resource_type: 'auto' });
}

module.exports = { uploadToCloudinary };
