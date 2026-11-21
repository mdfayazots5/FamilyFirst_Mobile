import { TaskCompletionRepository } from '../../features/child/repositories/TaskCompletionRepository';

/**
 * Task photo upload facade (public API unchanged). The upload lives in
 * TaskCompletionRepository.uploadPhoto, which performs a real presigned PUT and rejects on failure.
 */
export const S3UploadService = {
  uploadImage: (
    familyId: string,
    taskId: string,
    file: File,
    onProgress?: (progress: number) => void,
  ): Promise<string> => TaskCompletionRepository.uploadPhoto(familyId, taskId, file, onProgress),
};
