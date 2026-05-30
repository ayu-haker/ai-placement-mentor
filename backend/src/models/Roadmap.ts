import mongoose, { Document, Schema } from 'mongoose';

export interface IWeek {
  week: number;
  focus: string;
  topics: string[];
  tasks: string[];
  resources: string[];
  completed: boolean;
}

export interface IMilestone {
  title: string;
  week: number;
  description: string;
  completed: boolean;
  completedAt?: Date;
}

export interface IRoadmap extends Document {
  userId: mongoose.Types.ObjectId;
  targetRole: string;
  totalDuration: string;
  weeks: IWeek[];
  milestones: IMilestone[];
  progress: number;
  isActive: boolean;
  startedAt: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const weekSchema = new Schema<IWeek>({
  week: { type: Number, required: true },
  focus: { type: String, required: true },
  topics: [String],
  tasks: [String],
  resources: [String],
  completed: { type: Boolean, default: false },
});

const milestoneSchema = new Schema<IMilestone>({
  title: { type: String, required: true },
  week: { type: Number, required: true },
  description: { type: String, required: true },
  completed: { type: Boolean, default: false },
  completedAt: Date,
});

const roadmapSchema = new Schema<IRoadmap>(
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
    totalDuration: {
      type: String,
      required: true,
    },
    weeks: [weekSchema],
    milestones: [milestoneSchema],
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: Date,
  },
  {
    timestamps: true,
  }
);

roadmapSchema.index({ userId: 1 });
roadmapSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<IRoadmap>('Roadmap', roadmapSchema);
