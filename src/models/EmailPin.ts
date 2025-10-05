import mongoose from 'mongoose';

const EmailPinSchema = new mongoose.Schema({
  email: { type: String, required: true, index: true },
  purpose: { type: String, enum: ['register', 'login'], required: true, index: true },
  codeHash: { type: String, required: true },
  passwordHash: { type: String, default: '' }, // used for registration flow only
  consumed: { type: Boolean, default: false, index: true },
  expiresAt: { type: Date, required: true, expires: 0 }, // TTL based on date value
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.EmailPin || mongoose.model('EmailPin', EmailPinSchema);

