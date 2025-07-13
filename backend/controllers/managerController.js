import bcrypt from 'bcryptjs';
import Manager from '../models/Manager.js';
import Store from '../models/Store.js';
import Product from '../models/Product.js';
import Forecast from '../models/Forecast.js';
import Return from '../models/Return.js';
import Customer from '../models/Customer.js';
import generateToken from '../utils/generateToken.js';
import Redistribution from '../models/Redistribution.js';

// --- AUTH ---

// POST /api/manager/login
export const loginManager = async (req, res) => {
  const { email, password } = req.body;
  const manager = await Manager.findOne({ email });
  if (manager && (await bcrypt.compare(password, manager.password))) {
    res.json({
      _id: manager._id,
      fullName: manager.fullName,
      email: manager.email,
      profilePic: manager.profilePic,
      token: generateToken(manager._id,"manager")
    });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
};

// --- PROFILE ---

// GET /api/manager/profile
export const getManagerProfile = async (req, res) => {
  console.log(req.user)
  res.json({
    _id: req.user._id,
    fullName: req.user.fullName,
    email: req.user.email,
    profilePic: req.user.profilePic
  });
};
export const getStoreProfile = async (req, res) => {
  const store = await Store.findOne({ managerId: req.user._id });
  if (!store) return res.status(404).json({ message: 'Store not found for this manager' });
  res.json(store);
};

// PUT /api/manager/profile
export const updateManagerProfile = async (req, res) => {
  const manager = await Manager.findById(req.user._id);
  if (!manager) {
    return res.status(404).json({ message: 'Manager not found' });
  }
  manager.fullName = req.body.fullName || manager.fullName;
  manager.email = req.body.email || manager.email;
  manager.profilePic = req.body.profilePic || manager.profilePic;
  await manager.save();
  res.json({ message: 'Profile updated', manager });
};

// --- PRODUCTS ---

// POST /api/manager/products
export const addProduct = async (req, res) => {
  try {
    const store = await Store.findOne({ managerId: req.user._id });
    if (!store) return res.status(404).json({ message: 'Store not found for this manager' });

    const { name, description, price, expiryDate, currentDiscount, status, imageUrl, stockQuantity } = req.body;

    const product = await Product.create({
      name,
      description,
      price,
      expiryDate,
      currentDiscount,
      status,
      imageUrl,
      stockQuantity,
      storeId: store._id
    });

    res.status(201).json({ message: 'Product added', product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/manager/products/:productId
export const updateProduct = async (req, res) => {
  try {
    const store = await Store.findOne({ managerId: req.user._id });
    if (!store) return res.status(404).json({ message: 'Store not found for this manager' });

    const product = await Product.findOne({ _id: req.params.productId, storeId: store._id });
    if (!product) return res.status(404).json({ message: 'Product not found in your store' });

    const fields = ['name', 'description', 'price', 'expiryDate', 'currentDiscount', 'status', 'imageUrl', 'stockQuantity'];
    fields.forEach(field => {
      if (req.body[field] !== undefined) product[field] = req.body[field];
    });

    await product.save();
    res.json({ message: 'Product updated', product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/manager/products/:productId
export const deleteProduct = async (req, res) => {
  try {
    const store = await Store.findOne({ managerId: req.user._id });
    if (!store) return res.status(404).json({ message: 'Store not found for this manager' });

    const product = await Product.findOneAndDelete({ _id: req.params.productId, storeId: store._id });
    if (!product) return res.status(404).json({ message: 'Product not found in your store' });

    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markProductAsSoldOut = async (req, res) => {
    try {
        const productId = req.params.productId;

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

// GET /api/manager/store-products
export const getStoreProducts = async (req, res) => {
  try {
    const store = await Store.findOne({ managerId: req.user._id });
    if (!store) return res.status(404).json({ message: 'Store not found for this manager' });

    const products = await Product.find({ storeId: store._id });
    res.json({ products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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

// --- FORECAST ---

// POST /api/manager/forecasts
export const addOrUpdateForecast = async (req, res) => {
  try {
    const store = await Store.findOne({ managerId: req.user._id });
    if (!store) return res.status(404).json({ message: 'Store not found for this manager' });

    const { productId, dailyDemand } = req.body;

    const product = await Product.findOne({ _id: productId, storeId: store._id });
    if (!product) return res.status(404).json({ message: 'Product not found in your store' });

    let forecast = await Forecast.findOne({ productId, storeId: store._id });

    if (forecast) {
      forecast.dailyDemand = dailyDemand;
      await forecast.save();
      return res.json({ message: 'Forecast updated', forecast });
    } else {
      forecast = await Forecast.create({ productId, storeId: store._id, dailyDemand });
      return res.status(201).json({ message: 'Forecast created', forecast });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/manager/forecasts/:forecastId/reduce-demand
export const reduceForecastDemand = async (req, res) => {
  try {
    const store = await Store.findOne({ managerId: req.user._id });
    if (!store) return res.status(404).json({ message: 'Store not found for this manager' });

    const { forecastId } = req.params;
    const { date, units } = req.body;

    const forecast = await Forecast.findOne({ _id: forecastId, storeId: store._id });
    if (!forecast) return res.status(404).json({ message: 'Forecast not found in your store' });

    const demandEntry = forecast.dailyDemand.find(d => new Date(d.date).toISOString() === new Date(date).toISOString());
    if (!demandEntry) return res.status(404).json({ message: 'No demand entry for this date' });

    demandEntry.predictedUnits = Math.max(0, demandEntry.predictedUnits - units);

    forecast.dailyDemand = forecast.dailyDemand.filter(d => d.predictedUnits > 0);

    if (forecast.dailyDemand.length === 0) {
      await Forecast.findByIdAndDelete(forecastId);
      return res.json({ message: 'Forecast deleted (demand zero)' });
    } else {
      await forecast.save();
      return res.json({ message: 'Forecast demand reduced', forecast });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const requestRedistribution = async (req, res) => {
  try {
    const { productId, toStoreId, quantity } = req.body;

    const fromStore = await Store.findOne({ managerId: req.user._id });
    if (!fromStore) return res.status(404).json({ message: 'Your store not found' });

    // Ensure the toStore exists
    const toStore = await Store.findById(toStoreId);
    if (!toStore) return res.status(404).json({ message: 'Target store not found' });

    const redistribution = await Redistribution.create({
      productId,
      fromStore: fromStore._id,
      toStore: toStore._id,
      quantity
    });

    res.status(201).json({ message: 'Redistribution requested', redistribution });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const approveRedistribution = async (req, res) => {
  try {
    const redistribution = await Redistribution.findById(req.params.id)
      .populate('productId')
      .populate('fromStore')
      .populate('toStore');

    if (!redistribution) {
      return res.status(404).json({ message: 'Redistribution request not found.' });
    }

    // ✔️ Ensure logged-in manager is TO store manager:
    if (String(redistribution.toStore.managerId) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden: You do not manage the TO store.' });
    }

    // ✔️ Get product at FROM store
    const fromProduct = await Product.findOne({
      _id: redistribution.productId._id,
      storeId: redistribution.fromStore._id
    });

    if (!fromProduct) {
      return res.status(404).json({ message: 'Product not found in FROM store.' });
    }

    if (fromProduct.stockQuantity < redistribution.quantity) {
      return res.status(400).json({ message: 'Not enough stock in FROM store.' });
    }

    // ✔️ Get product at TO store (or create if it doesn’t exist)
    let toProduct = await Product.findOne({
      name: fromProduct.name,
      storeId: redistribution.toStore._id
    });

    if (!toProduct) {
      // Optional: auto-create the product in TO store if needed
      toProduct = new Product({
        name: fromProduct.name,
        description: fromProduct.description,
        price: fromProduct.price,
        expiryDate: fromProduct.expiryDate,
        currentDiscount: fromProduct.currentDiscount,
        status: fromProduct.status,
        imageUrl: fromProduct.imageUrl,
        stockQuantity: 0,
        storeId: redistribution.toStore._id
      });
    }

    // ✔️ Perform the transfer
    fromProduct.stockQuantity -= redistribution.quantity;
    toProduct.stockQuantity += redistribution.quantity;

    await fromProduct.save();
    await toProduct.save();

    // ✔️ Mark redistribution as completed
    redistribution.status = 'approved';
    await redistribution.save();

    res.status(200).json({ message: 'Redistribution approved and stock transferred.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


export const rejectRedistribution = async (req, res) => {
  try {
    const redistribution = await Redistribution.findById(req.params.id);
    if (!redistribution) return res.status(404).json({ message: 'Redistribution not found' });

    const toStore = await Store.findOne({ _id: redistribution.toStore, managerId: req.user._id });
    if (!toStore) return res.status(403).json({ message: 'You are not authorized to reject for this store' });

    await Redistribution.findByIdAndDelete(redistribution._id);

    res.json({ message: 'Redistribution rejected' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/manager/redistributions/incoming
export const getIncomingRedistributions = async (req, res) => {
  try {
    const myStore = await Store.findOne({ managerId: req.user._id });
    if (!myStore) return res.status(404).json({ message: 'Store not found' });

    const redistributions = await Redistribution.find({ toStore: myStore._id })
      .populate('productId fromStore toStore');

    res.json({ redistributions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/manager/forecasts/need
export const getNeededForecasts = async (req, res) => {
  try {
    const myStore = await Store.findOne({ managerId: req.user._id });
    if (!myStore) return res.status(404).json({ message: 'Your store not found' });

    // Find forecasts where storeId != myStore._id
    const forecasts = await Forecast.find({ storeId: { $ne: myStore._id } })
      .populate('productId')
      .populate('storeId');

    res.json({ forecasts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
