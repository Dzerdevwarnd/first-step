import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BlacklistTokenDocument = HydratedDocument<BlacklistToken>;

@Schema()
export class BlacklistToken {
  @Prop({ required: true })
  token: string;

  @Prop({ required: true })
  expireDate: Date;
}

export const BlacklistTokenSchema =
  SchemaFactory.createForClass(BlacklistToken);

export type TokenDBType = { token: string; expireDate: Date };
