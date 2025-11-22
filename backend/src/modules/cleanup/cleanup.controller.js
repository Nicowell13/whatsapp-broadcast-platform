import { Controller, Post, UseGuards, Inject } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CleanupService } from './cleanup.service';

@Controller('cleanup')
@UseGuards(JwtAuthGuard)
export class CleanupController {
  constructor(@Inject(CleanupService) cleanupService) {
    this.cleanupService = cleanupService;
  }

  @Post('manual')
  async manualCleanup() {
    return this.cleanupService.manualCleanup();
  }
}
