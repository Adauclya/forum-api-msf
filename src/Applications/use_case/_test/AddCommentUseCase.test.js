import { describe, it, expect, vi } from 'vitest';
import AddCommentUseCase from '../AddCommentUseCase.js';
import AddedComment from '../../../Domains/comments/entities/AddedComment.js';
import NotFoundError from '../../../Commons/exceptions/NotFoundError.js';

describe('AddCommentUseCase', () => {
  it('should orchestrate the add comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      userId: 'user-123',
      content: 'sebuah comment',
    };

    const mockAddedComment = {
      id: 'comment-123',
      content: useCasePayload.content,
      owner: useCasePayload.userId,
    };

    const mockThreadRepository = {
      verifyThreadExists: vi.fn().mockImplementation(() => Promise.resolve()),
    };

    const mockCommentRepository = {
      addComment: vi.fn().mockImplementation(() => Promise.resolve(mockAddedComment)),
    };

    const mockIdGenerator = vi.fn(() => '123');

    const addCommentUseCase = new AddCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      idGenerator: mockIdGenerator,
    });

    // Action
    const addedComment = await addCommentUseCase.execute(useCasePayload);

    // Assert
    expect(addedComment).toStrictEqual(
      new AddedComment({
        id: 'comment-123',
        content: useCasePayload.content,
        owner: useCasePayload.userId,
      }),
    );

    expect(mockThreadRepository.verifyThreadExists).toHaveBeenCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.addComment).toHaveBeenCalledWith(
      expect.objectContaining({
        content: useCasePayload.content,
        owner: useCasePayload.userId,
        threadId: useCasePayload.threadId,
      }),
    );
  });

  it('should throw NotFoundError when thread does not exist', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      userId: 'user-123',
      content: 'sebuah comment',
    };

    const mockThreadRepository = {
      verifyThreadExists: vi.fn().mockImplementation(() => Promise.reject(
        new NotFoundError('Thread tidak ditemukan'),
      )),
    };

    const mockCommentRepository = {
      addComment: vi.fn(),
    };

    const mockIdGenerator = vi.fn();

    const addCommentUseCase = new AddCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      idGenerator: mockIdGenerator,
    });

    // Action & Assert
    expect(addCommentUseCase.execute(useCasePayload)).rejects.toThrow(NotFoundError);
  });
});
