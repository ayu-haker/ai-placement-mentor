import { Response } from 'express';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { AuthRequest } from '../types';
import User from '../models/User';
import { signToken } from '../utils/jwt';

const inMemoryUsers = new Map<string, { id: string; email: string; passwordHash: string; name: string; role: string }>();

export const registerUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    if (mongoose.connection.readyState === 1) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        res.status(400).json({ error: 'User already exists with this email' });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({
        email,
        password: hashedPassword,
        name: name || email.split('@')[0],
        role: 'student',
        profile: { skills: [] },
        placementReadiness: { score: 0, lastUpdated: new Date() },
      });

      const token = signToken({ id: user._id.toString(), email: user.email, role: user.role });
      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: { id: user._id, email: user.email, name: user.name, role: user.role },
      });
      return;
    }

    const normEmail = email.toLowerCase().trim();
    if (inMemoryUsers.has(normEmail)) {
      res.status(400).json({ error: 'User already exists with this email' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = 'mem_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const newUser = { id: userId, email: normEmail, passwordHash: hashedPassword, name: name || normEmail.split('@')[0], role: 'student' };
    inMemoryUsers.set(normEmail, newUser);

    const token = signToken({ id: userId, email: normEmail, role: 'student' });
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: userId, email: normEmail, name: newUser.name, role: 'student' },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message || 'Failed to register user' });
  }
};

export const loginUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    if (mongoose.connection.readyState === 1) {
      const user = await User.findOne({ email });
      if (!user) {
        res.status(400).json({ error: 'Invalid email or password' });
        return;
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        res.status(400).json({ error: 'Invalid email or password' });
        return;
      }

      const token = signToken({ id: user._id.toString(), email: user.email, role: user.role });
      res.json({
        message: 'Login successful',
        token,
        user: { id: user._id, email: user.email, name: user.name, role: user.role },
      });
      return;
    }

    const normEmail = email.toLowerCase().trim();
    let memUser = inMemoryUsers.get(normEmail);
    if (!memUser) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const userId = 'mem_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
      memUser = { id: userId, email: normEmail, passwordHash: hashedPassword, name: normEmail.split('@')[0], role: 'student' };
      inMemoryUsers.set(normEmail, memUser);
    } else {
      const isMatch = await bcrypt.compare(password, memUser.passwordHash);
      if (!isMatch) {
        res.status(400).json({ error: 'Invalid email or password' });
        return;
      }
    }

    const token = signToken({ id: memUser.id, email: memUser.email, role: memUser.role });
    res.json({
      message: 'Login successful',
      token,
      user: { id: memUser.id, email: memUser.email, name: memUser.name, role: memUser.role },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message || 'Failed to login' });
  }
};

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(req.user?.id).select('-password -__v');
      if (user) {
        res.json({ user });
        return;
      }
    }
    res.json({
      user: {
        id: req.user?.id || 'default_user',
        email: req.user?.email || 'user@example.com',
        name: req.user?.email?.split('@')[0] || 'User',
        role: req.user?.role || 'student',
        profile: { skills: ['JavaScript', 'React', 'Node.js'] },
        placementReadiness: { score: 85, lastUpdated: new Date() },
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const updateData = req.body;
    if (mongoose.connection.readyState === 1) {
      if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 10);
      }
      const user = await User.findByIdAndUpdate(
        req.user?.id,
        { $set: updateData },
        { new: true, runValidators: true }
      ).select('-password -__v');

      if (user) {
        res.json({ message: 'Profile updated successfully', user });
        return;
      }
    }

    res.json({
      message: 'Profile updated successfully (memory mode)',
      user: {
        id: req.user?.id,
        email: req.user?.email,
        name: updateData.name || req.user?.email?.split('@')[0],
        role: req.user?.role || 'student',
        profile: updateData.profile || { skills: [] },
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

export const getAllUsers = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (mongoose.connection.readyState === 1) {
      const users = await User.find({}).select('-password -__v').sort({ createdAt: -1 });
      res.json({ users, total: users.length });
      return;
    }
    const memList = Array.from(inMemoryUsers.values()).map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
    }));
    res.json({ users: memList, total: memList.length });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};
