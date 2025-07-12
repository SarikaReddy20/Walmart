import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import Store from './models/Store.js';
import Manager from './models/Manager.js';
import Customer from './models/Customer.js';
import Return from './models/Return.js';
import Admin from './models/Admin.js';
import Product from './models/Product.js';
import bcrypt from 'bcryptjs';
import connectDB from './config/db.js';

const seed = async () => {
  try {
    await connectDB();

    // Clear existing data
    await Store.deleteMany();
    await Manager.deleteMany();
    await Customer.deleteMany();
    await Return.deleteMany();
    await Admin.deleteMany();
    await Product.deleteMany();

    // Create Admin
    const admin = await Admin.create({
      fullName: 'Super Admin',
      email: 'admin@greenmart.com',
      password: await bcrypt.hash('admin123', 10),
    });

    const managers = [];
    const stores = [];

    // Create 3 stores and managers
    for (let i = 1; i <= 3; i++) {
      const manager = await Manager.create({
        fullName: `Manager ${i}`,
        email: `manager${i}@example.com`,
        password: await bcrypt.hash('manager123', 10),
      });
      managers.push(manager);

      const store = await Store.create({
        name: `EcoMart - Branch ${i}`,
        address: `Location ${i}, Ecotown`,
        managerId: manager._id,
        location: {
          type: 'Point',
          coordinates: [78.48 + i * 0.01, 17.38 + i * 0.01],
        },
      });
      stores.push(store);
    }

    // Create Customer
    const customer = await Customer.create({
      fullName: 'Customer One',
      email: 'customer1@example.com',
      password: await bcrypt.hash('customer123', 10),
      location: {
        type: 'Point',
        coordinates: [78.4869, 17.3851],
      },
      ecoImpact: {
        wasteReducedKg: 2.5,
        plasticSavedUnits: 3,
        score: 15,
        badges: ['Eco Novice'],
        milestones: [
          { name: 'First Return', achieved: true, achievedDate: new Date() },
        ],
      },
    });

    // Create Return Records
    await Return.insertMany([
      {
        customerId: customer._id,
        packagingType: 'bottle',
        status: 'approved',
        pointsEarned: 5,
        approvedBy: managers[0]._id,
        returnedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        customerId: customer._id,
        packagingType: 'box',
        status: 'pending',
        returnedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        customerId: customer._id,
        packagingType: 'jar',
        status: 'rejected',
        adminNotes: 'Cracked packaging',
        returnedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    ]);

    // Create Products
    const productNames = [
      "Organic Apples", "Fresh Milk", "Whole Wheat Bread", "Spinach", "Ground Coffee",
      "Bananas", "Yogurt", "Organic Eggs", "Cheddar Cheese", "Tomatoes", "Carrots",
      "Olive Oil", "Brown Rice", "Pasta", "Orange Juice", "Almond Butter", "Honey",
      "Granola", "Peanut Butter", "Avocados"
    ];

    const products = [];
    for (let i = 0; i < 100; i++) {
      const name = productNames[Math.floor(Math.random() * productNames.length)];
      const price = +(Math.random() * 10 + 1).toFixed(2);
      const currentDiscount = [0, 0.1, 0.2, 0.3, 0.4][Math.floor(Math.random() * 5)];
      const expiryDate = new Date(Date.now() + Math.floor(Math.random() * 60 + 1) * 24 * 60 * 60 * 1000);
      const stockQuantity = Math.floor(Math.random() * 200 + 1);
      const statusOptions = ['fresh', 'near-expiry', 'expiring-soon'];
      const status = statusOptions[Math.floor(Math.random() * statusOptions.length)];
      const store = stores[i % stores.length];

      products.push({
        name,
        price,
        currentDiscount,
        expiryDate,
        stockQuantity,
        status,
        storeId: store._id,
        description: `A fresh pack of ${name}`,
        imageUrl: `https://placehold.co/100x100?text=${name.replace(/ /g, '+')}`,
      });
    }

    await Product.insertMany(products);
    console.log("✅ 100 Products seeded");

    console.log('✅ Seed data inserted successfully');
    process.exit();
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
};

seed();
