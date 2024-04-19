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
import { BasicAuthGuard } from 'src/auth/guards/basic.auth.guard';
import { UsersService } from './users.service';
import { CreateUserInputModelType, usersPaginationType } from './users.types';

@Controller('users')
export class UsersController {
  constructor(protected userService: UsersService) {}

  @Get()
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
  @Post()
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
