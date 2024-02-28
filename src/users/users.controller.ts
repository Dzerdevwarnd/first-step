import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { usersPaginationType } from './users.scheme.types';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(protected userService: UsersService) {}
  @Get()
  async getUsersWithPagination(
    @Query() query: { object },
    @Res() res: Response,
  ) {
    const usersPagination: usersPaginationType =
      await this.userService.returnAllUsers(query);
    res.status(200).send(usersPagination);
    return;
  }
  @Post()
  async createUser(
    @Body()
    body: {
      login: string;
      password: string;
      email: string;
    },
    @Res() res: Response,
  ) {
    const newUser = await this.userService.createUser(body);
    res.status(201).send(newUser);
    return;
  }
  @Delete(':id')
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
