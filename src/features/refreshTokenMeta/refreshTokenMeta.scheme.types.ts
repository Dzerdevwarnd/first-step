import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type RefreshTokenMetaDocument = HydratedDocument<RefreshTokenMeta>;

@Schema()
export class RefreshTokenMeta {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  deviceId: string;
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  ip: string;
  @Prop({ required: true })
  lastActiveDate: Date;

  @Prop({ required: true })
  expiredAt: Date;
}

export const RefreshTokenMetaSchema =
  SchemaFactory.createForClass(RefreshTokenMeta);

export type refreshTokensMetaTypeDB = {
  userId: string;
  deviceId: string;
  title: string;
  ip: any;
  lastActiveDate: Date;
  expiredAt: Date;
};
