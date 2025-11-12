import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';
const AdminSchema = new Schema({
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin'], default: 'admin' },
}, {
    timestamps: true,
});
AdminSchema.pre('save', async function hashPassword(next) {
    const admin = this;
    if (!admin.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(admin.password, salt);
    return next();
});
AdminSchema.methods.comparePassword = async function comparePassword(candidate) {
    return bcrypt.compare(candidate, this.password);
};
export const AdminModel = model('Admin', AdminSchema);
//# sourceMappingURL=Admin.js.map