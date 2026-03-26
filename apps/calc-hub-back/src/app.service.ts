import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth(): { status: string; uptimeSec: number } {
    return {
      status: 'ok',
      uptimeSec: Math.floor(process.uptime()),
    };
  }
}
