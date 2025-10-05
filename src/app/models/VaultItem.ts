import mongoose from 'mongoose';

const VaultItemSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  username: { type: String, default: '' },
  encryptedPassword: { type: String, required: true },
  url: { type: String, default: '' },
  encryptedNotes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.models.VaultItem || mongoose.model('VaultItem', VaultItemSchema);
