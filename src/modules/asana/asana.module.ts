import { Module } from '@nestjs/common';
import { AsanaController } from './asana.controller';
import { AsanaService } from './asana.service';

@Module({
  controllers: [AsanaController],
  providers: [AsanaService],
})
export class AsanaModule {}
