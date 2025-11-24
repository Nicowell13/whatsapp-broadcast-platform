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

  // ============================================================
  // DEFAULT SESSION ONLY
  // ============================================================

  async createDefaultSession() {
    try {
      const res = await this.client.post(`/api/sessions/default`);
      return res.data;
    } catch (e: any) {
      throw new HttpException(e.response?.data || e.message, e.response?.status || 500);
    }
  }

  async startDefaultSession() {
    try {
      const res = await this.client.post(`/api/sessions/default/start`);
      return res.data;
    } catch (e: any) {
      throw new HttpException(e.response?.data || e.message, e.response?.status || 500);
    }
  }

  async deleteDefaultSession() {
    try {
      const res = await this.client.delete(`/api/sessions/default`);
      return res.data;
    } catch (e: any) {
      throw new HttpException(e.response?.data || e.message, e.response?.status || 500);
    }
  }

  async logoutDefault() {
    try {
      const res = await this.client.post(`/api/sessions/default/logout`);
      return res.data;
    } catch (e: any) {
      throw new HttpException(e.response?.data || e.message, e.response?.status || 500);
    }
  }

  async getDefaultStatus() {
    try {
      const res = await this.client.get(`/api/sessions/default/status`);
      return res.data;
    } catch {
      return { state: 'disconnected', error: true };
    }
  }

  async getDefaultQR() {
    try {
      const res = await this.client.get(`/api/screenshot?session=default`, {
        responseType: 'text',
      });
      return { qr: res.data };
    } catch {
      return { qr: null };
    }
  }
}
