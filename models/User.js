import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  bio: { type: String },
  battles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Battle' }],
  rank: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
