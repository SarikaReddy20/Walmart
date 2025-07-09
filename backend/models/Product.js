import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true, min: 0 },
  expiryDate: { type: Date, required: true },
  currentDiscount: { type: Number, default: 0, min: 0, max: 1 },
  status: {
    type: String,
    enum: ['fresh', 'near-expiry', 'expiring-soon', 'expired'],
    default: 'fresh'
  },
  imageUrl: { type: String, default: 'https://placehold.co/100x100/cccccc/000000?text=Product' },
  stockQuantity: { type: Number, required: true, min: 0 },
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

productSchema.index({ expiryDate: 1 });
productSchema.index({ storeId: 1 });

productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
export default Product;
