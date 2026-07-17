// University of Port Harcourt (UNIPORT) academic structure and grading rules.

export const UNIPORT_FACULTIES: Record<string, string[]> = {
  'Faculty of Engineering': [
    'Chemical Engineering',
    'Civil Engineering',
    'Electrical/Electronic Engineering',
    'Mechanical Engineering',
    'Petroleum & Gas Engineering',
    'Environmental Engineering'
  ],
  'Faculty of Science': [
    'Computer Science',
    'Mathematics',
    'Physics',
    'Chemistry',
    'Microbiology',
    'Biochemistry',
    'Geology',
    'Plant Science & Biotechnology',
    'Animal & Environmental Biology'
  ],
  'Faculty of Social Sciences': [
    'Economics',
    'Political Science',
    'Sociology',
    'Geography & Environmental Management',
    'Psychology'
  ],
  'Faculty of Humanities': [
    'English Studies',
    'History & Diplomatic Studies',
    'Linguistics & Communication Studies',
    'Philosophy',
    'Theatre & Film Studies',
    'Fine Arts & Design'
  ],
  'Faculty of Management Sciences': [
    'Accounting',
    'Banking & Finance',
    'Management',
    'Marketing',
    'Hospitality Management & Tourism'
  ],
  'Faculty of Education': [
    'Educational Management',
    'Curriculum Studies & Educational Technology',
    'Science Education',
    'Adult & Non-Formal Education'
  ],
  'Faculty of Law': ['Law'],
  'College of Health Sciences': [
    'Medicine & Surgery',
    'Nursing Science',
    'Pharmacy',
    'Dentistry',
    'Human Anatomy',
    'Human Physiology'
  ],
  'Faculty of Agriculture': [
    'Agricultural Economics & Extension',
    'Animal Science',
    'Crop & Soil Science',
    'Fisheries',
    'Forestry & Wildlife Management'
  ]
};

export const ALL_DEPARTMENTS = Object.values(UNIPORT_FACULTIES).flat();

export function getFacultyForDepartment(department: string): string | null {
  for (const [faculty, departments] of Object.entries(UNIPORT_FACULTIES)) {
    if (departments.includes(department)) return faculty;
  }
  return null;
}

// Nigerian 5-point CGPA scale (UNIPORT grading regulations)
export interface DegreeClassification {
  className: string;
  band: string;
}

export function classifyCGPA(cgpa: number): DegreeClassification {
  if (cgpa >= 4.5) return { className: 'First Class Honours', band: '4.50 - 5.00' };
  if (cgpa >= 3.5) return { className: 'Second Class Honours (Upper Division)', band: '3.50 - 4.49' };
  if (cgpa >= 2.4) return { className: 'Second Class Honours (Lower Division)', band: '2.40 - 3.49' };
  if (cgpa >= 1.5) return { className: 'Third Class Honours', band: '1.50 - 2.39' };
  if (cgpa >= 1.0) return { className: 'Pass', band: '1.00 - 1.49' };
  return { className: 'Fail', band: '0.00 - 0.99' };
}

// Academic standing thresholds per UNIPORT regulations
export const PROBATION_CGPA = 1.5; // below this → probation
export const WITHDRAWAL_CGPA = 1.0; // below this after probation → advised to withdraw

export type AcademicStanding = 'Good Standing' | 'Warning' | 'Probation' | 'Withdrawal Risk';

export function getAcademicStanding(cgpa: number): AcademicStanding {
  if (cgpa < WITHDRAWAL_CGPA) return 'Withdrawal Risk';
  if (cgpa < PROBATION_CGPA) return 'Probation';
  if (cgpa < 2.0) return 'Warning';
  return 'Good Standing';
}

// Current academic session helper, e.g. "2025/2026"
export function getCurrentSession(date: Date = new Date()): string {
  // Nigerian sessions typically run October–September
  const year = date.getFullYear();
  const startYear = date.getMonth() >= 9 ? year : year - 1;
  return `${startYear}/${startYear + 1}`;
}

export function getCurrentSemester(date: Date = new Date()): 'First' | 'Second' {
  // First semester ~ Oct–Feb, Second ~ Mar–Sep
  const month = date.getMonth();
  return month >= 9 || month <= 1 ? 'First' : 'Second';
}
