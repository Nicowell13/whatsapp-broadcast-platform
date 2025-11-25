import {
  Controller,
  Get,
  Res,
  HttpException,
  Sse,
} from '@nestjs/common';
import axios from 'axios';
import { interval, map, switchMap } from 'rxjs';

@Controller('session')
export class SessionController {
  constructor() {
    this.wahaUrl = process.env.WAHA_API_URL || 'http://waha:3000';
  }

  // Manual QR (1x fetch)
  @Get('qr')
  async getQr(@Res() res) {
    try {
      const screenshot = await axios.get(`${this.wahaUrl}/api/screenshot`, {
        responseType: 'arraybuffer',
      });

      res.setHeader('Content-Type', 'image/png');
      return res.send(screenshot.data);
    } catch (err) {
      throw new HttpException('QR belum siap', 404);
    }
  }

  // Auto-refresh QR (SSE)
  @Sse('qr-stream')
  qrStream() {
    return interval(2000).pipe(
      switchMap(async () => {
        try {
          const ss = await axios.get(`${this.wahaUrl}/api/screenshot`, {
            responseType: 'arraybuffer',
          });

          const base64 = `data:image/png;base64,${Buffer.from(
            ss.data,
          ).toString('base64')}`;

          return { data: { qr: base64 } };
        } catch {
          return { data: { qr: null } };
        }
      }),
    );
  }

  // Start session + tunggu QR
  @Get('start')
  async startSession() {
    try {
      // start WAHA default session
      await axios.post(`${this.wahaUrl}/api/sessions/default/start`);

      // polling status WAHA sampai status = SCAN_QR_CODE
      for (let i = 0; i < 15; i++) {
        const res = await axios.get(`${this.wahaUrl}/api/sessions/default`);
        const status = res.data?.status;

        if (status === 'SCAN_QR_CODE') {
          return {
            status: 'READY_FOR_QR',
            message: 'QR siap, gunakan /session/qr-stream',
          };
        }

        await new Promise((r) => setTimeout(r, 2000));
      }

      return { status: 'WAITING', message: 'QR belum muncul, coba ulangi.' };
    } catch (e) {
      throw new HttpException('Gagal start session', 500);
    }
  }
}
