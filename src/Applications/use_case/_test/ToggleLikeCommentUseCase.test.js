import { describe, it, expect, vi } from 'vitest';
import ToggleLikeCommentUseCase from '../ToggleLikeCommentUseCase.js';

describe('ToggleLikeCommentUseCase', () => {
  it('should orchestrate the like action correctly when comment is not liked', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      userId: 'user-123',
    };

    const mockThreadRepository = {
      verifyThreadExists: vi.fn().mockImplementation(() => Promise.resolve()),
    };

    const mockCommentRepository = {
      verifyCommentExists: vi.fn().mockImplementation(() => Promise.resolve()),
      checkLikeState: vi.fn().mockImplementation(() => Promise.resolve(false)),
      likeComment: vi.fn().mockImplementation(() => Promise.resolve()),
      unlikeComment: vi.fn(),
    };

    const toggleLikeCommentUseCase = new ToggleLikeCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    await toggleLikeCommentUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyThreadExists).toHaveBeenCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.verifyCommentExists)
      .toHaveBeenCalledWith(useCasePayload.commentId, useCasePayload.threadId);
    expect(mockCommentRepository.checkLikeState)
      .toHaveBeenCalledWith(useCasePayload.commentId, useCasePayload.userId);
    expect(mockCommentRepository.likeComment)
      .toHaveBeenCalledWith(useCasePayload.commentId, useCasePayload.userId);
    expect(mockCommentRepository.unlikeComment).not.toHaveBeenCalled();
  });

  it('should orchestrate the unlike action correctly when comment is already liked', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      userId: 'user-123',
    };

    const mockThreadRepository = {
      verifyThreadExists: vi.fn().mockImplementation(() => Promise.resolve()),
    };

    const mockCommentRepository = {
      verifyCommentExists: vi.fn().mockImplementation(() => Promise.resolve()),
      checkLikeState: vi.fn().mockImplementation(() => Promise.resolve(true)),
      likeComment: vi.fn(),
      unlikeComment: vi.fn().mockImplementation(() => Promise.resolve()),
    };

    const toggleLikeCommentUseCase = new ToggleLikeCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    await toggleLikeCommentUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyThreadExists).toHaveBeenCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.verifyCommentExists)
      .toHaveBeenCalledWith(useCasePayload.commentId, useCasePayload.threadId);
    expect(mockCommentRepository.checkLikeState)
      .toHaveBeenCalledWith(useCasePayload.commentId, useCasePayload.userId);
    expect(mockCommentRepository.unlikeComment)
      .toHaveBeenCalledWith(useCasePayload.commentId, useCasePayload.userId);
    expect(mockCommentRepository.likeComment).not.toHaveBeenCalled();
  });
});
