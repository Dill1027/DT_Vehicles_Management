const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { asyncHandler } = require('./database');

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// Hash password
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Compare password
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Protect routes middleware
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
});

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

// Rate limiting utility
const rateLimitMap = new Map();

const rateLimit = (windowMs = 15 * 60 * 1000, max = 100) => {
  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();
    
    if (!rateLimitMap.has(key)) {
      rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    const record = rateLimitMap.get(key);
    
    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + windowMs;
      return next();
    }
    
    if (record.count >= max) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests, please try again later.'
      });
    }
    
    record.count++;
    next();
  };
};

// Clean up expired rate limit entries
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 15 * 60 * 1000); // Clean up every 15 minutes

// Password reset token generation
const generateResetToken = () => {
  const resetToken = Math.random().toString(36).substring(2, 15) + 
                   Math.random().toString(36).substring(2, 15);
  
  const hashedToken = require('crypto')
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  return { resetToken, hashedToken };
};

// Email verification token
const generateVerificationToken = () => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

// Session management
const sessions = new Map();

const createSession = (userId, userAgent, ip) => {
  const sessionId = Math.random().toString(36).substring(2, 15) + 
                   Math.random().toString(36).substring(2, 15);
  
  const session = {
    userId,
    userAgent,
    ip,
    createdAt: new Date(),
    lastActivity: new Date()
  };
  
  sessions.set(sessionId, session);
  return sessionId;
};

const validateSession = (sessionId) => {
  return sessions.has(sessionId);
};

const updateSessionActivity = (sessionId) => {
  if (sessions.has(sessionId)) {
    sessions.get(sessionId).lastActivity = new Date();
  }
};

const destroySession = (sessionId) => {
  sessions.delete(sessionId);
};

const cleanupExpiredSessions = () => {
  const now = new Date();
  const expireTime = 24 * 60 * 60 * 1000; // 24 hours
  
  for (const [sessionId, session] of sessions.entries()) {
    if (now - session.lastActivity > expireTime) {
      sessions.delete(sessionId);
    }
  }
};

// Clean up expired sessions every hour
setInterval(cleanupExpiredSessions, 60 * 60 * 1000);

// Input sanitization
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

const sanitizeObject = (obj) => {
  const sanitized = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};

module.exports = {
  generateToken,
  hashPassword,
  comparePassword,
  protect,
  authorize,
  rateLimit,
  generateResetToken,
  generateVerificationToken,
  createSession,
  validateSession,
  updateSessionActivity,
  destroySession,
  cleanupExpiredSessions,
  sanitizeInput,
  sanitizeObject
};
