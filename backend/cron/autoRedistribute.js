// backend/cron/autoRedistribute.js

import Product from "../models/Product.js";
import Redistribution from "../models/Redistribution.js";
import Forecast from "../models/Forecast.js";

const AUTO_REASON = "Auto redistribution due to imbalance";

// Runs a single pass of auto-redistribution across all stores/products
const autoRedistribute = async () => {
  try {
    const products = await Product.find();

    // Group products by name
    const groups = products.reduce((acc, prod) => {
      const key = prod.name;          
      (acc[key] = acc[key] || []).push(prod);
      return acc;
    }, {});

    for (const [key, items] of Object.entries(groups)) {
      const senders = items.filter(p => p.stockQuantity >= 5);
      if (!senders.length) continue;

      for (const toItem of items) {
        const forecast = await Forecast.findOne({
          productId: toItem._id,
          storeId: toItem.storeId
        });

        const need = forecast?.dailyDemand?.[0]?.predictedUnits || 0;
        if (need <= 0) continue;

        const sender = senders.find(s =>
          s.storeId.toString() !== toItem.storeId.toString() &&
          s.stockQuantity >= need
        );
        if (!sender) continue;

        // ✅ Check if already pending redistribution exists
        const existing = await Redistribution.findOne({
          productId: sender._id,
          fromStore: sender.storeId,
          toStore: toItem.storeId,
          approvedBy: null,
          notes: AUTO_REASON
        });

        if (existing) {
        //   console.log(`[SKIPPED] Pending redistribution already exists for ${key} from Store ${sender.storeId} to Store ${toItem.storeId}`);
          continue;
        }

        // ✅ Create new redistribution
        await Redistribution.create({
          productId: sender._id,
          fromStore: sender.storeId,
          toStore: toItem.storeId,
          quantity: need,
          notes: AUTO_REASON,
        });

        console.log(`[AUTO] ${key}: ${need} units from Store ${sender.storeId} → Store ${toItem.storeId}`);
      }
    }

    console.log(`[CRON] Auto redistribution complete at ${new Date().toISOString()}`);
  } catch (err) {
    console.error("Auto Redistribution Error:", err);
  }
};

export default autoRedistribute;
