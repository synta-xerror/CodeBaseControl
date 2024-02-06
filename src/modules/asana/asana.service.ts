import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class AsanaService {
  private readonly logger = new Logger(AsanaService.name);
  private asanaApiKey: string =
    '2/1206539760677871/1206539776210967:1c58ac01dbd2cb30b58203203224dcb7';
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: 'https://app.asana.com/api/1.0',
      headers: {
        Authorization: `Bearer ${this.asanaApiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async fetchAsanaTask(taskId: string): Promise<any> {
    try {
      const response = await this.axiosInstance.get(`/tasks/${taskId}`);
      return response.data;
    } catch (error) {
      this.logger.error('Error fetching Asana task:', error);
      throw new Error('Failed to fetch Asana task');
    }
  }
}
