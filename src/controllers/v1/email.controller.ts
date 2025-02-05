import {inject} from '@loopback/core';
import {post, requestBody} from '@loopback/rest';
import {EmailService} from '../../services/email.service';

export class EmailController {
  constructor(
    @inject('services.EmailService')
    private emailService: EmailService,
  ) {}

  @post('/send-sugestion-email')
  async sendEmail(
    @requestBody() emailData: {to: string; subject: string; text: string},
  ): Promise<object> {
    await this.emailService.sendEmail(
      emailData.to,
      emailData.subject,
      emailData.text,
    );
    return {message: 'Email sent successfully'};
  }
}
