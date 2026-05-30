import mongoose, { Document, Schema } from 'mongoose';

export interface IQuestion {
  _id?: string;
  question: string;
  category: string;
  difficulty: string;
  answer?: string;
  feedback?: {
    score: number;
    comment: string;
    keywordsFound: string[];
    keywordsMissed: string[];
  };
}

export interface IInterview extends Document {
  userId: mongoose.Types.ObjectId;
  mode: 'hr' | 'technical';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  questions: IQuestion[];
  overallScore: number;
  feedback: {
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
    communicationScore: number;
    technicalAccuracy: number;
    overallFeedback: string;
  };
  duration: number;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const questionSchema = new Schema<IQuestion>({
  question: { type: String, required: true },
  category: { type: String, required: true },
  difficulty: { type: String, required: true },
  answer: String,
  feedback: {
    score: Number,
    comment: String,
    keywordsFound: [String],
    keywordsMissed: [String],
  },
});

const interviewSchema = new Schema<IInterview>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    mode: {
      type: String,
      enum: ['hr', 'technical'],
      required: true,
    },
    status: {
      type: String,
      enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
      default: 'in_progress',
    },
    questions: [questionSchema],
    overallScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    feedback: {
      strengths: [String],
      weaknesses: [String],
      suggestions: [String],
      communicationScore: { type: Number, default: 0 },
      technicalAccuracy: { type: Number, default: 0 },
      overallFeedback: { type: String, default: '' },
    },
    duration: {
      type: Number,
      default: 0,
    },
    startedAt: Date,
    completedAt: Date,
  },
  {
    timestamps: true,
  }
);

interviewSchema.index({ userId: 1 });
interviewSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<IInterview>('Interview', interviewSchema);
