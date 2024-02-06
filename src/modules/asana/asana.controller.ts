import { Controller, Get, Query } from '@nestjs/common';
import { AsanaService } from './asana.service';

@Controller('asana')
export class AsanaController {
  constructor(private readonly asanaService: AsanaService) {}

  @Get('/task')
  getTask(@Query('taskId') taskId: string) {
    return this.asanaService.fetchAsanaTask(taskId);
  }
}
