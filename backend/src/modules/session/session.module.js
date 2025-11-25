import { Module } from '@nestjs/common';
import { SessionController } from './session.controller';

@Module({
  imports: [],
  controllers: [SessionController],
})
export class SessionModule {}
