import Manager from '../models/Manager.js';
import Store from '../models/Store.js';
import bcrypt from 'bcryptjs';

// ✅ Admin: Create store + manager together
export const createStoreWithManager = async (req, res) => {
  const {
    storeName,
    storeAddress,
    coordinates,
    contactEmail,
    phoneNumber,
    managerName,
    managerEmail,
    managerPassword
  } = req.body;

  // 1️⃣ Check if manager email exists
  const existingManager = await Manager.findOne({ email: managerEmail });
  if (existingManager) {
    return res.status(400).json({ message: 'Manager email already exists' });
  }

  // 2️⃣ Hash manager password
  const hashedPassword = await bcrypt.hash(managerPassword, 10);

  // 3️⃣ Create manager
  const manager = await Manager.create({
    fullName: managerName,
    email: managerEmail,
    password: hashedPassword
  });

  // 4️⃣ Create store linked to manager
  const store = await Store.create({
    name: storeName,
    address: storeAddress,
    location: {
      type: 'Point',
      coordinates: coordinates
    },
    managerId: manager._id,
    contactEmail,
    phoneNumber
  });

  res.status(201).json({
    message: 'Store and Manager created',
    store,
    manager
  });
};

// ✅ Admin: Get all stores + manager details
export const getStores = async (req, res) => {
  const stores = await Store.find().populate('managerId', '-password');
  res.json(stores);
};

// ✅ Admin: Update store + manager
export const updateStoreAndManager = async (req, res) => {
  const { storeId } = req.params;
  const {
    storeName,
    storeAddress,
    coordinates,
    contactEmail,
    phoneNumber,
    managerName,
    managerEmail
  } = req.body;

  const store = await Store.findById(storeId);
  if (!store) {
    return res.status(404).json({ message: 'Store not found' });
  }

  // Update store fields
  store.name = storeName || store.name;
  store.address = storeAddress || store.address;
  store.location.coordinates = coordinates || store.location.coordinates;
  store.contactEmail = contactEmail || store.contactEmail;
  store.phoneNumber = phoneNumber || store.phoneNumber;

  await store.save();

  // Update manager
  const manager = await Manager.findById(store.managerId);
  if (manager) {
    manager.fullName = managerName || manager.fullName;
    manager.email = managerEmail || manager.email;
    await manager.save();
  }

  res.json({ message: 'Store and Manager updated', store, manager });
};

// ✅ Admin: Delete store + its manager
export const deleteStoreAndManager = async (req, res) => {
  const { storeId } = req.params;

  const store = await Store.findById(storeId);
  if (!store) {
    return res.status(404).json({ message: 'Store not found' });
  }

  // Delete manager
  await Manager.findByIdAndDelete(store.managerId);

  // Delete store
  await store.deleteOne();

  res.json({ message: 'Store and Manager deleted' });
};
