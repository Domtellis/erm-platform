import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);
    private transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'localhost',
            port: Number(process.env.SMTP_PORT) || 1025,
            ignoreTLS: true,
        });
    }

    async sendAlert(to: string, subject: string, body: string) {
        try {
            const info = await this.transporter.sendMail({
                from: '"ERM Platform" <noreply@erm.local>',
                to,
                subject,
                text: body,
                html: body.replace(/\n/g, '<br>'),
            });
            this.logger.log(`Email sent: ${info.messageId}`);
        } catch (error) {
            this.logger.error(`Failed to send email: ${error.message}`);
        }
    }
}
