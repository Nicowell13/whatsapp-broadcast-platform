import { Injectable, HttpException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class WahaService {
  constructor() {
    this.wahaApiUrl = process.env.WAHA_API_URL || 'http://localhost:3000';
    this.wahaApiKey = process.env.WAHA_API_KEY || '';
    
    this.axiosInstance = axios.create({ 
      baseURL: this.wahaApiUrl,
    });

    // Debug log (will appear in backend container logs)
    console.log('[WAHA] Service initialized', {
      baseURL: this.wahaApiUrl,
      hasApiKey: !!this.wahaApiKey,
      apiKeyValue: this.wahaApiKey ? `${this.wahaApiKey.substring(0, 10)}...` : 'none',
    });
  }

  // Helper to get headers with API key
  getHeaders() {
    const headers = {};
    if (this.wahaApiKey?.trim()) {
      headers['X-Api-Key'] = this.wahaApiKey;
    }
    return headers;
  }

  async getSessions() {
    try {
      // Use WAHA documented endpoint: GET /api/sessions
      const response = await this.axiosInstance.get('/api/sessions', {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      const httpStatus = error.response?.status || 500;
      const data = error.response?.data;
      throw new HttpException(data?.message || error.message, httpStatus);
    }
  }

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
      return response.data;
    } catch (error) {
      const status = error.response?.status || 500;
      const data = error.response?.data;
      console.error('[WAHA] createSession error', { 
        sessionName, 
        status, 
        data, 
        message: error.message 
      });
      
      // If session already exists (422), provide helpful message
      if (status === 422 && data?.message?.includes('already exists')) {
        throw new HttpException(
          `Session '${sessionName}' already exists. Please delete it first or use a different name.`,
          status
        );
      }
      
      throw new HttpException(data?.message || error.message, status);
    }
  }

  async getSessionQR(sessionName) {
    try {
      const response = await this.axiosInstance.get(
        `/api/sessions/${sessionName}/auth/qr`,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      const status = error.response?.status || 500;
      const data = error.response?.data;
      console.error('[WAHA] getSessionQR error', { sessionName, status, data });
      throw new HttpException(data?.message || error.message, status);
    }
  }

  async getSessionStatus(sessionName) {
    try {
      // WAHA docs: GET /api/sessions/{name}
      const response = await this.axiosInstance.get(
        `/api/sessions/${sessionName}`,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      const status = error.response?.status || 500;
      const data = error.response?.data;
      throw new HttpException(data?.message || error.message, status);
    }
  }

  async sendMessage(sessionName, phone, text) {
    try {
      const response = await this.axiosInstance.post(
        '/api/sendText',
        {
          session: sessionName,
          chatId: `${phone}@c.us`,
          text: text,
        },
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      const status = error.response?.status || 500;
      const data = error.response?.data;
      throw new HttpException(data?.message || error.message, status);
    }
  }

  async sendImage(sessionName, phone, imageUrl, caption = '') {
    try {
      const response = await this.axiosInstance.post(
        '/api/sendImage',
        {
          session: sessionName,
          chatId: `${phone}@c.us`,
          file: {
            url: imageUrl,
          },
          caption: caption,
        },
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      const status = error.response?.status || 500;
      const data = error.response?.data;
      throw new HttpException(data?.message || error.message, status);
    }
  }

  async sendButtonsWithImage(sessionName, phone, imageUrl, text, buttons) {
    try {
      // Format buttons untuk WAHA API
      const formattedButtons = buttons.map((btn, index) => ({
        id: `btn_${index}`,
        text: btn.text,
        url: btn.url,
      }));

      const response = await this.axiosInstance.post(
        '/api/sendButtons',
        {
          session: sessionName,
          chatId: `${phone}@c.us`,
          text: text,
          image: imageUrl ? { url: imageUrl } : null,
          buttons: formattedButtons,
        },
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      const status = error.response?.status || 500;
      const data = error.response?.data;
      throw new HttpException(data?.message || error.message, status);
    }
  }

  async deleteSession(sessionName) {
    try {
      const response = await this.axiosInstance.delete(
        `/api/sessions/${sessionName}`,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      const status = error.response?.status || 500;
      const data = error.response?.data;
      throw new HttpException(data?.message || error.message, status);
    }
  }

  async logoutSession(sessionName) {
    try {
      const response = await this.axiosInstance.post(
        `/api/sessions/${sessionName}/logout`,
        {},
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      const status = error.response?.status || 500;
      const data = error.response?.data;
      throw new HttpException(data?.message || error.message, status);
    }
  }
}
