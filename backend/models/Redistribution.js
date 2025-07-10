import mongoose from 'mongoose';

const redistributionSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  fromStore: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  toStore: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  quantity: { type: Number, required: true, min: 1 },
  transferDate: { type: Date, default: Date.now },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  notes: { type: String }
}, { timestamps: true });

const Redistribution = mongoose.models.Redistribution || mongoose.model('Redistribution', redistributionSchema);
export default Redistribution;
