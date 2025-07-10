// routes/returns.js
import Return from '../models/Return.js';
import Customer from '../models/Customer.js';
import Store from '../models/Store.js';
import Manager from '../models/Manager.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Product from '../models/Product.js';

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

const POINTS_MAP = {
  bottle: 5,
  bag: 2,
  box: 3,
  container: 4,
  can: 3,
  jar: 4,
  pouch: 2,
  wrapper: 1,
  crate: 6,
  carton: 3
};
const BADGES = [
  { threshold: 20, name: '♻️ Eco Novice' },
  { threshold: 30, name: '♻️ Eco Hero' },
  { threshold: 50, name: '🌱 Green Hero' },
  { threshold: 100, name: '🌍 Planet Saver' },
  { threshold: 200, name: '🌟 Sustainability Star' },
  { threshold: 350, name: '⚡ Eco Warrior' },
  { threshold: 500, name: '🏅 Guardian of Nature' },
  { threshold: 750, name: '🦸 Zero Waste Champion' },
  { threshold: 1000, name: '🛡️ Earth Defender' }
];

export const getReturnsForMyStore = async (req, res) => {
  try {
    const managerId = req.user._id;
    console.log("Manager ID:", managerId);

    // Find store managed by this manager
    const store = await Store.findOne({ managerId });
    console.log("Store found:", store);

    if (!store) return res.status(404).json({ message: 'Store not found' });

    // Get pending returns for this store
    const returns = await Return.find({ storeId: store._id, status: 'pending' })
      .populate('customerId', 'fullName');
    console.log("Returns fetched:", returns);
    res.json({ returns });
  } catch (err) {
    console.error("getReturnsForMyStore error:", err);
    res.status(500).json({ message: 'Failed to fetch returns', error: err.message });
  }
};



export const approveReturn = async (req, res) => {
  try {
    const manager = req.user;
    const returnDoc = await Return.findById(req.params.id);

    if (!returnDoc || returnDoc.status !== 'pending') {
      return res.status(404).json({ message: 'Return not found or already processed' });
    }

    const customer = await Customer.findById(returnDoc.customerId);
    const points = POINTS_MAP[returnDoc.packagingType] || 1;

    // Update eco impact
    customer.ecoImpact.plasticSavedUnits += 1;
    customer.ecoImpact.pointsEarned = (customer.ecoImpact.pointsEarned || 0) + points;
    customer.ecoImpact.score += points;

    // Assign badge if threshold crossed
    BADGES.forEach(badge => {
      if (
        customer.ecoImpact.pointsEarned >= badge.threshold &&
        !customer.ecoImpact.badges.includes(badge.name)
      ) {
        customer.ecoImpact.badges.push(badge.name);
      }
    });

    await customer.save();

    returnDoc.status = 'approved';
    returnDoc.pointsEarned = points;
    returnDoc.approvedBy = manager._id;
    await returnDoc.save();

    res.json({ message: 'Return approved', return: returnDoc });
  } catch (error) {
    res.status(500).json({ message: 'Approve failed', error: error.message });
  }
};

export const rejectReturn = async (req, res) => {
  try {
    const returnDoc = await Return.findById(req.params.id);
    if (!returnDoc || returnDoc.status !== 'pending') {
      return res.status(404).json({ message: 'Return not found or already processed' });
    }

    returnDoc.status = 'rejected';
    returnDoc.approvedBy = req.user._id;
    returnDoc.adminNotes = req.body.reason || 'Rejected';
    await returnDoc.save();

    res.json({ message: 'Return rejected', return: returnDoc });
  } catch (error) {
    res.status(500).json({ message: 'Reject failed', error: error.message });
  }
};

// GET /api/manager/products
export const getManagerProducts = async (req, res) => {
  const managerId = req.user._id; // store ID assigned to manager
  const store = await Store.findOne({ managerId});
  const products = await Product.find({ storeId: store._id }).populate('storeId');
  res.json(products);
};

export const updateProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const { name, description, price, expiryDate, currentDiscount, status, imageUrl, stockQuantity } = req.body;
        
        // Find the store managed by the current manager/admin
        const store = await Store.findOne({ managerId: req.user._id });
        if (!store) {
            return res.status(404).json({ message: 'Store not found for this manager/admin.' });
        }
        console.log("store",store)
        // Find the product and ensure it belongs to the manager's store
        const product = await Product.findOne({ _id: productId, storeId: store._id });
        const product1 = await Product.findOne({  storeId: store._id });
        const product2 = await Product.findOne({ _id: productId});
        if (!product) {
          console.log("product",product,product1,product2)
          return res.status(404).json({ message: 'Product not found or does not belong to your store.' });
        }

        // Update product fields
        product.name = name;
        product.description = description;
        product.price = price;
        product.expiryDate = new Date(expiryDate); // Ensure date is correctly parsed
        product.currentDiscount = currentDiscount;
        product.status = status;
        product.imageUrl = imageUrl;
        product.stockQuantity = stockQuantity;

        await product.save();
        res.json(product); // Send back the updated product
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

export const markProductAsSoldOut = async (req, res) => {
    try {
        const productId = req.params.id;

        // Find the store managed by the current manager/admin
        const store = await Store.findOne({ managerId: req.user._id });
        if (!store) {
            return res.status(404).json({ message: 'Store not found for this manager/admin.' });
        }

        // Find the product and ensure it belongs to the manager's store
        const product = await Product.findOne({ _id: productId, storeId: store._id });
        if (!product) {
            return res.status(404).json({ message: 'Product not found or does not belong to your store.' });
        }

        product.stockQuantity = 0;
        product.status = 'sold-out'; // Update status to sold-out
        await product.save();

        res.json({ message: 'Product marked as sold out', product });
    } catch (error) {
        console.error('Error marking product as sold out:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};