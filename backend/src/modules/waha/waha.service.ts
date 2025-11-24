// waha.service.ts - DEFAULT SESSION ONLY (FINAL)
import { Injectable, HttpException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class WahaService {
  private wahaUrl: string;
  private apiKey: string;
  private axiosInstance: any;

  constructor() {
    this.wahaUrl = process.env.WAHA_API_URL || 'http://localhost:3000';
    this.apiKey = process.env.WAHA_API_KEY || '';
    this.axiosInstance = axios.create({
      baseURL: this.wahaUrl,
      headers: this.apiKey ? { 'X-Api-Key': this.apiKey } : {},
      timeout: 30000,
    });
  }

  async createDefaultSession() {
    try {
      const res = await this.axiosInstance.post('/api/sessions/default');
      return res.data;
    } catch (err:any) {
      throw new HttpException(err.response?.data || err.message, err.response?.status || 500);
    }
  }

  async startDefaultSession() {
    try {
      const res = await this.axiosInstance.post('/api/sessions/default/start');
      return res.data;
    } catch (err:any) {
      throw new HttpException(err.response?.data || err.message, err.response?.status || 500);
    }
  }

  async deleteDefaultSession() {
    try {
      const res = await this.axiosInstance.delete('/api/sessions/default');
      return res.data;
    } catch (err:any) {
      throw new HttpException(err.response?.data || err.message, err.response?.status || 500);
    }
  }

  async getDefaultStatus() {
    try {
      const res = await this.axiosInstance.get('/api/sessions/default/status');
      return res.data;
    } catch {
      return { state: 'disconnected', error: true };
    }
  }

  async logoutDefault() {
    try {
      const res = await this.axiosInstance.post('/api/sessions/default/logout');
      return res.data;
    } catch (err:any) {
      throw new HttpException(err.response?.data || err.message, err.response?.status || 500);
    }
  }

  async getDefaultQR() {
    try {
      const res = await this.axiosInstance.get('/api/screenshot?session=default', {
        responseType: 'text',
      });
      return { qr: res.data };
    } catch {
      return { qr: null };
    }
  }
}
