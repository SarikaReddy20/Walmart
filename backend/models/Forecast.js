import mongoose from 'mongoose';

const forecastSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  dailyDemand: [{ 
    date: { type: Date, required: true },
    predictedUnits: { type: Number, required: true, min: 0 }
  }],
  createdAt: { type: Date, default: Date.now }
});

const Forecast = mongoose.models.Forecast || mongoose.model('Forecast', forecastSchema);
export default Forecast;
