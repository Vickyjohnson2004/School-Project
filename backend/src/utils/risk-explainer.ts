// Explainable risk assessment: turns a student's metrics into human-readable
// risk factors with per-factor contribution weights, so lecturers/students
// see WHY a risk level was assigned, not just the label.

export interface RiskFactor {
  factor: string;
  value: string;
  severity: 'critical' | 'warning' | 'positive';
  weight: number; // 0-100 contribution to overall risk
  advice: string;
}

export interface RiskExplanation {
  riskLevel: 'Low' | 'Medium' | 'High';
  riskScore: number; // 0-100
  factors: RiskFactor[];
  recommendations: string[];
}

interface StudentMetrics {
  currentGPA?: number;
  previousGPA?: number;
  attendancePercentage?: number;
  assignmentAverage?: number;
  quizAverage?: number;
  midSemesterScore?: number;
  lateSubmissionCount?: number;
  studyHours?: number;
  sleepHours?: number;
  stressLevel?: number;
  lmsActivity?: number;
  participation?: number;
}

export function explainRisk(s: StudentMetrics): RiskExplanation {
  const factors: RiskFactor[] = [];
  let score = 0;

  const gpa = s.currentGPA ?? 0;
  const prevGpa = s.previousGPA ?? gpa;
  const attendance = s.attendancePercentage ?? 100;
  const assignments = s.assignmentAverage ?? 100;
  const quizzes = s.quizAverage ?? 100;
  const midSem = s.midSemesterScore ?? 100;
  const lateSubs = s.lateSubmissionCount ?? 0;
  const studyHours = s.studyHours ?? 4;
  const sleepHours = s.sleepHours ?? 7;
  const stress = s.stressLevel ?? 3;

  // --- CGPA (heaviest weight) ---
  if (gpa < 1.5) {
    score += 35;
    factors.push({
      factor: 'CGPA below probation threshold',
      value: gpa.toFixed(2),
      severity: 'critical',
      weight: 35,
      advice: 'CGPA below 1.50 places you on academic probation per UNIPORT regulations. Meet your adviser urgently.'
    });
  } else if (gpa < 2.4) {
    score += 22;
    factors.push({
      factor: 'Low CGPA',
      value: gpa.toFixed(2),
      severity: 'critical',
      weight: 22,
      advice: 'Your CGPA is in the Third Class band. Prioritise core courses and seek tutoring support.'
    });
  } else if (gpa < 3.5) {
    score += 8;
    factors.push({
      factor: 'Moderate CGPA',
      value: gpa.toFixed(2),
      severity: 'warning',
      weight: 8,
      advice: 'You are in the Second Class Lower band. Consistent improvement can move you to 2:1.'
    });
  } else {
    factors.push({
      factor: 'Strong CGPA',
      value: gpa.toFixed(2),
      severity: 'positive',
      weight: 0,
      advice: 'Keep up the strong academic performance.'
    });
  }

  // --- GPA trend ---
  const gpaDrop = prevGpa - gpa;
  if (gpaDrop >= 0.5) {
    score += 12;
    factors.push({
      factor: 'Declining GPA trend',
      value: `dropped ${gpaDrop.toFixed(2)} points`,
      severity: 'warning',
      weight: 12,
      advice: 'Your GPA fell significantly from last semester. Review what changed in your study habits.'
    });
  }

  // --- Attendance ---
  if (attendance < 60) {
    score += 20;
    factors.push({
      factor: 'Very poor attendance',
      value: `${attendance.toFixed(0)}%`,
      severity: 'critical',
      weight: 20,
      advice: 'Below 65% attendance you may be barred from exams. Attend all remaining lectures.'
    });
  } else if (attendance < 75) {
    score += 10;
    factors.push({
      factor: 'Low attendance',
      value: `${attendance.toFixed(0)}%`,
      severity: 'warning',
      weight: 10,
      advice: 'Attendance under 75% strongly correlates with poor grades. Aim for every lecture.'
    });
  }

  // --- Continuous assessment ---
  if (assignments < 50) {
    score += 10;
    factors.push({
      factor: 'Failing assignment average',
      value: `${assignments.toFixed(0)}%`,
      severity: 'critical',
      weight: 10,
      advice: 'Assignments make up a large share of continuous assessment. Submit every one, on time.'
    });
  }
  if (quizzes < 50) {
    score += 7;
    factors.push({
      factor: 'Failing quiz average',
      value: `${quizzes.toFixed(0)}%`,
      severity: 'warning',
      weight: 7,
      advice: 'Review lecture material weekly rather than only before tests.'
    });
  }
  if (midSem < 40) {
    score += 8;
    factors.push({
      factor: 'Poor mid-semester result',
      value: `${midSem.toFixed(0)}%`,
      severity: 'critical',
      weight: 8,
      advice: 'A weak mid-semester score means the final exam carries heavy weight. Start revision now.'
    });
  }

  // --- Behaviour ---
  if (lateSubs > 3) {
    score += 5;
    factors.push({
      factor: 'Frequent late submissions',
      value: `${lateSubs} late`,
      severity: 'warning',
      weight: 5,
      advice: 'Use a submission calendar; late penalties are eroding your scores.'
    });
  }
  if (studyHours < 2) {
    score += 5;
    factors.push({
      factor: 'Low study hours',
      value: `${studyHours.toFixed(1)} hrs/day`,
      severity: 'warning',
      weight: 5,
      advice: 'Aim for at least 3 focused study hours daily.'
    });
  }

  // --- Wellbeing ---
  if (stress > 7) {
    score += 5;
    factors.push({
      factor: 'High stress level',
      value: `${stress}/10`,
      severity: 'warning',
      weight: 5,
      advice: 'Visit the UNIPORT Counselling Unit — high stress directly hurts exam performance.'
    });
  }
  if (sleepHours < 5) {
    score += 3;
    factors.push({
      factor: 'Insufficient sleep',
      value: `${sleepHours.toFixed(1)} hrs/night`,
      severity: 'warning',
      weight: 3,
      advice: 'Chronic sleep deprivation impairs memory. Target 7–8 hours.'
    });
  }

  const riskScore = Math.min(100, score);
  const riskLevel: 'Low' | 'Medium' | 'High' =
    riskScore >= 50 ? 'High' : riskScore >= 25 ? 'Medium' : 'Low';

  const recommendations = factors
    .filter((f) => f.severity !== 'positive')
    .sort((a, b) => b.weight - a.weight)
    .map((f) => f.advice);

  return {
    riskLevel,
    riskScore,
    factors: factors.sort((a, b) => b.weight - a.weight),
    recommendations: recommendations.length ? recommendations : ['Keep up the good work!']
  };
}
