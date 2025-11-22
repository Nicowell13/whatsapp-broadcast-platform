import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CampaignsModule } from './modules/campaigns/campaigns.module';
import { ContactsModule } from './modules/contacts/contacts.module';
import { MessagesModule } from './modules/messages/messages.module';
import { WahaModule } from './modules/waha/waha.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { QueueModule } from './modules/queue/queue.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { CleanupModule } from './modules/cleanup/cleanup.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Scheduler for cron jobs
    ScheduleModule.forRoot(),

    // Database
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT) || 5432,
      username: process.env.DATABASE_USER || 'wa_admin',
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME || 'whatsapp_broadcast',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // Set false in production, use migrations
      logging: false,
    }),

    // Redis Queue
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
      },
    }),

    // App Modules
    AuthModule,
    UsersModule,
    CampaignsModule,
    ContactsModule,
    MessagesModule,
    WahaModule,
    WebhooksModule,
    QueueModule,
    DashboardModule,
    CleanupModule,
  ],
})
export class AppModule {}
