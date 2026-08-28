import pdf from 'pdf-parse';
import mammoth from 'mammoth';

export class ResumeParserService {
  async parseResumeBuffer(buffer: Buffer, fileType: string, fileName: string): Promise<string> {
    try {
      const lowerName = fileName.toLowerCase();
      if (fileType.includes('pdf') || lowerName.endsWith('.pdf')) {
        const data = await pdf(buffer);
        return data.text || '';
      } else if (
        fileType.includes('word') ||
        lowerName.endsWith('.docx') ||
        lowerName.endsWith('.doc')
      ) {
        const result = await mammoth.extractRawText({ buffer });
        return result.value || '';
      } else {
        return buffer.toString('utf-8');
      }
    } catch (error) {
      console.error('Resume parse error:', error);
      const rawText = buffer.toString('utf-8').replace(/[^\x20-\x7E\n\r\t]/g, ' ');
      return rawText.length > 20 ? rawText : `Resume content for ${fileName}`;
    }
  }

  async parseResume(filePath: string, fileType: string): Promise<string> {
    return `Parsed resume content`;
  }
}

export const resumeParserService = new ResumeParserService();
