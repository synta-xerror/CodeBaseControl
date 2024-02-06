import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';

AWS.config.update({ region: 'us-east-1' });

@Injectable()
export class CodeCommitService {
  private codeCommit: AWS.CodeCommit;

  constructor() {
    this.codeCommit = new AWS.CodeCommit({ apiVersion: '2015-04-13' });
  }

  async listRepositories(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.codeCommit.listRepositories({}, (err, data) => {
        if (err) reject(err);
        else resolve(data.repositories);
      });
    });
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
    return new Promise((resolve, reject) => {
      console.log(
        `Requesting folder contents for path: '${folderPath}' in repository: '${repositoryName}' at commit: '${commitSpecifier}'`,
      );

      this.codeCommit.getFolder(
        { repositoryName, folderPath, commitSpecifier },
        async (err, data) => {
          if (err) {
            console.warn(`Folder does not exist: ${folderPath}, skipping.`);
            resolve(null); // Optionally handle non-existent folders
          } else {
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

            // Here's the critical adjustment for subfolder path concatenation
            const folderPromises =
              data.subFolders?.map((subFolder) => {
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
                console.warn(
                  `Failed to fetch subfolder contents: ${result.reason}`,
                );
              }
            });

            resolve(currentNode);
          }
        },
      );
    });
  }
}
