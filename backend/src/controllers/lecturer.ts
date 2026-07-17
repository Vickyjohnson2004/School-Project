import { Request, Response } from 'express';
import Lecturer from '../models/Lecturer';
import Student from '../models/Student';
import { AuthRequest } from '../middleware/auth';

export async function getLecturerDashboard(req: AuthRequest, res: Response) {
  try {
    const lecturerData = await Lecturer.findOne({ userId: req.user._id })
      .populate('advisedStudents');
    
    if (!lecturerData) {
      return res.status(404).json({ status: 'error', message: 'Lecturer profile not found' });
    }

    // Get risk statistics for advised students
    const atRiskStudents = await Student.find({
      advisorId: req.user._id,
      riskLevel: { $in: ['Medium', 'High'] }
    });

    const dashboardData = {
      lecturerId: lecturerData.lecturerId,
      name: lecturerData.name,
      email: lecturerData.email,
      department: lecturerData.department,
      specialization: lecturerData.specialization,
      officeLocation: lecturerData.officeLocation,
      officeHours: lecturerData.officeHours,
      bio: lecturerData.bio,
      qualifications: lecturerData.qualifications,
      statistics: {
        totalStudentsAdvised: lecturerData.advisedStudents?.length || 0,
        atRiskCount: atRiskStudents.length,
        coursesTeaching: lecturerData.taughtCourses?.length || 0
      },
      advisedStudents: lecturerData.advisedStudents || [],
      taughtCourses: lecturerData.taughtCourses || []
    };

    res.json({ status: 'success', data: dashboardData });
  } catch (error) {
    console.error('Error fetching lecturer dashboard:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch dashboard' });
  }
}

export async function updateLecturerProfile(req: AuthRequest, res: Response) {
  try {
    const { officeLocation, officeHours, bio, qualifications, phoneNumber } = req.body;
    
    const lecturer = await Lecturer.findOneAndUpdate(
      { userId: req.user._id },
      { 
        officeLocation,
        officeHours,
        bio,
        qualifications,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!lecturer) {
      return res.status(404).json({ status: 'error', message: 'Lecturer profile not found' });
    }

    res.json({ status: 'success', data: lecturer });
  } catch (error) {
    console.error('Error updating lecturer profile:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update profile' });
  }
}

export async function getAdvisedStudents(req: AuthRequest, res: Response) {
  try {
    const students = await Student.find({ advisorId: req.user._id })
      .select('name email studentId department level riskLevel currentGPA attendancePercentage');

    res.json({
      status: 'success',
      data: {
        students,
        totalCount: students.length,
        atRiskCount: students.filter(s => s.riskLevel === 'High' || s.riskLevel === 'Medium').length
      }
    });
  } catch (error) {
    console.error('Error fetching advised students:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch students' });
  }
}

export async function getStudentDetails(req: AuthRequest, res: Response) {
  try {
    const { studentId } = req.params;

    const student = await Student.findOne({ userId: studentId, advisorId: req.user._id });
    if (!student) {
      return res.status(404).json({ status: 'error', message: 'Student not found or not your advisee' });
    }

    res.json({ status: 'success', data: student });
  } catch (error) {
    console.error('Error fetching student details:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch student details' });
  }
}

export async function searchStudents(req: AuthRequest, res: Response) {
  try {
    const { q } = req.query;

    const query: any = { advisorId: req.user._id };
    if (q && String(q).trim()) {
      const regex = { $regex: String(q).trim(), $options: 'i' };
      query.$or = [
        { name: regex },
        { studentId: regex },
        { email: regex }
      ];
    }

    const students = await Student.find(query)
      .select(
        'name email studentId department level riskLevel riskProbability currentGPA previousGPA ' +
        'attendancePercentage assignmentAverage quizAverage midSemesterScore studyHours participation ' +
        'libraryVisits lateSubmissionCount disciplinaryRecord lmsActivity courseLoad sleepHours stressLevel'
      )
      .limit(20)
      .sort({ name: 1 });

    res.json({ status: 'success', data: { students, totalCount: students.length } });
  } catch (error) {
    console.error('Error searching students:', error);
    res.status(500).json({ status: 'error', message: 'Failed to search students' });
  }
}
