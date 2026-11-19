import nodemailer from "nodemailer";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class MailService {
    private readonly logger = new Logger(MailService.name);
    private readonly transporter;

    constructor(private readonly config: ConfigService){
        this.transporter = nodemailer.createTransport({
            host: config.getOrThrow('MAIL_HOST'),
            port: Number(config.getOrThrow('MAIL_PORT')),
            auth: { user: config.getOrThrow('MAIL_USER'), pass: config.getOrThrow('MAIL_PASS')},
        });
    }
    
    async send(to: string, subject: string, text: string){
        const info = await this.transporter.sendMail({
            from: this.config.getOrThrow('MAIL_FROM'), to, subject, text,
        });
        this.logger.log(`Email sent. Preview: ${nodemailer.getTestMessageUrl(info)}`);
    }
}