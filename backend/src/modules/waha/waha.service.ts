import { Injectable, HttpException, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class WahaService {
  private readonly logger = new Logger(WahaService.name);
  private readonly client: AxiosInstance;
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor() {
    this.baseUrl = process.env.WAHA_API_URL || 'http://waha:3000';
    this.apiKey = process.env.WAHA_API_KEY || '';
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: { 'X-Api-Key': this.apiKey },
      timeout: 60000,
    });
  }

  private handleError(err: any) {
    const message = err?.response?.data || err?.message || err;
    const status = err?.response?.status || 500;
    this.logger.error('WAHA error: ' + JSON.stringify(message));
    throw new HttpException(message, status);
  }

  async checkHealth(): Promise<any> {
    try {
      const res = await this.client.get('/api/health');
      return res.data;
    } catch (err) {
      this.handleError(err);
    }
  }

  async getSessions(): Promise<any> {
    try {
      const res = await this.client.get('/api/sessions');
      return res.data;
    } catch (err) {
      this.handleError(err);
    }
  }

  /**
   * Create a new session (named)
   */
  async createSession(name: string, config: Record<string, any> = {}): Promise<any> {
    try {
      const res = await this.client.post('/api/sessions/start', {
        name,
        config,
      });
      return res.data;
    } catch (err) {
      this.handleError(err);
    }
  }

  /**
   * Start an existing session by name.
   * Some WAHA API accepts /api/sessions/:name/start; if not, use /api/sessions/start with name body.
   */
  async startSession(name: string): Promise<any> {
    try {
      // Prefer canonical endpoint first
      try {
        const res = await this.client.post(`/api/sessions/${encodeURIComponent(name)}/start`);
        return res.data;
      } catch (innerErr) {
        // fallback to body-based start
        const res = await this.client.post('/api/sessions/start', { name });
        return res.data;
      }
    } catch (err) {
      this.handleError(err);
    }
  }

  /**
   * Convenience wrapper for default session name "default"
   */
  async startDefaultSession(): Promise<any> {
    return this.startSession('default');
  }

  async deleteSession(name: string): Promise<any> {
    try {
      const res = await this.client.delete(`/api/sessions/${encodeURIComponent(name)}`);
      return res.data;
    } catch (err) {
      this.handleError(err);
    }
  }
async getQR(name: string) {
  try {
    const res = await this.client.get(`/api/sessions/${name}/qr`);
    return res.data;
  } catch (err) {
    this.handleError(err);
  }
}

async getStatus(name: string) {
  try {
    const res = await this.client.get(`/api/sessions/${name}`);
    return res.data;
  } catch (err) {
    this.handleError(err);
  }
}

  async logoutSession(name: string): Promise<any> {
    try {
      // Some WAHA implementations use /api/sessions/:name/logout or /api/sessions/logout
      try {
        const res = await this.client.post(`/api/sessions/${encodeURIComponent(name)}/logout`);
        return res.data;
      } catch (innerErr) {
        const res = await this.client.post('/api/sessions/logout', { name });
        return res.data;
      }
    } catch (err) {
      this.handleError(err);
    }
  }
}
