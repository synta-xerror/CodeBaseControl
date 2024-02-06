import { Controller, Get, Query } from '@nestjs/common';
import { CodeCommitService } from './code-commit.service';

@Controller('codeCommit')
export class CodeCommitController {
  constructor(private readonly codeCommitService: CodeCommitService) {}

  @Get('/repositories')
  async getRepositories() {
    return this.codeCommitService.listRepositories();
  }

  //endpoint to get file three of a repository
  @Get('/fileTree')
  async getFileTree() {
    console.log('getFileTree');
    return this.codeCommitService.getFileTree();
  }

  @Get('/fileDetails')
  async getFile(@Query('filePath') filePath: string) {
    return this.codeCommitService.getFileContents(filePath);
  }
}
