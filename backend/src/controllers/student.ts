import { Request, Response } from 'express';
import Student from '../models/Student';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

export async function getStudentDashboard(req: AuthRequest, res: Response) {
  try {
    const studentData = await Student.findOne({ userId: req.user._id })
      .populate('advisorId', 'name email');
    
    if (!studentData) {
      return res.status(404).json({ status: 'error', message: 'Student profile not found' });
    }

    const dashboardData = {
      studentId: studentData.studentId,
      name: studentData.name,
      email: studentData.email,
      department: studentData.department,
      level: studentData.level,
      advisor: studentData.advisorId,
      riskStatus: studentData.riskLevel,
      riskProbability: studentData.riskProbability,
      academics: {
        currentGPA: studentData.currentGPA,
        previousGPA: studentData.previousGPA,
        assignmentAverage: studentData.assignmentAverage,
        quizAverage: studentData.quizAverage,
        midSemesterScore: studentData.midSemesterScore
      },
      engagement: {
        attendancePercentage: studentData.attendancePercentage,
        participation: studentData.participation,
        libraryVisits: studentData.libraryVisits,
        lmsActivity: studentData.lmsActivity,
        lateSubmissionCount: studentData.lateSubmissionCount
      },
      wellbeing: {
        studyHours: studentData.studyHours,
        sleepHours: studentData.sleepHours,
        stressLevel: studentData.stressLevel
      },
      enrollment: {
        courseLoad: studentData.courseLoad,
        enrolledCourses: studentData.enrolledCourses || []
      },
      outreach: {
        reachedOut: studentData.reachedOut || false,
        reachedOutNote: studentData.reachedOutNote || '',
        reachedOutAt: studentData.reachedOutAt || null
      }
    };

    res.json({ status: 'success', data: dashboardData });
  } catch (error) {
    console.error('Error fetching student dashboard:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch dashboard' });
  }
}

export async function updateStudentProfile(req: AuthRequest, res: Response) {
  try {
    const { phoneNumber, dateOfBirth } = req.body;
    
    const student = await Student.findOneAndUpdate(
      { userId: req.user._id },
      { 
        phoneNumber,
        dateOfBirth,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ status: 'error', message: 'Student profile not found' });
    }

    res.json({ status: 'success', data: student });
  } catch (error) {
    console.error('Error updating student profile:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update profile' });
  }
}

export async function getStudentPredictions(req: AuthRequest, res: Response) {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      return res.status(404).json({ status: 'error', message: 'Student not found' });
    }

    // Return risk assessment data
    res.json({
      status: 'success',
      data: {
        riskLevel: student.riskLevel,
        riskProbability: student.riskProbability,
        lastAssessmentDate: student.lastAssessmentDate,
        recommendations: generateRecommendations(student)
      }
    });
  } catch (error) {
    console.error('Error fetching predictions:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch predictions' });
  }
}

function generateRecommendations(student: any): string[] {
  const recommendations = [];

  if (student.currentGPA < 2.0) {
    recommendations.push('Your GPA is below 2.0. Consider meeting with your academic advisor.');
  }

  if (student.attendancePercentage < 70) {
    recommendations.push('Your attendance is below 70%. Regular attendance is crucial.');
  }

  if (student.stressLevel > 7) {
    recommendations.push('Your stress level is high. Consider using campus counseling services.');
  }

  if (student.sleepHours < 6) {
    recommendations.push('You may not be getting enough sleep. Aim for 7-8 hours daily.');
  }

  if (student.lateSubmissionCount > 3) {
    recommendations.push('You have multiple late submissions. Plan your assignments better.');
  }

  if (student.riskLevel === 'High') {
    recommendations.push('You are at high academic risk. Please contact your advisor immediately.');
  }

  return recommendations.length > 0 ? recommendations : ['Keep up the good work!'];
}
