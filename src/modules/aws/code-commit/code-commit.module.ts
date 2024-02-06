import { Module } from '@nestjs/common';
import { CodeCommitService } from './code-commit.service';
import { CodeCommitController } from './code-commit.controller';

@Module({
  providers: [CodeCommitService],
  controllers: [CodeCommitController],
})
export class CodeCommitModule {}
