import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import Manager from '../models/Manager.js';
import Customer from '../models/Customer.js';

// --- Reusable Token Extractor ---
const extractToken = (req) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1]; // Return only token part
  }
  return null;
};

// --- Shared JWT Verification ---
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

// --- Protect Admin ---
export const protectAdmin = async (req, res, next) => {
  const token = extractToken(req);
  console.log("Admin route hit");
  console.log("Authorization Header:", req.headers.authorization);
  console.log("Extracted Token:", token);
  console.log("JWT_SECRET:", process.env.JWT_SECRET);

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = verifyToken(token);
    const admin = await Admin.findById(decoded.id).select('-password');

    if (admin) {
      req.user = admin;
      next();
    } else {
      res.status(403).json({ message: 'Not authorized as admin' });
    }
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

// --- Protect Manager ---
export const protectManager = async (req, res, next) => {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = verifyToken(token);
    const manager = await Manager.findById(decoded.id).select('-password');

    if (manager) {
      req.user = manager;
      next();
    } else {
      res.status(403).json({ message: 'Not authorized as manager' });
    }
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

// --- Protect Customer ---
export const protectCustomer = async (req, res, next) => {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = verifyToken(token);
    const customer = await Customer.findById(decoded.id).select('-password');

    if (customer) {
      req.user = customer;
      next();
    } else {
      res.status(403).json({ message: 'Not authorized as customer' });
    }
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};
