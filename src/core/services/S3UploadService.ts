import { TaskCompletionRepository } from '../../features/child/repositories/TaskCompletionRepository';

export const S3UploadService = {
  uploadImage: async (file: File, onProgress?: (progress: number) => void): Promise<string> => {
    // 1. Get presigned URL
    const { presignedUrl, s3Key } = await TaskCompletionRepository.getUploadUrl(file.name);

    // 2. Simulate upload progress
    return new Promise((resolve, reject) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        if (onProgress) onProgress(progress);
        
        if (progress >= 100) {
          clearInterval(interval);
          // In demo mode, we return a random picsum URL as the "uploaded" image
          // In real mode, we would actually PUT to the presignedUrl
          resolve(`https://picsum.photos/seed/${s3Key}/800/600`);
        }
      }, 200);
    });
  }
};
