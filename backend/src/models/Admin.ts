import { Schema, model, models } from 'mongoose';

const AdminSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  adminId: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  permissions: [{ type: String }],
  canCreateUsers: { type: Boolean, default: true },
  canDeleteUsers: { type: Boolean, default: false },
  canEditSystem: { type: Boolean, default: true },
  canViewReports: { type: Boolean, default: true },
  canManageLecturers: { type: Boolean, default: true },
  canManageStudents: { type: Boolean, default: true },
  activityLog: [{
    action: String,
    details: String,
    timestamp: { type: Date, default: Date.now }
  }],
  totalUsersManaged: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Admin = models.Admin || model('Admin', AdminSchema);
export default Admin;
