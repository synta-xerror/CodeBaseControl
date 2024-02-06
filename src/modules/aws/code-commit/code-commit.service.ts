import { Injectable } from '@nestjs/common';
import {
  CodeCommitClient,
  ListRepositoriesCommand,
  GetFolderCommand,
} from '@aws-sdk/client-codecommit';
import { fromIni } from '@aws-sdk/credential-provider-ini'; // Optional, for loading credentials

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
    // Create a command instance and send it using the client
    const command = new ListRepositoriesCommand({});
    try {
      const data = await this.codeCommitClient.send(command);
      return data.repositories; // Assuming the response structure is similar to v2
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

  async getFileContents() {}

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
      let currentNode = {
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
      return null; // Optionally handle non-existent folders
    }
  }
}
