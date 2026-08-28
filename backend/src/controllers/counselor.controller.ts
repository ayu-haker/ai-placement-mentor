import { Response } from 'express';
import { AuthRequest } from '../types';
import { groqService } from '../services/groq.service';

const chatHistories = new Map<string, { role: 'user' | 'assistant'; content: string; timestamp: Date }[]>();

export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { message } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!chatHistories.has(userId)) {
      chatHistories.set(userId, []);
    }

    const history = chatHistories.get(userId) || [];
    const validHistory = history.filter((msg) => msg.content && !msg.content.includes('error'));

    const response = await groqService.chat(message, validHistory);

    const updatedHistory = [
      ...validHistory,
      { role: 'user' as const, content: message, timestamp: new Date() },
      { role: 'assistant' as const, content: response, timestamp: new Date() },
    ];

    chatHistories.set(userId, updatedHistory.slice(-40));

    res.json({
      message: response,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to get AI response' });
  }
};

export const getChatHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const history = chatHistories.get(userId) || [];
    res.json({ history });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
};

export const clearChatHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    chatHistories.delete(userId);
    res.json({ message: 'Chat history cleared' });
  } catch (error) {
    console.error('Clear history error:', error);
    res.status(500).json({ error: 'Failed to clear chat history' });
  }
};
