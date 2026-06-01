import { Response } from 'express';
import { AuthRequest } from '../types';
import Interview from '../models/Interview';
import User from '../models/User';
import { groqService } from '../services/groq.service';

export const startInterview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { mode, skills } = req.body;
    const user = await User.findById(req.user?.id);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const previousInterviews = await Interview.find({ userId: user._id })
      .select('questions')
      .sort({ createdAt: -1 })
      .limit(3);

    const previousQuestions = previousInterviews
      .flatMap((i) => i.questions.map((q) => q.question));

    const questions = await groqService.generateInterviewQuestions(
      mode,
      skills || user.profile.skills,
      previousQuestions
    );

    const interview = await Interview.create({
      userId: user._id,
      mode,
      status: 'in_progress',
      questions: questions.map((q: any) => ({
        question: q.question,
        category: q.category,
        difficulty: q.difficulty,
      })),
      startedAt: new Date(),
    });

    res.status(201).json({
      interview: {
        id: interview._id,
        mode: interview.mode,
        questions: interview.questions,
        startedAt: interview.startedAt,
      },
    });
  } catch (error) {
    console.error('Start interview error:', error);
    res.status(500).json({ error: 'Failed to start interview' });
  }
};

export const submitAnswer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { interviewId, questionId, answer } = req.body;

    const interview = await Interview.findById(interviewId);
    if (!interview) {
      res.status(404).json({ error: 'Interview not found' });
      return;
    }

    const question = interview.questions.find(
      (q) => q._id?.toString() === questionId
    );
    if (!question) {
      res.status(404).json({ error: 'Question not found' });
      return;
    }

    question.answer = answer;

    const feedback = await groqService.evaluateInterviewAnswer(
      question.question,
      answer,
      []
    );

    question.feedback = {
      score: feedback.score,
      comment: feedback.comment,
      keywordsFound: feedback.keywordsFound,
      keywordsMissed: feedback.keywordsMissed,
    };

    await interview.save();

    res.json({
      feedback: question.feedback,
      nextQuestion: interview.questions.find(
        (q) => !q.answer
      ),
    });
  } catch (error) {
    console.error('Submit answer error:', error);
    res.status(500).json({ error: 'Failed to submit answer' });
  }
};

export const completeInterview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { interviewId } = req.params;

    const interview = await Interview.findById(interviewId);
    if (!interview) {
      res.status(404).json({ error: 'Interview not found' });
      return;
    }

    const answeredQuestions = interview.questions.filter((q) => q.answer);
    if (answeredQuestions.length === 0) {
      res.status(400).json({ error: 'No questions answered' });
      return;
    }

    const qaData = answeredQuestions.map((q) => ({
      question: q.question,
      answer: q.answer || '',
      score: q.feedback?.score || 0,
    }));

    const feedback = await groqService.generateInterviewFeedback(qaData);

    interview.overallScore = feedback.score;
    interview.feedback = {
      strengths: feedback.strengths,
      weaknesses: feedback.weaknesses,
      suggestions: feedback.suggestions,
      communicationScore: feedback.communicationScore || 0,
      technicalAccuracy: feedback.technicalAccuracy || 0,
      overallFeedback: feedback.overallFeedback,
    };
    interview.status = 'completed';
    interview.completedAt = new Date();

    if (interview.startedAt) {
      interview.duration = Math.floor(
        (Date.now() - interview.startedAt.getTime()) / 1000
      );
    }

    await interview.save();

    res.json({
      message: 'Interview completed',
      interview: {
        id: interview._id,
        mode: interview.mode,
        overallScore: interview.overallScore,
        feedback: interview.feedback,
        duration: interview.duration,
        completedAt: interview.completedAt,
      },
    });
  } catch (error) {
    console.error('Complete interview error:', error);
    res.status(500).json({ error: 'Failed to complete interview' });
  }
};

export const getInterviews = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const interviews = await Interview.find({ userId: user._id })
      .sort({ createdAt: -1 });

    res.json({ interviews });
  } catch (error) {
    console.error('Get interviews error:', error);
    res.status(500).json({ error: 'Failed to fetch interviews' });
  }
};

export const getInterviewById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) {
      res.status(404).json({ error: 'Interview not found' });
      return;
    }
    res.json({ interview });
  } catch (error) {
    console.error('Get interview error:', error);
    res.status(500).json({ error: 'Failed to fetch interview' });
  }
};
