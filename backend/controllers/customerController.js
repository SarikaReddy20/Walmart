import Customer from '../models/Customer.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Return from '../models/Return.js';
import Store from '../models/Store.js';
import Product from '../models/Product.js';

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
  const { fullName, email, password,lat,lng } = req.body;

  const existingCustomer = await Customer.findOne({ email });
  if (existingCustomer) {
    return res.status(400).json({ message: 'Customer already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const customer = await Customer.create({
    fullName,
    email,
    password: hashedPassword,
    location: {
  type: 'Point',
  coordinates: [lng, lat] // Note: GeoJSON uses [longitude, latitude] order!
}

  });
  console.log(customer,lat,lng)
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
  const { fullName, email, profilePic } = req.body;
const customer = await Customer.findById(req.user._id);

if (!customer) {
  return res.status(404).json({ message: 'Customer not found' });
}

customer.fullName = fullName || customer.fullName;
customer.email = email || customer.email;
customer.profilePic = profilePic || customer.profilePic;

await customer.save();

res.json({
  message: 'Customer updated',
  user: {
    _id: customer._id,
    fullName: customer.fullName,
    email: customer.email,
    profilePic: customer.profilePic,
  },
});
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
export const submitReturn = async (req, res) => {
  try {
    const { packagingType } = req.body;
    const customer = req.user;

    // Find nearest store using geo query
    const store = await Store.findOne({
      location: {
        $near: {
          $geometry: customer.location,
          $maxDistance: 5000 // 5km radius
        }
      }
    });

    if (!store) return res.status(404).json({ message: 'No nearby store found' });

   const newReturn = await Return.create({
  customerId: customer._id,
  packagingType,
  storeId: store._id, // ✅ Add this line
  status: 'pending',
  pointsEarned:POINTS_MAP[packagingType]
});


    res.status(201).json({ message: 'Return submitted', return: newReturn });
  } catch (error) {
    res.status(500).json({ message: 'Submit failed', error: error.message });
  }
};


export const getMyReturns = async (req, res) => {
  const returns = await Return.find({ customerId: req.user._id });
  console.log(returns)
  res.json(returns);
};


export const getCustomerImpact = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user._id).select('ecoImpact');
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    console.log("fetching")
    res.json(customer.ecoImpact);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch impact data', error: err.message });
  }
};

// GET /api/customer/products?lat=...&lng=...
function haversine(lat1, lon1, lat2, lon2) {
  const toRad = x => x * Math.PI / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export const getNearestStoreProducts = async (req, res) => {
  try {
    const { lat, lng } = req.query;
    const stores = await Store.find();

    let nearestStore = null;
    let minDistance = Infinity;

    stores.forEach(store => {
      const [storeLng, storeLat] = store.location.coordinates;
      const distance = haversine(lat, lng, storeLat, storeLng);
      console.log(lat, lng, storeLat, storeLng,distance)
      if (distance < minDistance) {
        minDistance = distance;
        nearestStore = store;
      }
    });
    // console.log(stores,nearestStore)
    if (!nearestStore) return res.status(404).json({ message: 'No nearby store found' });

    const products = await Product.find({ storeId: nearestStore._id });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
