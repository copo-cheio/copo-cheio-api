import { /* inject, */ BindingScope,injectable} from '@loopback/core';
import nodemailer from 'nodemailer';
@injectable({scope: BindingScope.TRANSIENT})


@injectable({scope: BindingScope.TRANSIENT})
export class EmailService {
  constructor(/* Add @inject to inject parameters */) {}

  async sendEmail(to: string, subject: string, text: string) {
    // Create transporter using Gmail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'pihh.rocks@gmail.com',  // Replace with your Gmail email
        // pass: 'google#9E1LetkJd@'      // Replace with your App Password or Gmail password (if less secure apps allowed)
        pass: 'umff mopf fmju okeb'      // Replace with your App Password or Gmail password (if less secure apps allowed)
      }
    });
    console.log({transporter})
    // Setup email data
    const mailOptions = {
      from: 'pihh.rocks@gmail.com',   // Your email address
      to: to,                        // Recipient's email
      subject: subject,              // Subject of the email
      text: text                     // Plain text body
    };

    // Send email
    return transporter.sendMail(mailOptions);
  }
}
