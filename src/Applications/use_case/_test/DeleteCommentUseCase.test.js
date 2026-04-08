import { describe, it, expect, vi } from 'vitest';
import DeleteCommentUseCase from '../DeleteCommentUseCase.js';
import AuthorizationError from '../../../Commons/exceptions/AuthorizationError.js';

describe('DeleteCommentUseCase', () => {
  it('should orchestrate the delete comment action correctly', async () => {
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
      verifyCommentOwner: vi.fn().mockImplementation(() => Promise.resolve(true)),
      deleteComment: vi.fn().mockImplementation(() => Promise.resolve()),
    };

    const deleteCommentUseCase = new DeleteCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    await deleteCommentUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyThreadExists).toHaveBeenCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.verifyCommentExists)
      .toHaveBeenCalledWith(useCasePayload.commentId, useCasePayload.threadId);
    expect(mockCommentRepository.verifyCommentOwner)
      .toHaveBeenCalledWith(useCasePayload.commentId, useCasePayload.userId);
    expect(mockCommentRepository.deleteComment).toHaveBeenCalledWith(useCasePayload.commentId);
  });

  it('should throw AuthorizationError when user is not comment owner', async () => {
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
      verifyCommentOwner: vi.fn().mockImplementation(() => Promise.resolve(false)),
      deleteComment: vi.fn(),
    };

    const deleteCommentUseCase = new DeleteCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action & Assert
    expect(deleteCommentUseCase.execute(useCasePayload)).rejects.toThrow(AuthorizationError);
  });
});
