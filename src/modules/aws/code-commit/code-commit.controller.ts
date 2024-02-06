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

  @Get('/multipleFileDetails')
  async getMultipleFiles(@Query('filePaths') filePaths: string) {
    console.log(filePaths);
    const filePathsArray = filePaths.split(',');
    return this.codeCommitService.getMultipleFileContents(filePathsArray);
  }
}
