import mongoose, { Document, Schema } from 'mongoose';

export interface IActivity {
  type: string;
  description: string;
  score?: number;
  date: Date;
}

export interface IProgressReport extends Document {
  userId: mongoose.Types.ObjectId;
  reportDate: Date;
  placementReadiness: number;
  totalInterviews: number;
  averageInterviewScore: number;
  skillsAcquired: number;
  totalSkills: number;
  resumesAnalyzed: number;
  roadmapsCompleted: number;
  activities: IActivity[];
  strengths: string[];
  areasForImprovement: string[];
  recommendations: string[];
  createdAt: Date;
  updatedAt: Date;
}

const activitySchema = new Schema<IActivity>({
  type: { type: String, required: true },
  description: { type: String, required: true },
  score: Number,
  date: { type: Date, default: Date.now },
});

const progressReportSchema = new Schema<IProgressReport>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reportDate: {
      type: Date,
      default: Date.now,
    },
    placementReadiness: { type: Number, default: 0 },
    totalInterviews: { type: Number, default: 0 },
    averageInterviewScore: { type: Number, default: 0 },
    skillsAcquired: { type: Number, default: 0 },
    totalSkills: { type: Number, default: 0 },
    resumesAnalyzed: { type: Number, default: 0 },
    roadmapsCompleted: { type: Number, default: 0 },
    activities: [activitySchema],
    strengths: [String],
    areasForImprovement: [String],
    recommendations: [String],
  },
  {
    timestamps: true,
  }
);

progressReportSchema.index({ userId: 1 });
progressReportSchema.index({ userId: 1, reportDate: -1 });

export default mongoose.model<IProgressReport>('ProgressReport', progressReportSchema);
