import mongoose from 'mongoose';

const CodeSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: false },
  claimed: { type: Boolean, default: false },
  claimedBy: { type: String, required: false },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Code || mongoose.model('Code', CodeSchema);
