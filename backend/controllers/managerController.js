import Manager from '../models/Manager.js';
import Store from '../models/Store.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const loginManager = async (req, res) => {
  const { email, password } = req.body;

  const manager = await Manager.findOne({ email });
  if (!manager) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const isMatch = await bcrypt.compare(password, manager.password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const token = jwt.sign(
    { id: manager._id, role: 'manager' },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    token,
    manager: {
      _id: manager._id,
      fullName: manager.fullName,
      email: manager.email
    }
  });
};


// 🔐 Get Manager Profile (protected)
export const getManagerProfile = async (req, res) => {
  const manager = req.user; // From protectManager middleware
  res.json(manager);
};

// ✏️ Update Manager Profile (protected)
export const updateManagerProfile = async (req, res) => {
  const manager = await Manager.findById(req.user._id);

  if (!manager) {
    return res.status(404).json({ message: 'Manager not found' });
  }

  const { fullName, email, password } = req.body;

  if (fullName) manager.fullName = fullName;
  if (email) manager.email = email;
  if (password) {
    manager.password = await bcrypt.hash(password, 10);
  }

  await manager.save();

  res.json({ message: 'Manager profile updated', manager });
};

// 📍 Get Store assigned to this manager (protected)
export const getMyStore = async (req, res) => {
  const store = await Store.findOne({ managerId: req.user._id });

  if (!store) {
    return res.status(404).json({ message: 'Store not found' });
  }

  res.json(store);
};
