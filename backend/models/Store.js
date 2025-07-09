import mongoose from 'mongoose';

const storeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  address: { type: String, required: true },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  managerId: { // ✅ The store’s assigned manager
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Manager',
    required: true
  },
  contactEmail: { type: String },
  phoneNumber: { type: String }
}, { timestamps: true });

storeSchema.index({ location: '2dsphere' });

const Store = mongoose.models.Store || mongoose.model('Store', storeSchema);
export default Store;
