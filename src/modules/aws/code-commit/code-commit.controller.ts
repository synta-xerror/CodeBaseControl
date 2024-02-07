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

  @Get('/diffLastTwoCommits')
  async diffLastTwoCommits(
    @Query('repositoryName') repositoryName: string = 'codebasecontrol',
    @Query('branchName') branchName: string = 'main',
  ) {
    return this.codeCommitService.diffLastTwoCommits(
      repositoryName,
      branchName,
    );
  }

  @Get('/recentCommits')
  async getRecentCommits(
    @Query('repositoryName') repositoryName: string = 'codebasecontrol',
    @Query('branchName') branchName: string = 'main',
    @Query('maxCommits') maxCommits: string = "10", // Received as string, needs conversion to number
  ) {
    // Convert maxCommits query parameter to number with a default value
    const maxCommitsNumber = maxCommits ? parseInt(maxCommits, 10) : 10; // Default to 10 if not specified
    if (isNaN(maxCommitsNumber)) {
      throw new Error('maxCommits must be a valid number');
    }
    return this.codeCommitService.listRecentCommits(
      repositoryName,
      branchName,
      maxCommitsNumber,
    );
  }
}
