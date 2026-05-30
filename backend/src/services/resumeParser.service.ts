import fs from 'fs';
import path from 'path';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import { AppError } from '../middleware/errorHandler';

export class ResumeParserService {
  async parseResume(filePath: string, fileType: string): Promise<string> {
    const absolutePath = path.resolve(filePath);

    if (!fs.existsSync(absolutePath)) {
      throw new AppError('File not found', 404);
    }

    try {
      if (fileType === 'application/pdf') {
        return await this.parsePDF(absolutePath);
      } else if (
        fileType ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ) {
        return await this.parseDOCX(absolutePath);
      } else {
        throw new AppError('Unsupported file type', 400);
      }
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to parse resume file', 500);
    }
  }

  private async parsePDF(filePath: string): Promise<string> {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
  }

  private async parseDOCX(filePath: string): Promise<string> {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  }
}

export const resumeParserService = new ResumeParserService();
