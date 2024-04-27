import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { UsersMongoRepository } from 'src/endPointsEntities/users/users.repository';

@Injectable()
export class EmailAdapter {
  constructor(protected usersMongoRepository: UsersMongoRepository) {}
  async sendConfirmEmail(email: string) {
    const user = await this.usersMongoRepository.findDBUser(email);
    const transport = await nodemailer.createTransport({
      service: 'gmail',
      auth: { user: 'dzerdevwarnd3@gmail.com', pass: 'tjqt bbvt kmzl onzs' },
    });
    const info = await transport.sendMail({
      from: 'Warnd<dzerdevwarnd3@gmail.com>',
      to: email,
      subject: 'Email confirmation',
      html: `<h1>Thank for your registration</h1>
 <p>To finish registration please follow the link below:
     <a href='https://somesite.com/confirm-email?code=${user?.emailConfirmationData.confirmationCode}'>complete registration</a>
 </p>`,
    });
    return;
  }
  async sendRecoveryCode(email: string, recoveryCode: string) {
    const transport = await nodemailer.createTransport({
      service: 'gmail',
      auth: { user: 'dzerdevwarnd3@gmail.com', pass: 'tjqt bbvt kmzl onzs' },
    });
    const info = await transport.sendMail({
      from: 'Warnd<dzerdevwarnd3@gmail.com>',
      to: email,
      subject: 'Email confirmation',
      html: `<h1>Password recovery</h1>
			<p>To finish password recovery please follow the link below:
				 <a href='https://somesite.com/password-recovery?recoveryCode=${recoveryCode}'>recovery password</a>
		 </p>`,
    });
    return;
  }
}
