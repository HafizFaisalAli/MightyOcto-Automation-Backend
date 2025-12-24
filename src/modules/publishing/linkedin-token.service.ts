import { Injectable, Logger } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';

@Injectable()
export class LinkedInTokenService {
  private readonly logger = new Logger(LinkedInTokenService.name);
  private readonly filePath = join(process.cwd(), 'linkedin_token.json');

  async saveToken(data: Record<string, any>): Promise<void> {
    try {
      await fs.writeFile(this.filePath, JSON.stringify(data, null, 2), {
        encoding: 'utf8',
        flag: 'w',
      });
      this.logger.log(`Saved LinkedIn token to ${this.filePath}`);
    } catch (err) {
      this.logger.error(`Failed to save LinkedIn token: ${String(err)}`);
      throw err;
    }
  }

  async getToken(): Promise<Record<string, any> | null> {
    try {
      const content = await fs.readFile(this.filePath, { encoding: 'utf8' });
      return JSON.parse(content) as Record<string, any>;
    } catch (err) {
      this.logger.warn(`No LinkedIn token file: ${String(err)}`);
      // File may not exist
      return null;
    }
  }
}
