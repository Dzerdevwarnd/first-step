import { BasicAuthGuard } from '@app/src/features/auth/guards/basic.auth.guard';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { UsersService } from '../../features/users/users.service';
import {
  CreateUserInputModelType,
  usersPaginationType,
} from '../../features/users/users.types';
import { JwtService } from '../auth/jwt/jwtService';

@Controller('sa')
export class SaUsersController {
  constructor(
    protected userService: UsersService,
    protected jwtService: JwtService,
  ) {}

  @UseGuards(BasicAuthGuard)
  @Get('users')
  async getUsersWithPagination(
    @Query() query: { object },
    @Res() res: Response,
  ) {
    const usersPagination: usersPaginationType =
      await this.userService.returnUsersWithPagination(query);
    res.status(200).send(usersPagination);
    return;
  }

  @UseGuards(BasicAuthGuard)
  @Post('users')
  async createUser(
    @Body()
    body: CreateUserInputModelType,
    @Res() res: Response,
  ) {
    const newUser = await this.userService.createUser(body);
    res.status(201).send(newUser);
    return;
  }

  @UseGuards(BasicAuthGuard)
  @Delete('users/:id')
  async deleteUserByID(@Param() params: { id }, @Res() res: Response) {
    const ResultOfDelete = await this.userService.deleteUser(params);
    if (!ResultOfDelete) {
      res.sendStatus(404);
      return;
    } else {
      res.sendStatus(204);
      return;
    }
  }
}
//
