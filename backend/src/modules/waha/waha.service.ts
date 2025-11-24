import { Injectable, HttpException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class WahaService {
  private wahaUrl = process.env.WAHA_API_URL || 'http://localhost:3000';
  private apiKey = process.env.WAHA_API_KEY || '';
  private client = axios.create({
    baseURL: this.wahaUrl,
    headers: { 'X-Api-Key': this.apiKey },
    timeout: 20000,
  });

  async createSession(sessionName: string) {
    try {
      const res = await this.client.post(`/api/sessions/${sessionName}`);
      return res.data;
    } catch (e: any) {
      throw new HttpException(
        e.response?.data || e.message,
        e.response?.status || 500
      );
    }
  }

  async startSession(sessionName: string) {
    try {
      const res = await this.client.post(`/api/sessions/${sessionName}/start`);
      return res.data;
    } catch (e: any) {
      throw new HttpException(
        e.response?.data || e.message,
        e.response?.status || 500
      );
    }
  }

  async getSessionStatus(name: string) {
    try {
      const res = await this.client.get(`/api/sessions/${name}/status`);
      return res.data;
    } catch {
      return { state: 'disconnected' };
    }
  }

  async getSessionQR() {
    try {
      const res = await this.client.get(`/api/screenshot?session=default`, {
        responseType: 'text',
      });
      return { qr: res.data };
    } catch {
      return { qr: null };
    }
  }

  async deleteSession(name: string) {
    try {
      const res = await this.client.delete(`/api/sessions/${name}`);
      return res.data;
    } catch (e: any) {
      throw new HttpException(
        e.response?.data || e.message,
        e.response?.status || 500
      );
    }
  }
}
