import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { UserService } from '../user/user.service.js';
import { MailService } from './mail.service.js';
import { PURCHASE_PAID, type PurchasePaidEvent } from '../purchase/events/purchase-paid.event.js';
import { USER_REGISTERED, type UserRegisteredEvent } from '../auth/events/user-registered.event.js';

@Injectable()
export class NotificationListner {
    private readonly logger = new Logger(NotificationListner.name);
    constructor(
        private readonly userService: UserService,
        private readonly mail: MailService,
    ) {}

    @OnEvent(PURCHASE_PAID)
    async onPurchasePaid(e: PurchasePaidEvent){
        try{
            const user =  await this.userService.findById(e.userId);
            if(!user || user.email.toLowerCase() !== e.tokenEmail.toLowerCase()) {
                this.logger.warn(`Token email does not match stored email for ${e.userId}; not sending`);
                return ;
            }
            await this.mail.send(
                user.email,
                `Purchase confirmed: ${e.courseName}`,
                `Hi ${user.fname}, you bought "${e.courseName}" for ${e.amount}. Reference: ${e.paymentReference}`,
            );
        } catch(err){
            this.logger.error(`Error sending purchase confirmation for ${e.userId}:`, err);
        }
    }

    @OnEvent(USER_REGISTERED)
    async onUserRegistered(e: UserRegisteredEvent){
        try{
            await this.mail.send(
                e.email,
                'Welcome to EduShare',
                `Hi ${e.fname}, you have been registered as a ${e.role}.`
            );
        } catch(err){
            this.logger.error(`Error sending welcome email for ${e.email}:`, err);
        }
    }
    
}