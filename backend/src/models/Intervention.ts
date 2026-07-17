import { Schema, model, models } from 'mongoose';

const InterventionSchema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  studentUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // adviser (lecturer user)
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' }, // null when auto-created by the system
  riskLevelAtCreation: { type: String, enum: ['Low', 'Medium', 'High'], required: true },
  riskScoreAtCreation: { type: Number, default: 0 },
  triggerReason: { type: String, required: true }, // e.g. "Risk rose from Low to High"
  session: { type: String }, // e.g. "2025/2026"
  semester: { type: String, enum: ['First', 'Second'] },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'escalated'],
    default: 'open'
  },
  actions: [{
    actionType: {
      type: String,
      enum: [
        'meeting_scheduled',
        'meeting_held',
        'counselling_referral',
        'tutoring_referral',
        'course_advice',
        'parent_contacted',
        'other'
      ],
      required: true
    },
    notes: { type: String },
    takenBy: { type: Schema.Types.ObjectId, ref: 'User' },
    takenAt: { type: Date, default: Date.now }
  }],
  outcome: {
    resolvedAt: { type: Date },
    riskLevelAtResolution: { type: String, enum: ['Low', 'Medium', 'High'] },
    notes: { type: String }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

InterventionSchema.index({ assignedTo: 1, status: 1 });
InterventionSchema.index({ studentId: 1, status: 1 });

const Intervention = models.Intervention || model('Intervention', InterventionSchema);
export default Intervention;
