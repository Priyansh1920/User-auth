import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module.js';
import { MailService } from './mail.service.js';
import { NotificationListner } from './notification.listner.js';
@Module({
  imports: [UserModule],               // exports UserService
  providers: [MailService, NotificationListner],
})

export class NotificationModule {}