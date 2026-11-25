import { OnWorkerEvent, Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { Job } from "bullmq";
import { MailService } from "./mail.service.js";
import { MailJobData, MAIL_QUEUE } from "./mail.job.js";

@Processor(MAIL_QUEUE, {concurrency: 5})
export class MailProcessor extends WorkerHost {
    private readonly logger= new Logger(MailProcessor.name);

    constructor(private readonly mailService: MailService){
        super();
    }
    async process(job: Job<MailJobData>) {
        await this.mailService.send(job.data.to, job.data.subject, job.data.text);
    }

    @OnWorkerEvent('failed')
    onFailed(job: Job<MailJobData>, err: Error) {
        this.logger.warn(`Mail job ${job.id} failed (attempt ${job.attemptsMade}): ${err.message}`);
    }
}