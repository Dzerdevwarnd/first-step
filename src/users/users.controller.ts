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

@Controller('users')
export class UsersController {
  constructor(protected userService: userService) {}
  @Get()
  async getUsersWithPagination(
    @Query() query: { object },
    @Res() res: Response,
  ) {
    const usersPagination: usersPaginationType =
      await userService.returnAllUsers(query);
    res.status(200).send(usersPagination);
    return;
  }
  @Post()
  async createUser(
    @Body()
    body: {
      name: string;
      description: string;
      websiteUrl: string;
    },
    @Res() res: Response,
  ) {
    const newUser = await userService.createUser(body);
    res.status(201).send(newUser);
    return;
  }
  @Delete(':id')
  async deleteUserByID(@Param() params: { id }, @Res() res: Response) {
    const ResultOfDelete = await userService.deleteUser(params);
    if (!ResultOfDelete) {
      res.sendStatus(404);
      return;
    } else {
      res.sendStatus(204);
      return;
    }
  }
}
