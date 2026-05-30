import { Response } from 'express';
import { AuthRequest } from '../types';
import Resume from '../models/Resume';
import User from '../models/User';
import { resumeParserService } from '../services/resumeParser.service';
import { ollamaService } from '../services/ollama.service';

export const uploadResume = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const currentUser = await User.findById(req.user?.id);

    if (!currentUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const resume = await Resume.create({
      userId: currentUser._id,
      fileName: req.file.originalname,
      fileUrl: `/uploads/${req.file.filename}`,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      status: 'processing',
    });

    try {
      const resumeText = await resumeParserService.parseResume(
        req.file.path,
        req.file.mimetype
      );

      const analysis = await ollamaService.analyzeResume(resumeText);

      resume.analysis = {
        atsScore: analysis.atsScore,
        formatScore: analysis.formatScore,
        contentScore: analysis.contentScore,
        keywords: analysis.keywords,
        missingSkills: analysis.missingSkills,
        suggestions: analysis.suggestions,
        overallFeedback: analysis.overallFeedback,
        parsedContent: resumeText.substring(0, 5000),
      };
      resume.status = 'completed';
      await resume.save();

      if (analysis.missingSkills.length > 0) {
        const existingSkills = new Set(
          (currentUser.profile?.skills || []).map((s: string) => s.toLowerCase())
        );
        const newSkills = analysis.missingSkills.filter(
          (s: string) => !existingSkills.has(s.toLowerCase())
        );
        if (newSkills.length > 0) {
          await User.findByIdAndUpdate(currentUser._id, {
            $addToSet: { 'profile.skills': { $each: newSkills } },
          });
        }
      }
    } catch (parseError) {
      resume.status = 'failed';
      await resume.save();
    }

    res.status(201).json({
      message: 'Resume uploaded and analyzed successfully',
      resume: {
        id: resume._id,
        fileName: resume.fileName,
        status: resume.status,
        analysis: resume.analysis,
        createdAt: resume.createdAt,
      },
    });
  } catch (error) {
    console.error('Upload resume error:', error);
    res.status(500).json({ error: 'Failed to upload resume' });
  }
};

export const getResumes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const resumes = await Resume.find({ userId: user._id })
      .select('-analysis.parsedContent')
      .sort({ createdAt: -1 });

    res.json({ resumes });
  } catch (error) {
    console.error('Get resumes error:', error);
    res.status(500).json({ error: 'Failed to fetch resumes' });
  }
};

export const getResumeById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) {
      res.status(404).json({ error: 'Resume not found' });
      return;
    }
    res.json({ resume });
  } catch (error) {
    console.error('Get resume error:', error);
    res.status(500).json({ error: 'Failed to fetch resume' });
  }
};

export const deleteResume = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const resume = await Resume.findByIdAndDelete(req.params.id);
    if (!resume) {
      res.status(404).json({ error: 'Resume not found' });
      return;
    }
    res.json({ message: 'Resume deleted successfully' });
  } catch (error) {
    console.error('Delete resume error:', error);
    res.status(500).json({ error: 'Failed to delete resume' });
  }
};
