import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IAdmin {
  email: string;
  password: string;
  role: 'admin';
}

export interface IAdminDocument extends IAdmin, Document {
  comparePassword(candidate: string): Promise<boolean>;
}

const AdminSchema = new Schema<IAdminDocument>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin'], default: 'admin' },
  },
  {
    timestamps: true,
  }
);

AdminSchema.pre('save', async function hashPassword(next) {
  const admin = this as IAdminDocument;
  if (!admin.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  admin.password = await bcrypt.hash(admin.password, salt);
  return next();
});

AdminSchema.methods.comparePassword = async function comparePassword(candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

export const AdminModel = model<IAdminDocument>('Admin', AdminSchema);
