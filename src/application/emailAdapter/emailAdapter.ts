import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { UsersService } from 'src/endPointsEntities/users/users.service';
import { UsersMongoRepository } from 'src/endPointsEntities/users/usersMongo.repository';

@Injectable()
export class EmailAdapter {
  constructor(
    protected usersMongoRepository: UsersMongoRepository,
    protected usersService: UsersService,
  ) {}
  async sendConfirmEmail(email: string) {
    const user = await this.usersService.findDBUser(email);
    const confirmationCode =
      user?.emailConfirmationData?.confirmationCode || user?.confirmationCode;
    const transport = await nodemailer.createTransport({
      service: 'gmail',
      auth: { user: 'dzerdevwarnd3@gmail.com', pass: 'tjqt bbvt kmzl onzs' },
    });
    const info = transport.sendMail({
      from: 'Warnd<dzerdevwarnd3@gmail.com>',
      to: email,
      subject: 'Email confirmation',
      html: `<h1>Thank for your registration</h1>
 <p>To finish registration please follow the link below:
     <a href='https://somesite.com/confirm-email?code=${confirmationCode}'>complete registration</a>
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
