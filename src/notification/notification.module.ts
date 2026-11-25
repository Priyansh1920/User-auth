import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module.js';
import { MailService } from './mail.service.js';
import { NotificationListner } from './notification.listner.js';
import { BullModule } from '@nestjs/bullmq';
import { MailProcessor } from './mail.processor.js';
@Module({
  imports: [UserModule, BullModule.registerQueue({name: 'mail'})],               // exports UserService
  providers: [MailService, NotificationListner, MailProcessor],
})

export class NotificationModule {}