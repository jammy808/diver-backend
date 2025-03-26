const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./cloudnary');

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'user_images', // folder in Cloudinary
    allowed_formats: ['jpeg', 'png', 'jpg', 'pdf'],
  },
});

const upload = multer({ storage });
module.exports = upload;