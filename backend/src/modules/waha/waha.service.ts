// waha.service.ts FINAL (Single Session Mode)
import { Injectable, HttpException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class WahaService {
  private wahaUrl: string;
  private apiKey: string;
  private axios: any;

  constructor() {
    this.wahaUrl = process.env.WAHA_API_URL || 'http://localhost:3000';
    this.apiKey = process.env.WAHA_API_KEY || '';
    this.axios = axios.create({
      baseURL: this.wahaUrl,
      headers: this.apiKey ? { 'X-Api-Key': this.apiKey } : {},
      timeout: 30000,
    });
  }

  async startSession() {
    try {
      const res = await this.axios.post('/api/sessions/start');
      return res.data;
    } catch (err:any) { throw new HttpException(err.response?.data || err.message, err.response?.status || 500); }
  }

  async createSession() {
    try {
      const res = await this.axios.post('/api/sessions');
      return res.data;
    } catch (err:any) { throw new HttpException(err.response?.data || err.message, err.response?.status || 500); }
  }

  async deleteSession() {
    try {
      const res = await this.axios.delete('/api/sessions');
      return res.data;
    } catch (err:any) { throw new HttpException(err.response?.data || err.message, err.response?.status || 500); }
  }

  async getStatus() {
    try {
      const res = await this.axios.get('/api/sessions/status');
      return res.data;
    } catch { return { state: 'disconnected', error: true }; }
  }

  async getQR() {
    try {
      const res = await this.axios.get('/api/screenshot', { responseType: 'text' });
      return { qr: res.data };
    } catch { return { qr: null }; }
  }
}
