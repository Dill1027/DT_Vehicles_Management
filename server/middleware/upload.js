const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure directories exist
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Set up storage for profile images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads/users');
    ensureDirectoryExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Create unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, extension)
      .replace(/\s+/g, '_')  // Replace spaces with underscores
      .replace(/[^\w-]/g, ''); // Remove any non-alphanumeric characters except dashes
    
    cb(null, `${baseName}-${uniqueSuffix}${extension}`);
  }
});

// Filter for image files only
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

// Create multer upload instance with Vercel-optimized limits
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10MB per file (Vercel-optimized)
    fieldSize: 10 * 1024 * 1024, // 10MB field size limit
    fields: 20, // Maximum number of non-file fields
    files: 5 // Maximum 5 files (for 3 vehicle images + extras)
  }
});

// Multiple image upload middleware (up to 3 vehicle images)
const uploadMultipleImages = upload.array('vehicleImages', 3);

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 10MB per image.'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum 3 vehicle images allowed.'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field.'
      });
    }
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`
    });
  } else if (err) {
    return res.status(400).json({
      success: false,
      message: err.message || 'File upload failed'
    });
  }
  next();
};

// Function to delete a file
const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

// Function to get absolute URL for a file
const getFileUrl = (req, relativePath) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  return `${baseUrl}/${relativePath.replace('./uploads/', 'uploads/')}`;
};

module.exports = {
  upload,
  uploadMultipleImages,
  handleMulterError,
  deleteFile,
  getFileUrl,
  ensureDirectoryExists
};
