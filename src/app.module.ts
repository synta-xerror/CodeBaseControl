import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CodeCommitService } from './modules/aws/code-commit/code-commit.service';
import { CodeCommitController } from './modules/aws/code-commit/code-commit.controller';

@Module({
  imports: [],
  controllers: [AppController, CodeCommitController],
  providers: [AppService, CodeCommitService],
})
export class AppModule {}
