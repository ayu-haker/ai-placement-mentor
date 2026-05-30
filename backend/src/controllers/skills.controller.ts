import { Response } from 'express';
import { AuthRequest } from '../types';
import SkillAssessment from '../models/SkillAssessment';
import User from '../models/User';
import { ollamaService } from '../services/ollama.service';

export const analyzeSkillGap = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { targetRole } = req.body;
    const user = await User.findById(req.user?.id);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const currentSkills = user.profile.skills || [];

    const result = await ollamaService.analyzeSkillGap(currentSkills, targetRole);

    const assessment = await SkillAssessment.create({
      userId: user._id,
      targetRole,
      currentSkills: result.currentSkills,
      requiredSkills: result.requiredSkills,
      missingSkills: result.missingSkills,
      matchPercentage: result.matchPercentage,
      recommendations: result.recommendations,
      resources: result.resources,
    });

    res.json({
      assessment: {
        id: assessment._id,
        targetRole: assessment.targetRole,
        matchPercentage: assessment.matchPercentage,
        currentSkills: assessment.currentSkills,
        missingSkills: assessment.missingSkills,
        recommendations: assessment.recommendations,
        resources: assessment.resources,
      },
    });
  } catch (error) {
    console.error('Skill gap analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze skill gap' });
  }
};

export const getSkillAssessments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const assessments = await SkillAssessment.find({ userId: user._id })
      .sort({ createdAt: -1 });

    res.json({ assessments });
  } catch (error) {
    console.error('Get assessments error:', error);
    res.status(500).json({ error: 'Failed to fetch assessments' });
  }
};

export const getSkillAssessmentById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const assessment = await SkillAssessment.findById(req.params.id);
    if (!assessment) {
      res.status(404).json({ error: 'Assessment not found' });
      return;
    }
    res.json({ assessment });
  } catch (error) {
    console.error('Get assessment error:', error);
    res.status(500).json({ error: 'Failed to fetch assessment' });
  }
};
