import mongoose from 'mongoose';

const returnSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  packagingType: { type: String, required: true },
  returnedDate: { type: Date, default: Date.now },
  pointsEarned: { type: Number, default: 0, min: 0 },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  adminNotes: { type: String }
}, { timestamps: true });

returnSchema.index({ customerId: 1 });

const Return = mongoose.models.Return || mongoose.model('Return', returnSchema);
export default Return;
