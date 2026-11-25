import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { UserService } from '../user/user.service.js';
import { PURCHASE_PAID, type PurchasePaidEvent } from '../purchase/events/purchase-paid.event.js';
import { USER_REGISTERED, type UserRegisteredEvent } from '../auth/events/user-registered.event.js';
import { InjectQueue } from '@nestjs/bullmq';
import type { Queue } from 'bullmq';
import { MAIL_QUEUE, MailJobData } from './mail.job.js';

@Injectable()
export class NotificationListner {
    private readonly logger = new Logger(NotificationListner.name);
    constructor(
        private readonly userService: UserService,
        @InjectQueue(MAIL_QUEUE) private readonly mailQueue: Queue<MailJobData>
    ) { }

    private enqueue(data: MailJobData, jobId: string) {
        return this.mailQueue.add('send', data, {
            jobId,
            attempts: 5,
            backoff: { type: 'exponential', delay: 2000 },
            removeOnComplete: { age: 3600 },
            removeOnFail: { count: 100 },
        });
    }

    @OnEvent(PURCHASE_PAID)
    async onPurchasePaid(e: PurchasePaidEvent) {
        try {
            const user = await this.userService.findById(e.userId);
            if (!user || user.email.toLowerCase() !== e.tokenEmail.toLowerCase()) {
                this.logger.warn(`Token email does not match stored email for ${e.userId}; not sending`);
                return;
            }


            await this.enqueue({
                to: user.email, subject: `Purchase confirmed: ${e.courseName}`,
                text: `you bought "${e.courseName}" for ${e.amount}. Reference: ${e.paymentReference}`
            }, `purchase-${e.paymentReference}`)
        } catch (err) {
            this.logger.error(`Error sending purchase confirmation for ${e.userId}:`, err);
        }
    }

    @OnEvent(USER_REGISTERED)
    async onUserRegistered(e: UserRegisteredEvent) {
        try {
            await this.enqueue({
                to: e.email, subject: `Verify your email`,
                text: `Hi ${e.fname}, confirm your email by opening this link (valid for 24 hours):\n${e.verifyUrl}`
            }, `verify-${e.email}`)
        } catch (err) {
            this.logger.error(`Error sending welcome email for ${e.email}:`, err);
        }
    }

}