import { Injectable, HttpException } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class WahaService {
  getSession(): any {
    throw new Error('Method not implemented.');
  }
  private wahaUrl: string;
  private apiKey: string;
  private axios: AxiosInstance;

  constructor() {
    this.wahaUrl = process.env.WAHA_API_URL || 'http://localhost:3000';
    this.apiKey = process.env.WAHA_API_KEY || '';
    this.axios = axios.create({
      baseURL: this.wahaUrl,
      headers: this.apiKey ? { 'X-Api-Key': this.apiKey } : {},
      timeout: 30000,
    });
  }

  // ============================================================
  //                   SESSION CONTROL
  // ============================================================

  async createSession(sessionName: string) {
    try {
      const res = await this.axios.post(`/api/sessions/${sessionName}`);
      return res.data;
    } catch (err: any) {
      throw new HttpException(err.response?.data || err.message, err.response?.status || 500);
    }
  }
   async getSessions() {
    try {
      const res = await this.axios.get(`/api/sessions`);
      return res.data;
    } catch (err: any) {
      throw new HttpException(
        err.response?.data || err.message,
        err.response?.status || 500
      );
    }
  }

  async startSession(sessionName: string) {
    try {
      const res = await this.axios.post(`/api/sessions/${sessionName}/start`);
      return res.data;
    } catch (err: any) {
      throw new HttpException(err.response?.data || err.message, err.response?.status || 500);
    }
  }

  async deleteSession(sessionName: string) {
    try {
      const res = await this.axios.delete(`/api/sessions/${sessionName}`);
      return res.data;
    } catch (err: any) {
      throw new HttpException(err.response?.data || err.message, err.response?.status || 500);
    }
  }

  async logoutSession(sessionName: string) {
    try {
      const res = await this.axios.post(`/api/sessions/${sessionName}/logout`);
      return res.data;
    } catch (err: any) {
      throw new HttpException(err.response?.data || err.message, err.response?.status || 500);
    }
  }

  async getSessionStatus(sessionName: string) {
    try {
      const res = await this.axios.get(`/api/sessions/${sessionName}/status`);
      return res.data;
    } catch (err: any) {
      return { state: 'disconnected', error: true };
    }
  }
   


  // ============================================================
  //                        QR CODE
  // ============================================================

  async getSessionQR() {
    try {
      const res = await this.axios.get(`/api/screenshot?session=default`, {
        responseType: 'text',
      });
      return { qr: res.data };
    } catch (err: any) {
      return { qr: null };
    }
  }

  // ============================================================
  //                   AUTO-RECONNECT MODE-B
  // ============================================================

  async restartSession(sessionName = 'default') {
    try {
      console.log(`[AUTO-RECONNECT] Trying to restart ${sessionName}...`);
      const res = await this.axios.post(`/api/sessions/${sessionName}/start`, {});
      console.log(`[AUTO-RECONNECT] Session restarted successfully.`);
      return res.data;
    } catch (err: any) {
      console.error(
        '[AUTO-RECONNECT] Failed to restart session:',
        err.response?.data || err.message
      );
      return null;
    }
  }
}
