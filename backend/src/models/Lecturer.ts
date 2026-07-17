import { Schema, model, models } from 'mongoose';

const LecturerSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  lecturerId: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  specialization: { type: String, required: true },
  taughtCourses: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
  advisedStudents: [{ type: Schema.Types.ObjectId, ref: 'Student' }],
  officeLocation: { type: String },
  officeHours: { type: String },
  bio: { type: String },
  qualifications: [{ type: String }],
  totalStudentsAdvised: { type: Number, default: 0 },
  atRiskStudents: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Lecturer = models.Lecturer || model('Lecturer', LecturerSchema);
export default Lecturer;
