export const MAIL_QUEUE = 'mail'
export type MailJobData = {
    to: string;
    subject: string;
    text: string;
}