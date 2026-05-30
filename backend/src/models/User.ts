import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  role: 'student' | 'admin';
  profile: {
    phone?: string;
    college?: string;
    graduationYear?: number;
    branch?: string;
    cgpa?: number;
    skills: string[];
    resumeUrl?: string;
    linkedinUrl?: string;
    githubUrl?: string;
    portfolioUrl?: string;
  };
  placementReadiness: {
    score: number;
    lastUpdated: Date;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['student', 'admin'],
      default: 'student',
    },
    profile: {
      phone: String,
      college: String,
      graduationYear: Number,
      branch: String,
      cgpa: Number,
      skills: [String],
      resumeUrl: String,
      linkedinUrl: String,
      githubUrl: String,
      portfolioUrl: String,
    },
    placementReadiness: {
      score: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      lastUpdated: {
        type: Date,
        default: Date.now,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ 'profile.skills': 1 });

export default mongoose.model<IUser>('User', userSchema);
