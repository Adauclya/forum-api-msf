import { describe, it, expect, vi } from 'vitest';
import DeleteReplyUseCase from '../DeleteReplyUseCase.js';
import AuthorizationError from '../../../Commons/exceptions/AuthorizationError.js';

describe('DeleteReplyUseCase', () => {
  it('should orchestrate the delete reply action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      replyId: 'reply-123',
      userId: 'user-123',
    };

    const mockThreadRepository = {
      verifyThreadExists: vi.fn().mockImplementation(() => Promise.resolve()),
    };

    const mockCommentRepository = {
      verifyCommentExists: vi.fn().mockImplementation(() => Promise.resolve()),
    };

    const mockReplyRepository = {
      verifyReplyExists: vi.fn().mockImplementation(() => Promise.resolve()),
      verifyReplyOwner: vi.fn().mockImplementation(() => Promise.resolve(true)),
      deleteReply: vi.fn().mockImplementation(() => Promise.resolve()),
    };

    const deleteReplyUseCase = new DeleteReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    await deleteReplyUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyThreadExists).toHaveBeenCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.verifyCommentExists)
      .toHaveBeenCalledWith(useCasePayload.commentId, useCasePayload.threadId);
    expect(mockReplyRepository.verifyReplyExists)
      .toHaveBeenCalledWith(useCasePayload.replyId, useCasePayload.commentId);
    expect(mockReplyRepository.verifyReplyOwner)
      .toHaveBeenCalledWith(useCasePayload.replyId, useCasePayload.userId);
    expect(mockReplyRepository.deleteReply).toHaveBeenCalledWith(useCasePayload.replyId);
  });

  it('should throw AuthorizationError when user is not reply owner', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      replyId: 'reply-123',
      userId: 'user-123',
    };

    const mockThreadRepository = {
      verifyThreadExists: vi.fn().mockImplementation(() => Promise.resolve()),
    };

    const mockCommentRepository = {
      verifyCommentExists: vi.fn().mockImplementation(() => Promise.resolve()),
    };

    const mockReplyRepository = {
      verifyReplyExists: vi.fn().mockImplementation(() => Promise.resolve()),
      verifyReplyOwner: vi.fn().mockImplementation(() => Promise.resolve(false)),
      deleteReply: vi.fn(),
    };

    const deleteReplyUseCase = new DeleteReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action & Assert
    expect(deleteReplyUseCase.execute(useCasePayload)).rejects.toThrow(AuthorizationError);
  });
});
