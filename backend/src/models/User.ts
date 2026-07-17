import { Schema, model, models } from 'mongoose';

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['admin', 'lecturer', 'student'], default: 'student' },
  profilePicture: { type: String },
  phoneNumber: { type: String },
  verified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  loginAttempts: { type: Number, default: 0 },
  lockoutUntil: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Hash password before saving (if modified)
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const bcrypt = await import('bcrypt');
    const salt = await bcrypt.default.genSalt(12);
    this.password = await bcrypt.default.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

const User = models.User || model('User', UserSchema);
export default User;
