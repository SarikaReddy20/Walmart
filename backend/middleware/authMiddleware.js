import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import Manager from '../models/Manager.js';
import Customer from '../models/Customer.js';

// --- Protect Admin Routes ---
export const protectAdmin = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const admin = await Admin.findById(decoded.id).select('-password');

      if (admin && decoded.role === 'admin') {
        req.user = admin;
        next();
      } else {
        res.status(403).json({ message: 'Not authorized as admin' });
      }
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// --- Protect Manager Routes ---
export const protectManager = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const manager = await Manager.findById(decoded.id).select('-password');

      if (manager && decoded.role === 'manager') {
        req.user = manager;
        next();
      } else {
        res.status(403).json({ message: 'Not authorized as manager' });
      }
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// --- Protect Customer Routes ---
export const protectCustomer = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const customer = await Customer.findById(decoded.id).select('-password');

      if (customer && decoded.role === 'customer') {
        req.user = customer;
        next();
      } else {
        res.status(403).json({ message: 'Not authorized as customer' });
      }
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};
