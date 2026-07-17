import { Request, Response } from 'express';
import Admin from '../models/Admin';
import User from '../models/User';
import Student from '../models/Student';
import Lecturer from '../models/Lecturer';
import { AuthRequest } from '../middleware/auth';

export async function getAdminDashboard(req: AuthRequest, res: Response) {
  try {
    const adminData = await Admin.findOne({ userId: req.user._id });
    
    if (!adminData) {
      return res.status(404).json({ status: 'error', message: 'Admin profile not found' });
    }

    // Get system statistics
    const totalUsers = await User.countDocuments();
    const totalStudents = await Student.countDocuments();
    const totalLecturers = await Lecturer.countDocuments();
    const atRiskStudents = await Student.countDocuments({ riskLevel: { $in: ['Medium', 'High'] } });

    const dashboardData = {
      adminId: adminData.adminId,
      name: req.user.name,
      email: req.user.email,
      department: adminData.department,
      permissions: {
        canCreateUsers: adminData.canCreateUsers,
        canDeleteUsers: adminData.canDeleteUsers,
        canEditSystem: adminData.canEditSystem,
        canViewReports: adminData.canViewReports,
        canManageLecturers: adminData.canManageLecturers,
        canManageStudents: adminData.canManageStudents
      },
      statistics: {
        totalUsers,
        totalStudents,
        totalLecturers,
        totalAdmins: await User.countDocuments({ role: 'admin' }),
        atRiskStudents,
        activeUsers: await User.countDocuments({ isActive: true })
      }
    };

    res.json({ status: 'success', data: dashboardData });
  } catch (error) {
    console.error('Error fetching admin dashboard:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch dashboard' });
  }
}

export async function getAllUsers(req: AuthRequest, res: Response) {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    
    let query: any = {};
    
    if (role) {
      query.role = role;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const users = await User.find(query)
      .select('-password')
      .limit(Number(limit))
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    // Enrich student users with their Student-profile fields (level, outreach)
    // so the admin table can display and manage them.
    const studentUserIds = users.filter((u) => u.role === 'student').map((u) => u._id);
    const studentProfiles = studentUserIds.length
      ? await Student.find({ userId: { $in: studentUserIds } }).select(
          'userId level reachedOut studentId department'
        )
      : [];
    const profileByUserId = new Map(
      studentProfiles.map((s) => [String(s.userId), s])
    );

    const enrichedUsers = users.map((u) => {
      const obj = u.toObject();
      if (u.role === 'student') {
        const profile = profileByUserId.get(String(u._id));
        obj.level = profile?.level || null;
        obj.reachedOut = profile?.reachedOut || false;
        obj.studentId = profile?.studentId || null;
        obj.department = profile?.department || null;
      }
      return obj;
    });

    res.json({
      status: 'success',
      data: {
        users: enrichedUsers,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch users' });
  }
}

export async function createUser(req: AuthRequest, res: Response) {
  try {
    const admin = await Admin.findOne({ userId: req.user._id });
    
    if (!admin?.canCreateUsers) {
      return res.status(403).json({ status: 'error', message: 'Permission denied' });
    }

    const { name, email, password, role, additionalData } = req.body;
    
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ status: 'error', message: 'Email already registered' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      isActive: true
    });

    // Create role-specific profile
    if (role === 'student') {
      await Student.create({
        userId: user._id,
        studentId: additionalData?.studentId || `STU-${user._id}`,
        email,
        name,
        department: additionalData?.department || 'General',
        level: additionalData?.level || '100'
      });
    } else if (role === 'lecturer') {
      await Lecturer.create({
        userId: user._id,
        lecturerId: additionalData?.lecturerId || `LEC-${user._id}`,
        email,
        name,
        department: additionalData?.department || 'General',
        specialization: additionalData?.specialization || 'General'
      });
    }

    // Log activity
    admin.activityLog?.push({
      action: 'CREATE_USER',
      details: `Created ${role} user: ${email}`
    });
    admin.totalUsersManaged = (admin.totalUsersManaged || 0) + 1;
    await admin.save();

    res.status(201).json({
      status: 'success',
      data: { user: { id: user._id, name: user.name, email: user.email, role: user.role } }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ status: 'error', message: 'Failed to create user' });
  }
}

export async function deleteUser(req: AuthRequest, res: Response) {
  try {
    const admin = await Admin.findOne({ userId: req.user._id });
    
    if (!admin?.canDeleteUsers) {
      return res.status(403).json({ status: 'error', message: 'Permission denied' });
    }

    const { userId } = req.params;
    
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    // Delete role-specific profiles
    if (user.role === 'student') {
      await Student.deleteOne({ userId });
    } else if (user.role === 'lecturer') {
      await Lecturer.deleteOne({ userId });
    } else if (user.role === 'admin') {
      await Admin.deleteOne({ userId });
    }

    // Log activity
    admin.activityLog?.push({
      action: 'DELETE_USER',
      details: `Deleted ${user.role} user: ${user.email}`
    });
    await admin.save();

    res.json({ status: 'success', message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ status: 'error', message: 'Failed to delete user' });
  }
}

export async function updateUserStatus(req: AuthRequest, res: Response) {
  try {
    const admin = await Admin.findOne({ userId: req.user._id });
    
    if (!admin?.canEditSystem) {
      return res.status(403).json({ status: 'error', message: 'Permission denied' });
    }

    const { userId } = req.params;
    const { isActive } = req.body;
    
    const user = await User.findByIdAndUpdate(userId, { isActive }, { new: true });
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    // Log activity
    admin.activityLog?.push({
      action: 'UPDATE_STATUS',
      details: `Set ${user.role} user ${user.email} to ${isActive ? 'active' : 'inactive'}`
    });
    await admin.save();

    res.json({ status: 'success', data: user });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update user status' });
  }
}

export async function updateStudentOutreach(req: AuthRequest, res: Response) {
  try {
    const admin = await Admin.findOne({ userId: req.user._id });

    if (!admin?.canManageStudents && !admin?.canEditSystem) {
      return res.status(403).json({ status: 'error', message: 'Permission denied' });
    }

    const { studentId } = req.params;
    const { reachedOut, reachedOutNote } = req.body;

    // studentId is the student's User _id; resolve the Student profile from it.
    const student = await Student.findOne({ userId: studentId });
    if (!student) {
      return res.status(404).json({ status: 'error', message: 'Student not found' });
    }

    student.reachedOut = Boolean(reachedOut);
    student.reachedOutNote = reachedOut ? (reachedOutNote || '') : undefined;
    student.reachedOutAt = reachedOut ? new Date() : undefined;
    student.reachedOutBy = reachedOut ? req.user._id : undefined;
    await student.save();

    admin.activityLog?.push({
      action: 'STUDENT_OUTREACH',
      details: `Marked student ${student.email} as ${reachedOut ? 'reached out' : 'not reached out'}`
    });
    await admin.save();

    res.json({
      status: 'success',
      data: {
        reachedOut: student.reachedOut,
        reachedOutNote: student.reachedOutNote,
        reachedOutAt: student.reachedOutAt
      }
    });
  } catch (error) {
    console.error('Error updating student outreach:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update student outreach' });
  }
}

export async function updateStudentLevel(req: AuthRequest, res: Response) {
  try {
    const admin = await Admin.findOne({ userId: req.user._id });

    if (!admin?.canManageStudents && !admin?.canEditSystem) {
      return res.status(403).json({ status: 'error', message: 'Permission denied' });
    }

    const { studentId } = req.params;
    const { level } = req.body;

    const allowedLevels = ['100', '200', '300', '400'];
    if (!allowedLevels.includes(String(level))) {
      return res.status(400).json({ status: 'error', message: 'Invalid level' });
    }

    // studentId is the student's User _id; resolve the Student profile from it.
    const student = await Student.findOne({ userId: studentId });
    if (!student) {
      return res.status(404).json({ status: 'error', message: 'Student not found' });
    }

    const previousLevel = student.level;
    student.level = String(level);
    student.updatedAt = new Date();
    await student.save();

    admin.activityLog?.push({
      action: 'STUDENT_LEVEL_UPDATE',
      details: `Changed level of ${student.email} from ${previousLevel} to ${student.level}`
    });
    await admin.save();

    res.json({
      status: 'success',
      data: { level: student.level }
    });
  } catch (error) {
    console.error('Error updating student level:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update student level' });
  }
}

export async function getSystemReports(req: AuthRequest, res: Response) {
  try {
    const admin = await Admin.findOne({ userId: req.user._id });

    if (!admin?.canViewReports) {
      return res.status(403).json({ status: 'error', message: 'Permission denied' });
    }

    const reports = {
      usersByRole: await User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } }
      ]),
      riskDistribution: await Student.aggregate([
        { $group: { _id: '$riskLevel', count: { $sum: 1 } } }
      ]),
      departmentDistribution: await Student.aggregate([
        { $group: { _id: '$department', count: { $sum: 1 } } }
      ]),
      recentLogins: await User.find({ lastLogin: { $exists: true } })
        .select('name email role lastLogin')
        .sort({ lastLogin: -1 })
        .limit(10)
    };

    res.json({ status: 'success', data: reports });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch reports' });
  }
}
