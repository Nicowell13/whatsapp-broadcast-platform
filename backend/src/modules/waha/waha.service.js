import { Injectable, HttpException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class WahaService {
  constructor() {
    this.wahaApiUrl = process.env.WAHA_API_URL || 'http://localhost:3000';
    this.wahaApiKey = process.env.WAHA_API_KEY || '';
    
    // Create axios instance with default config
    // Only add Authorization header if API key is set and not empty
    const headers = {};
    if (this.wahaApiKey?.trim()) {
      // Primary WAHA header
      headers['X-Api-Key'] = this.wahaApiKey;
      // Fallback: some WAHA versions expect Authorization Bearer
      headers['Authorization'] = `Bearer ${this.wahaApiKey}`;
    }
    this.axiosInstance = axios.create({ baseURL: this.wahaApiUrl, headers });
  }

  async getSessions() {
    try {
      const response = await this.axiosInstance.get('/api/sessions');
      return response.data;
    } catch (error) {
      throw new HttpException(error.message, error.response?.status || 500);
    }
  }

  async createSession(sessionName) {
    try {
      const response = await this.axiosInstance.post('/api/sessions', {
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
      });
      return response.data;
    } catch (error) {
      throw new HttpException(error.message, error.response?.status || 500);
    }
  }

  async getSessionQR(sessionName) {
    try {
      const response = await this.axiosInstance.get(
        `/api/sessions/${sessionName}/auth/qr`,
      );
      return response.data;
    } catch (error) {
      throw new HttpException(error.message, error.response?.status || 500);
    }
  }

  async getSessionStatus(sessionName) {
    try {
      const response = await this.axiosInstance.get(
        `/api/sessions/${sessionName}/status`,
      );
      return response.data;
    } catch (error) {
      throw new HttpException(error.message, error.response?.status || 500);
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
      );
      return response.data;
    } catch (error) {
      throw new HttpException(error.message, error.response?.status || 500);
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
      );
      return response.data;
    } catch (error) {
      throw new HttpException(error.message, error.response?.status || 500);
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
      );
      return response.data;
    } catch (error) {
      throw new HttpException(error.message, error.response?.status || 500);
    }
  }

  async deleteSession(sessionName) {
    try {
      const response = await this.axiosInstance.delete(
        `/api/sessions/${sessionName}`,
      );
      return response.data;
    } catch (error) {
      throw new HttpException(error.message, error.response?.status || 500);
    }
  }

  async logoutSession(sessionName) {
    try {
      const response = await this.axiosInstance.post(
        `/api/sessions/${sessionName}/logout`,
      );
      return response.data;
    } catch (error) {
      throw new HttpException(error.message, error.response?.status || 500);
    }
  }
}
