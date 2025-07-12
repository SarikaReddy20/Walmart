import Product from "../models/Product.js";

const MAX_DISCOUNT = 0.5; // 50%
const MIN_DISCOUNT = 0.0; // 0%

const updateProductStatusAndDiscounts = async () => {
  try {
    const today = new Date();
    const products = await Product.find();

    for (const product of products) {
      const createdAt = new Date(product.createdAt);
      const expiryDate = new Date(product.expiryDate);

      const totalLifetime = expiryDate - createdAt;
      const remainingLifetime = expiryDate - today;

      let status = product.status;
      let currentDiscount = product.currentDiscount;

      if (product.stockQuantity === 0) {
        status = 'sold-out';
        currentDiscount = 0;
      } else if (remainingLifetime <= 0) {
        status = 'expired';
        currentDiscount = MAX_DISCOUNT;
      } else {
        const percentageRemaining = remainingLifetime / totalLifetime;
        const rawDiscount = 1 - percentageRemaining;
        currentDiscount = Math.min(Math.max(rawDiscount, MIN_DISCOUNT), MAX_DISCOUNT);

        const daysLeft = Math.ceil(remainingLifetime / (1000 * 60 * 60 * 24));
        if (daysLeft > 7) {
          status = 'fresh';
        } else if (daysLeft >= 4) {
          status = 'near-expiry';
        } else {
          status = 'expiring-soon';
        }
      }

      product.status = status;
      product.currentDiscount = currentDiscount;
      await product.save();

      console.log(`[UPDATED] ${product.name} | Status: ${status} | Discount: ${(currentDiscount * 100).toFixed(1)}%`);
    }

    console.log(`[CRON] Product discounts and statuses updated at ${new Date().toISOString()}`);
  } catch (err) {
    console.error("Error in updateProductStatusAndDiscounts:", err);
  }
};

export default updateProductStatusAndDiscounts;
