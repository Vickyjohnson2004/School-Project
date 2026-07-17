import { Schema, model, models } from 'mongoose';

const StudentSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  studentId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  level: { type: String, enum: ['100', '200', '300', '400'], required: true },
  advisorId: { type: Schema.Types.ObjectId, ref: 'User' },
  enrolledCourses: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
  phoneNumber: { type: String },
  dateOfBirth: { type: Date },
  attendancePercentage: { type: Number, default: 0 },
  assignmentAverage: { type: Number, default: 0 },
  quizAverage: { type: Number, default: 0 },
  midSemesterScore: { type: Number, default: 0 },
  previousGPA: { type: Number, default: 0 },
  currentGPA: { type: Number, default: 0 },
  studyHours: { type: Number, default: 0 },
  participation: { type: Number, default: 0 },
  libraryVisits: { type: Number, default: 0 },
  lateSubmissionCount: { type: Number, default: 0 },
  disciplinaryRecord: { type: Number, default: 0 },
  lmsActivity: { type: Number, default: 0 },
  courseLoad: { type: Number, default: 0 },
  sleepHours: { type: Number, default: 0 },
  stressLevel: { type: Number, default: 0 },
  riskLevel: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },
  riskProbability: { type: Number, default: 0 },
  reachedOut: { type: Boolean, default: false },
  reachedOutNote: { type: String },
  reachedOutAt: { type: Date },
  reachedOutBy: { type: Schema.Types.ObjectId, ref: 'User' },
  profileCompleteness: { type: Number, default: 0 },
  lastAssessmentDate: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Student = models.Student || model('Student', StudentSchema);
export default Student;
