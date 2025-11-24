// ==============================
// WAHA SERVICE FINAL VERSION (JS)
// Auto-start + Auto-Reconnect Cron (Mode C)
// ==============================

import { Injectable, HttpException } from '@nestjs/common';
import axios from 'axios';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class WahaService {
  constructor() {
    this.wahaApiUrl = process.env.WAHA_API_URL || 'http://localhost:3000';
    this.wahaApiKey = process.env.WAHA_API_KEY || '';

    this.axiosInstance = axios.create({ baseURL: this.wahaApiUrl });

    console.log('[WAHA] Service initialized', {
      baseURL: this.wahaApiUrl,
      hasApiKey: !!this.wahaApiKey,
      apiKeyValue: this.wahaApiKey ? `${this.wahaApiKey.substring(0, 10)}...` : 'none',
    });
  }

  // =======================
  // Helper: API Key Headers
  // =======================
  getHeaders() {
    const headers = {};
    if (this.wahaApiKey?.trim()) headers['X-Api-Key'] = this.wahaApiKey;
    return headers;
  }

  // =============
  // GET SESSIONS
  // =============
  async getSessions() {
    try {
      const res = await this.axiosInstance.get('/api/sessions', { headers: this.getHeaders() });
      return res.data;
    } catch (err) {
      throw new HttpException(err.response?.data?.message || err.message, err.response?.status || 500);
    }
  }

  // =============================
  // CREATE SESSION + AUTO START
  // =============================
  async createSession(sessionName) {
    try {
      const payload = {
        name: sessionName,
        config: {
          proxy: null,
          noweb: {
            store: {
              enabled: true,
              fullSync: false,
            },
          },
        },
      };

      console.log('[WAHA] Creating session:', sessionName);

      const response = await this.axiosInstance.post('/api/sessions', payload, {
        headers: this.getHeaders(),
      });

      console.log('[WAHA] Session created successfully:', sessionName);

      // Delay sebelum start (WAHA butuh waktu init)
      await new Promise((resolve) => setTimeout(resolve, 500));

      try {
        console.log(`[WAHA] Auto-starting session '${sessionName}'...`);
        await this.axiosInstance.post(
          `/api/sessions/${sessionName}/start`,
          {},
          { headers: this.getHeaders() }
        );
        console.log(`[WAHA] Session started: ${sessionName}`);
      } catch (startErr) {
        if (startErr.response?.status === 409) {
          console.log(`[WAHA] Session '${sessionName}' already running.`);
        } else {
          console.error('[WAHA] Failed to start session after create:', startErr.message);
        }
      }

      return response.data;
    } catch (err) {
      const status = err.response?.status || 500;
      const data = err.response?.data;

      console.error('[WAHA] createSession error', {
        sessionName,
        status,
        data,
        message: err.message,
      });

      if (status === 422 && data?.message?.includes('already exists')) {
        throw new HttpException(`Session '${sessionName}' already exists.`, status);
      }

      throw new HttpException(data?.message || err.message, status);
    }
  }

  // =========================
  // GET QR (DEFAULT SESSION)
  // =========================
  async getSessionQR() {
    try {
      const res = await this.axiosInstance.get('/api/screenshot?session=default', {
        headers: this.getHeaders(),
        responseType: 'arraybuffer',
      });

      const base64 = Buffer.from(res.data, 'binary').toString('base64');

      return { qr: `data:image/png;base64,${base64}` };
    } catch (err) {
      throw new HttpException(err.response?.data?.message || err.message, err.response?.status || 500);
    }
  }

  // =====================
  // CHECK SESSION STATUS
  // =====================
  async getSessionStatus(sessionName) {
    try {
      const res = await this.axiosInstance.get(`/api/sessions/${sessionName}`, {
        headers: this.getHeaders(),
      });
      return res.data;
    } catch (err) {
      throw new HttpException(err.response?.data?.message || err.message, err.response?.status || 500);
    }
  }

  // =======================================
  // AUTO RECONNECT CRON → EVERY 15 SECONDS
  // =======================================
  @Cron('*/15 * * * * *')
  async checkAndReconnect() {
    const sessionName = 'default';

    try {
      const status = await this.getSessionStatus(sessionName);
      const state = (status?.state || '').toLowerCase();

      const isActive =
        state.includes('connected') ||
        state.includes('open') ||
        state.includes('ready');

      if (!isActive) {
        console.warn(`[WAHA CRON] Session '${sessionName}' inactive → restarting...`);

        await this.axiosInstance.post(
          `/api/sessions/${sessionName}/start`,
          {},
          { headers: this.getHeaders() }
        );

        console.log(`[WAHA CRON] Restart command sent for '${sessionName}'.`);
      }
    } catch (err) {
      console.error(`[WAHA CRON] Error checking session. Forcing restart...`, err.message);

      try {
        await this.axiosInstance.post(
          `/api/sessions/${sessionName}/start`,
          {},
          { headers: this.getHeaders() }
        );
        console.log('[WAHA CRON] Forced restart OK.');
      } catch (err2) {
        console.error('[WAHA CRON] Forced restart failed:', err2.message);
      }
    }
  }

  // =============
  // DELETE SESSION
  // =============
  async deleteSession(sessionName) {
    try {
      const res = await this.axiosInstance.delete(`/api/sessions/${sessionName}`, {
        headers: this.getHeaders(),
      });
      return res.data;
    } catch (err) {
      throw new HttpException(err.response?.data?.message || err.message, err.response?.status || 500);
    }
  }

  // ===========
  // LOGOUT
  // ===========
  async logoutSession(sessionName) {
    try {
      const res = await this.axiosInstance.post(
        `/api/sessions/${sessionName}/logout`,
        {},
        { headers: this.getHeaders() }
      );
      return res.data;
    } catch (err) {
      throw new HttpException(err.response?.data?.message || err.message, err.response?.status || 500);
    }
  }
}
