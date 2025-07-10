import cron from"node-cron";
import updateProductStatusAndDiscounts from "./cron/updateProductStatus.js";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js"; // Import your DB connection
import adminRoutes from './routes/adminRoutes.js';
import managerRoutes from './routes/managerRoutes.js';
import customerRoutes from './routes/customerRoutes.js';


dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api/admin', adminRoutes);
app.use('/api/manager', managerRoutes);
app.use('/api/customer', customerRoutes);


// Example root route (can remove later)
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Run daily at 1am///////////DYNAMIC DISCOUNTS
cron.schedule("0 1 * * *", async () => {
  console.log("[CRON] Running daily product update job...");
  await updateProductStatusAndDiscounts();
});
// updateProductStatusAndDiscounts()
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
