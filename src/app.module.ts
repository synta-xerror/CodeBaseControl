import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { CodeCommitModule } from './modules/aws/code-commit/code-commit.module';
import { AsanaModule } from './modules/asana/asana.module';

@Module({
  imports: [CodeCommitModule, AsanaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
