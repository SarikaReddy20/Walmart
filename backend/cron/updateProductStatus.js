import Product from "../models/Product.js";

//////////Dynamic Discountssss

const MAX_DISCOUNT = 0.5; // 50% max
const MIN_DISCOUNT = 0.0; // 0% min

const updateProductStatusAndDiscounts = async () => {
  try {
    const products = await Product.find();
    const today = new Date();

    for (const product of products) {
      const created = new Date(product.createdAt);
      const expiry = new Date(product.expiryDate);

      const totalLifetime = expiry - created;
      const remainingLifetime = expiry - today;

      // If already expired
      if (remainingLifetime <= 0) {
        product.status = 'expired';
        product.currentDiscount = MAX_DISCOUNT;
      } else {
        const percentageRemaining = remainingLifetime / totalLifetime;

        // Dynamic discount based on how close to expiry
        const rawDiscount = 1 - percentageRemaining;
        const scaledDiscount = Math.min(Math.max(rawDiscount, MIN_DISCOUNT), MAX_DISCOUNT);

        product.currentDiscount = scaledDiscount;

        // Update status based on remaining days
        const daysLeft = Math.ceil(remainingLifetime / (1000 * 60 * 60 * 24));
        if (daysLeft > 7) {
          product.status = 'fresh';
        } else if (daysLeft >= 4) {
          product.status = 'near-expiry';
        } else {
          product.status = 'expiring-soon';
        }
      }

      await product.save();
      console.log(`Updated ${product.name}: Discount = ${(product.currentDiscount * 100).toFixed(1)}% | Status = ${product.status}  `,totalLifetime,"  ",remainingLifetime," ", );
    }

    console.log(`[CRON] Smart discounts updated at ${new Date().toISOString()}`);
  } catch (err) {
    console.error("Error in smart discount logic:", err);
  }
};

export default updateProductStatusAndDiscounts;
