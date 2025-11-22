import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(dashboardService) {
    this.dashboardService = dashboardService;
  }

  @Get('stats')
  async getStats() {
    return this.dashboardService.getStats();
  }

  @Get('activity')
  async getActivity() {
    return this.dashboardService.getRecentActivity();
  }
}
