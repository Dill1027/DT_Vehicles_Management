const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = 'uploads/';
    
    // Determine upload path based on file type or route
    if (req.route && req.route.path.includes('vehicles')) {
      uploadPath += 'vehicles/';
    } else if (req.route && req.route.path.includes('maintenance')) {
      uploadPath += 'maintenance/';
    } else if (req.route && req.route.path.includes('users')) {
      uploadPath += 'users/';
    } else {
      uploadPath += 'general/';
    }
    
    ensureDirectoryExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, extension);
    
    cb(null, `${baseName}-${uniqueSuffix}${extension}`);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Check file type
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}`), false);
  }
};

// Image-only filter
const imageFilter = (req, file, cb) => {
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

// Document-only filter
const documentFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only document files are allowed'), false);
  }
};

// File size limits (in bytes)
const fileSizeLimits = {
  image: 5 * 1024 * 1024, // 5MB
  document: 10 * 1024 * 1024, // 10MB
  general: 15 * 1024 * 1024 // 15MB
};

// Create multer instances
const uploadGeneral = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: fileSizeLimits.general,
    files: 10 // Maximum 10 files
  }
});

const uploadImages = multer({
  storage: storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: fileSizeLimits.image,
    files: 5 // Maximum 5 images
  }
});

const uploadDocuments = multer({
  storage: storage,
  fileFilter: documentFilter,
  limits: {
    fileSize: fileSizeLimits.document,
    files: 3 // Maximum 3 documents
  }
});

// Single file upload middleware
const uploadSingle = (fieldName, fileType = 'general') => {
  let uploader;
  
  switch (fileType) {
    case 'image':
      uploader = uploadImages;
      break;
    case 'document':
      uploader = uploadDocuments;
      break;
    default:
      uploader = uploadGeneral;
  }
  
  return uploader.single(fieldName);
};

// Multiple files upload middleware
const uploadMultiple = (fieldName, maxCount = 5, fileType = 'general') => {
  let uploader;
  
  switch (fileType) {
    case 'image':
      uploader = uploadImages;
      break;
    case 'document':
      uploader = uploadDocuments;
      break;
    default:
      uploader = uploadGeneral;
  }
  
  return uploader.array(fieldName, maxCount);
};

// Mixed fields upload middleware
const uploadFields = (fields, fileType = 'general') => {
  let uploader;
  
  switch (fileType) {
    case 'image':
      uploader = uploadImages;
      break;
    case 'document':
      uploader = uploadDocuments;
      break;
    default:
      uploader = uploadGeneral;
  }
  
  return uploader.fields(fields);
};

// File deletion utility
const deleteFile = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('Error deleting file:', err);
        reject(err);
      } else {
        console.log('File deleted successfully:', filePath);
        resolve();
      }
    });
  });
};

// Get file info
const getFileInfo = (filePath) => {
  try {
    const stats = fs.statSync(filePath);
    const extension = path.extname(filePath);
    const baseName = path.basename(filePath, extension);
    
    return {
      exists: true,
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
      extension: extension,
      baseName: baseName,
      fullPath: filePath
    };
  } catch (error) {
    return {
      exists: false,
      error: error.message
    };
  }
};

// Clean up old files
const cleanupOldFiles = (directory, maxAge = 30) => {
  const maxAgeMs = maxAge * 24 * 60 * 60 * 1000; // Convert days to milliseconds
  const now = Date.now();
  
  if (!fs.existsSync(directory)) {
    return;
  }
  
  fs.readdir(directory, (err, files) => {
    if (err) {
      console.error('Error reading directory:', err);
      return;
    }
    
    files.forEach(file => {
      const filePath = path.join(directory, file);
      
      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error('Error getting file stats:', err);
          return;
        }
        
        const fileAge = now - stats.mtime.getTime();
        
        if (fileAge > maxAgeMs) {
          deleteFile(filePath).catch(console.error);
        }
      });
    });
  });
};

// Error handling middleware for multer
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          success: false,
          message: 'File size too large'
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          success: false,
          message: 'Too many files uploaded'
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          success: false,
          message: 'Unexpected file field'
        });
      default:
        return res.status(400).json({
          success: false,
          message: 'File upload error: ' + error.message
        });
    }
  } else if (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  next();
};

// Schedule cleanup (run daily)
setInterval(() => {
  cleanupOldFiles('./uploads/vehicles', 30);
  cleanupOldFiles('./uploads/maintenance', 30);
  cleanupOldFiles('./uploads/users', 30);
  cleanupOldFiles('./uploads/general', 7);
}, 24 * 60 * 60 * 1000);

module.exports = {
  uploadSingle,
  uploadMultiple,
  uploadFields,
  uploadGeneral,
  uploadImages,
  uploadDocuments,
  deleteFile,
  getFileInfo,
  cleanupOldFiles,
  handleUploadError,
  ensureDirectoryExists
};