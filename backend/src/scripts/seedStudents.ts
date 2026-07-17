/**
 * Seed the ML dataset (ucid_student_scores.csv) as real student accounts.
 *
 * Every row becomes a User (role: student) + Student profile carrying the 15
 * ML feature values and the labelled risk level. All seeded students start at
 * level "100" (only an admin can change a level afterwards).
 *
 * Usage:
 *   npx ts-node src/scripts/seedStudents.ts            # add students, skip existing
 *   npx ts-node src/scripts/seedStudents.ts --fresh    # delete seeded students first
 *
 * Idempotent: re-running skips any seeded email that already exists.
 */
import 'dotenv/config';
import path from 'path';
import fs from 'fs/promises';
import mongoose from 'mongoose';
import config from '../config';
import User from '../models/User';
import Student from '../models/Student';
import Lecturer from '../models/Lecturer';

const DATASET_PATH = path.resolve(__dirname, '..', 'ml', 'ucid_student_scores.csv');
const SEED_EMAIL_DOMAIN = 'dataset.student-risk.local';
const DEFAULT_PASSWORD = 'Student@123';
const DEPARTMENTS = [
  'Computer Science',
  'Engineering',
  'Mathematics',
  'Business',
  'Biology'
];

type Row = Record<string, string>;

function num(value: string): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function normaliseRisk(value: string): 'Low' | 'Medium' | 'High' {
  const v = (value || '').trim().toLowerCase();
  if (v === 'high') return 'High';
  if (v === 'medium') return 'Medium';
  return 'Low';
}

async function readDataset(): Promise<Row[]> {
  const content = await fs.readFile(DATASET_PATH, 'utf8');
  const [headerLine, ...lines] = content.trim().split(/\r?\n/);
  const headers = headerLine.split(',').map((h) => h.trim());

  return lines
    .filter((line) => line.trim().length > 0)
    .map((line) => {
      const values = line.split(',').map((v) => v.trim());
      const entry: Row = {};
      headers.forEach((header, i) => {
        entry[header] = values[i] ?? '';
      });
      return entry;
    });
}

async function main() {
  const fresh = process.argv.includes('--fresh');

  await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 5000 });
  console.log('MongoDB connected');

  if (fresh) {
    const seededUsers = await User.find({
      email: { $regex: `@${SEED_EMAIL_DOMAIN}$` }
    }).select('_id');
    const ids = seededUsers.map((u) => u._id);
    await Student.deleteMany({ userId: { $in: ids } });
    await User.deleteMany({ _id: { $in: ids } });
    console.log(`Removed ${ids.length} previously-seeded students`);
  }

  const rows = await readDataset();
  console.log(`Loaded ${rows.length} dataset rows`);

  // Spread seeded students across existing lecturers as advisors (if any).
  const lecturers = await Lecturer.find().select('userId');
  const advisorIds = lecturers.map((l) => l.userId);

  let created = 0;
  let skipped = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const seq = String(i + 1).padStart(3, '0');
    const email = `student${seq}@${SEED_EMAIL_DOMAIN}`;

    const existing = await User.findOne({ email });
    if (existing) {
      skipped++;
      continue;
    }

    const name = `Student ${seq}`;
    const user = await User.create({
      name,
      email,
      password: DEFAULT_PASSWORD,
      role: 'student',
      verified: true,
      isActive: true
    });

    await Student.create({
      userId: user._id,
      studentId: `UCID-${seq}`,
      name,
      email,
      department: DEPARTMENTS[i % DEPARTMENTS.length],
      level: '100', // all seeded students start at 100L
      advisorId: advisorIds.length ? advisorIds[i % advisorIds.length] : undefined,
      attendancePercentage: num(row.attendancePercentage),
      assignmentAverage: num(row.assignmentAverage),
      quizAverage: num(row.quizAverage),
      midSemesterScore: num(row.midSemesterScore),
      previousGPA: num(row.previousGPA),
      currentGPA: num(row.currentGPA),
      studyHours: num(row.studyHours),
      participation: num(row.participation),
      libraryVisits: num(row.libraryVisits),
      lateSubmissionCount: num(row.lateSubmissionCount),
      disciplinaryRecord: num(row.disciplinaryRecord),
      lmsActivity: num(row.lmsActivity),
      courseLoad: num(row.courseLoad),
      sleepHours: num(row.sleepHours),
      stressLevel: num(row.stressLevel),
      riskLevel: normaliseRisk(row.risk),
      lastAssessmentDate: new Date()
    });

    created++;
  }

  console.log(`Done. Created ${created} students, skipped ${skipped} existing.`);
  if (created > 0) {
    console.log(`Seeded student login password: ${DEFAULT_PASSWORD}`);
  }
  if (!advisorIds.length) {
    console.log('Note: no lecturers found, so seeded students have no advisor yet.');
  }

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(async (err) => {
  console.error('Seed failed:', err);
  await mongoose.disconnect().catch(() => undefined);
  process.exit(1);
});
