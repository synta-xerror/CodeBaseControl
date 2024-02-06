import { Controller, Get, Query, Body, Post } from '@nestjs/common';
import { AsanaService } from './asana.service';

@Controller('asana')
export class AsanaController {
  constructor(private readonly asanaService: AsanaService) {}

  @Get('/task')
  getTask(@Query('taskId') taskId: string) {
    return this.asanaService.fetchAsanaTask(taskId);
  }

  @Post('/task/comment')
  async addCommentToTask(
    @Body('taskId') taskId: string,
    @Body('comment') comment: string,
  ) {
    try {
      return await this.asanaService.addCommentToTask(taskId, comment);
    } catch (error) {
      return error;
    }
  }
}
