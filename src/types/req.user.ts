import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const currentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

export type requestUserWithDeviceId = {
  deviceId: string;
};

export type requestUserWithUserId = {
  userId: string;
};
//
export type requestUserWithId = {
  id: string;
};
export type requestUser = {
  userId: string;
  email: string;
  deviceId: string;
  id: string;
};
