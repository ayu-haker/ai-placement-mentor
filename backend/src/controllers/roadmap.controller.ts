import { Response } from 'express';
import { AuthRequest } from '../types';
import Roadmap from '../models/Roadmap';
import User from '../models/User';
import { groqService } from '../services/groq.service';

export const generateRoadmap = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { targetRole, durationWeeks } = req.body;
    const user = await User.findById(req.user?.id);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const weeks = durationWeeks || 12;
    const currentSkills = user.profile.skills || [];

    const roadmapData = await groqService.generateRoadmap(
      currentSkills,
      targetRole,
      weeks
    );

    const roadmap = await Roadmap.create({
      userId: user._id,
      targetRole,
      totalDuration: roadmapData.totalDuration,
      weeks: roadmapData.weeks,
      milestones: roadmapData.milestones,
      progress: 0,
      isActive: true,
      startedAt: new Date(),
    });

    res.status(201).json({
      roadmap: {
        id: roadmap._id,
        targetRole: roadmap.targetRole,
        totalDuration: roadmap.totalDuration,
        weeks: roadmap.weeks,
        milestones: roadmap.milestones,
        progress: roadmap.progress,
        startedAt: roadmap.startedAt,
      },
    });
  } catch (error) {
    console.error('Generate roadmap error:', error);
    res.status(500).json({ error: 'Failed to generate roadmap' });
  }
};

export const getRoadmaps = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const roadmaps = await Roadmap.find({ userId: user._id })
      .sort({ createdAt: -1 });

    res.json({ roadmaps });
  } catch (error) {
    console.error('Get roadmaps error:', error);
    res.status(500).json({ error: 'Failed to fetch roadmaps' });
  }
};

export const getRoadmapById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const roadmap = await Roadmap.findById(req.params.id);
    if (!roadmap) {
      res.status(404).json({ error: 'Roadmap not found' });
      return;
    }
    res.json({ roadmap });
  } catch (error) {
    console.error('Get roadmap error:', error);
    res.status(500).json({ error: 'Failed to fetch roadmap' });
  }
};

export const updateWeekProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { weekNumber, completed } = req.body;
    const roadmap = await Roadmap.findById(req.params.id);

    if (!roadmap) {
      res.status(404).json({ error: 'Roadmap not found' });
      return;
    }

    const week = roadmap.weeks.find((w) => w.week === weekNumber);
    if (!week) {
      res.status(404).json({ error: 'Week not found' });
      return;
    }

    week.completed = completed;

    if (completed) {
      const milestone = roadmap.milestones.find(
        (m) => m.week === weekNumber
      );
      if (milestone) {
        milestone.completed = true;
        milestone.completedAt = new Date();
      }
    }

    const completedWeeks = roadmap.weeks.filter((w) => w.completed).length;
    roadmap.progress = Math.round(
      (completedWeeks / roadmap.weeks.length) * 100
    );

    if (roadmap.progress === 100) {
      roadmap.completedAt = new Date();
      roadmap.isActive = false;
    }

    await roadmap.save();

    res.json({
      message: 'Progress updated',
      roadmap: {
        id: roadmap._id,
        progress: roadmap.progress,
        weeks: roadmap.weeks,
        milestones: roadmap.milestones,
        isActive: roadmap.isActive,
      },
    });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ error: 'Failed to update progress' });
  }
};
