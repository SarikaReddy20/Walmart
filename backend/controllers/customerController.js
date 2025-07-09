import Customer from '../models/Customer.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// 🔐 Generate JWT
const generateToken = (customer) => {
  return jwt.sign(
    { id: customer._id, role: 'customer' },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// ✅ Register
export const registerCustomer = async (req, res) => {
  const { fullName, email, password } = req.body;

  const existingCustomer = await Customer.findOne({ email });
  if (existingCustomer) {
    return res.status(400).json({ message: 'Customer already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const customer = await Customer.create({
    fullName,
    email,
    password: hashedPassword
  });

  const token = generateToken(customer);

  res.status(201).json({
    token,
    customer: {
      _id: customer._id,
      fullName: customer.fullName,
      email: customer.email
    }
  });
};

// ✅ Login
export const loginCustomer = async (req, res) => {
  const { email, password } = req.body;

  const customer = await Customer.findOne({ email });
  if (!customer) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const isMatch = await bcrypt.compare(password, customer.password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const token = generateToken(customer);

  res.json({
    token,
    customer: {
      _id: customer._id,
      fullName: customer.fullName,
      email: customer.email
    }
  });
};

// ✅ Get current customer profile
export const getCustomerProfile = async (req, res) => {
  res.json(req.user); // from protectCustomer
};

// ✅ Update current customer
export const updateCustomer = async (req, res) => {
  const { fullName, password } = req.body;
  const customer = await Customer.findById(req.user._id);

  if (!customer) {
    return res.status(404).json({ message: 'Customer not found' });
  }

  customer.fullName = fullName || customer.fullName;

  if (password) {
    customer.password = await bcrypt.hash(password, 10);
  }

  await customer.save();

  res.json({
    message: 'Customer updated',
    customer: {
      _id: customer._id,
      fullName: customer.fullName,
      email: customer.email
    }
  });
};
