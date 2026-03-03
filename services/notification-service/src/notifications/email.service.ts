import { Injectable, Logger } from "@nestjs/common";
import * as nodemailer from "nodemailer";

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter;

  constructor() {
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT;
    this.logger.log(`[STARTUP] Email Config Status - Host: ${!!host}, Port: ${!!port}`);

    this.transporter = nodemailer.createTransport({
      host: host || "localhost",
      port: Number(port) || 1025,
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
        html: body.replace(/\n/g, "<br>"),
      });
      this.logger.log(`Email sent: ${info.messageId}`);
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`);
    }
  }
}
