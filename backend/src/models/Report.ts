import { Schema, model, models } from 'mongoose';

const ReportSchema = new Schema({
  title: { type: String, required: true },
  generatedAt: { type: Date, default: Date.now },
  generatedBy: { type: String, required: true },
  studentId: { type: String },
  summary: { type: String },
  pdfPath: { type: String }
});

const Report = models.Report || model('Report', ReportSchema);
export default Report;
