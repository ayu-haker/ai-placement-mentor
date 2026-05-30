import mongoose, { Document, Schema } from 'mongoose';

export interface ISkillAssessment extends Document {
  userId: mongoose.Types.ObjectId;
  targetRole: string;
  currentSkills: string[];
  requiredSkills: string[];
  missingSkills: string[];
  matchPercentage: number;
  recommendations: string[];
  resources: {
    title: string;
    type: string;
    url: string;
    platform: string;
  }[];
  assessmentDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const skillAssessmentSchema = new Schema<ISkillAssessment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    targetRole: {
      type: String,
      required: true,
    },
    currentSkills: [String],
    requiredSkills: [String],
    missingSkills: [String],
    matchPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    recommendations: [String],
    resources: [
      {
        title: String,
        type: {
          type: String,
          enum: ['course', 'tutorial', 'book', 'article', 'video'],
        },
        url: String,
        platform: String,
      },
    ],
    assessmentDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

skillAssessmentSchema.index({ userId: 1 });
skillAssessmentSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<ISkillAssessment>('SkillAssessment', skillAssessmentSchema);
