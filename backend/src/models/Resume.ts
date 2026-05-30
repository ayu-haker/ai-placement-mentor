import mongoose, { Document, Schema } from 'mongoose';

export interface IResume extends Document {
  userId: mongoose.Types.ObjectId;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  analysis: {
    atsScore: number;
    formatScore: number;
    contentScore: number;
    keywords: string[];
    missingSkills: string[];
    suggestions: string[];
    overallFeedback: string;
    parsedContent?: string;
  };
  status: 'processing' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

const resumeSchema = new Schema<IResume>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    analysis: {
      atsScore: { type: Number, default: 0 },
      formatScore: { type: Number, default: 0 },
      contentScore: { type: Number, default: 0 },
      keywords: [String],
      missingSkills: [String],
      suggestions: [String],
      overallFeedback: { type: String, default: '' },
      parsedContent: String,
    },
    status: {
      type: String,
      enum: ['processing', 'completed', 'failed'],
      default: 'processing',
    },
  },
  {
    timestamps: true,
  }
);

resumeSchema.index({ userId: 1 });
resumeSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<IResume>('Resume', resumeSchema);
