import { Response } from 'express';
import { AuthRequest } from '../types';
import User from '../models/User';
import Resume from '../models/Resume';
import Interview from '../models/Interview';
import SkillAssessment from '../models/SkillAssessment';
import Roadmap from '../models/Roadmap';
import ProgressReport from '../models/ProgressReport';

export const getDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const [
      recentResumes,
      recentInterviews,
      recentAssessments,
      activeRoadmap,
      progressReport,
    ] = await Promise.all([
      Resume.find({ userId: user._id })
        .sort({ createdAt: -1 })
        .limit(3)
        .select('fileName analysis.atsScore status createdAt'),
      Interview.find({ userId: user._id })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('mode status overallScore createdAt'),
      SkillAssessment.find({ userId: user._id })
        .sort({ createdAt: -1 })
        .limit(1)
        .select('targetRole matchPercentage missingSkills createdAt'),
      Roadmap.findOne({ userId: user._id, isActive: true })
        .select('targetRole progress weeks milestones'),
      ProgressReport.find({ userId: user._id })
        .sort({ reportDate: -1 })
        .limit(1)
        .select('placementReadiness totalInterviews averageInterviewScore skillsAcquired activities'),
    ]);

    const totalInterviews = await Interview.countDocuments({
      userId: user._id,
    });
    const completedInterviews = await Interview.countDocuments({
      userId: user._id,
      status: 'completed',
    });
    const totalResumes = await Resume.countDocuments({
      userId: user._id,
    });

    const readinessScore = progressReport[0]?.placementReadiness || user.placementReadiness.score || 0;

    const latestAssessment = recentAssessments[0];

    res.json({
      dashboard: {
        placementReadiness: readinessScore,
        totalInterviews,
        completedInterviews,
        totalResumes,
        currentSkills: user.profile.skills || [],
        skillMatch: latestAssessment?.matchPercentage || 0,
        targetRole: latestAssessment?.targetRole || '',
        roadmapProgress: activeRoadmap?.progress || 0,
        roadmapTarget: activeRoadmap?.targetRole || '',
        recentResumes,
        recentInterviews,
        latestAssessment,
        activeRoadmap,
        activities: progressReport[0]?.activities || [],
        strengths: progressReport[0]?.strengths || [],
        areasForImprovement: progressReport[0]?.areasForImprovement || [],
      },
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
};

export const getAdminDashboard = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [
      totalUsers,
      totalResumes,
      totalInterviews,
      completedInterviews,
      usersWithInterviews,
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      Resume.countDocuments(),
      Interview.countDocuments(),
      Interview.countDocuments({ status: 'completed' }),
      Interview.aggregate([
        { $group: { _id: '$userId' } },
        { $count: 'count' },
      ]),
    ]);

    const avgScoreResult = await Interview.aggregate([
      { $match: { status: 'completed', overallScore: { $ne: 0 } } },
      { $group: { _id: null, avgScore: { $avg: '$overallScore' } } },
    ]);

    const averageScore = avgScoreResult[0]?.avgScore || 0;

    const allSkills = await User.aggregate([
      { $match: { role: 'student', 'profile.skills': { $ne: [] } } },
      { $unwind: '$profile.skills' },
      { $group: { _id: '$profile.skills', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    const recentActivities = await ProgressReport.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(10)
      .select('activities placementReadiness userId');

    res.json({
      stats: {
        totalStudents: totalUsers,
        totalResumes,
        totalInterviews,
        completedInterviews,
        studentsWithInterviews: usersWithInterviews[0]?.count || 0,
        averageInterviewScore: Math.round(averageScore),
        topSkills: allSkills.map((s) => ({
          name: s._id,
          count: s.count,
        })),
      },
      recentActivities,
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch admin dashboard' });
  }
};
