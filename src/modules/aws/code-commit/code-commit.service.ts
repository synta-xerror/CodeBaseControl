import { Injectable } from '@nestjs/common';
import {
  CodeCommitClient,
  ListRepositoriesCommand,
  GetFolderCommand,
  GetFileCommand,
  GetBranchCommand,
} from '@aws-sdk/client-codecommit';

@Injectable()
export class CodeCommitService {
  private codeCommitClient: CodeCommitClient;
  private cache: Map<string, any>;

  constructor() {
    this.codeCommitClient = new CodeCommitClient({
      region: 'us-east-1',
    });
    this.cache = new Map();
  }

  async listRepositories(): Promise<any> {
    const command = new ListRepositoriesCommand({});
    try {
      const data = await this.codeCommitClient.send(command);
      return data.repositories;
    } catch (err) {
      throw err;
    }
  }

  async getFileTree(
    repositoryName = 'codebasecontrol',
    branchName = 'main',
  ): Promise<any> {
    // Check the latest commit ID for the branch
    const branchData = await this.getLatestCommitId(repositoryName, branchName);
    const cacheKey = `${repositoryName}-${branchName}-${branchData.commitId}`;
    if (this.cache.has(cacheKey)) {
      console.log('Cache hit');
      return this.cache.get(cacheKey);
    } else {
      const fileTree = await this.fetchFolderContents(
        repositoryName,
        '',
        branchData.commitId,
      );
      this.cache.set(cacheKey, fileTree);
      return fileTree;
    }
  }

  private async getLatestCommitId(
    repositoryName: string,
    branchName: string,
  ): Promise<any> {
    const command = new GetBranchCommand({
      repositoryName,
      branchName,
    });
    const data = await this.codeCommitClient.send(command);
    return { commitId: data.branch.commitId };
  }

  async getFileContents(
    filePath: string,
    repositoryName: string = 'codebasecontrol',
    commitSpecifier: string = 'main',
  ) {
    try {
      // Get contents of the file
      const command = new GetFileCommand({
        repositoryName,
        filePath,
        commitSpecifier,
      });
      const data = await this.codeCommitClient.send(command);
      // Assuming the file content is UTF-8 encoded text
      const fileContent = new TextDecoder('utf-8').decode(data.fileContent);
      return fileContent;
    } catch (err) {
      throw err;
    }
  }

  async getMultipleFileContents(
    filePaths: string[],
    repositoryName: string = 'codebasecontrol',
    commitSpecifier: string = 'main',
  ): Promise<any[]> {
    try {
      const fileContentPromises = filePaths.map((filePath) =>
        this.getFileContents(filePath, repositoryName, commitSpecifier),
      );
      const fileContents = await Promise.all(fileContentPromises);
      return fileContents.map((content, index) => ({
        filePath: filePaths[index],
        content,
      }));
    } catch (err) {
      throw err;
    }
  }

  private async fetchFolderContents(
    repositoryName: string,
    folderPath: string,
    commitSpecifier: string,
  ): Promise<any> {
    const command = new GetFolderCommand({
      repositoryName,
      folderPath,
      commitSpecifier,
    });

    try {
      const data = await this.codeCommitClient.send(command);
      const currentNode = {
        path: folderPath,
        type: 'directory',
        children: [],
      };

      data.files?.forEach((file) => {
        currentNode.children.push({
          path: file.absolutePath,
          type: 'file',
        });
      });

      // Process subFolders similar to your existing logic
      const folderPromises =
        data.subFolders?.map(async (subFolder) => {
          const fullPath = folderPath
            ? `${folderPath}/${subFolder.relativePath}`
            : subFolder.relativePath;
          return this.fetchFolderContents(
            repositoryName,
            fullPath,
            commitSpecifier,
          );
        }) || [];

      const folders = await Promise.allSettled(folderPromises);
      folders.forEach((result) => {
        if (result.status === 'fulfilled' && result.value) {
          currentNode.children.push(result.value);
        } else if (result.status === 'rejected' && result.reason) {
          console.warn(`Failed to fetch subfolder contents: ${result.reason}`);
        }
      });

      return currentNode;
    } catch (err) {
      console.warn(`Folder does not exist: ${folderPath}, skipping.`);
      return null;
    }
  }
}
