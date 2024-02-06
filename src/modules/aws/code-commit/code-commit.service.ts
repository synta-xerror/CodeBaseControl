import { Injectable } from '@nestjs/common';
import {
  CodeCommitClient,
  ListRepositoriesCommand,
  GetFolderCommand,
  GetFileCommand,
} from '@aws-sdk/client-codecommit';

@Injectable()
export class CodeCommitService {
  private codeCommitClient: CodeCommitClient;

  constructor() {
    // Initialize the CodeCommit client
    this.codeCommitClient = new CodeCommitClient({
      region: 'us-east-1',
    });
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
    commitSpecifier = 'main',
  ): Promise<any> {
    return this.fetchFolderContents(repositoryName, '', commitSpecifier);
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
