import { describe, it, expect, vi } from 'vitest';
import AddReplyUseCase from '../AddReplyUseCase.js';
import AddedReply from '../../../Domains/replies/entities/AddedReply.js';

describe('AddReplyUseCase', () => {
  it('should orchestrate the add reply action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      userId: 'user-123',
      content: 'sebuah reply',
    };

    const mockAddedReply = {
      id: 'reply-123',
      content: useCasePayload.content,
      owner: useCasePayload.userId,
    };


    const mockThreadRepository = {
      verifyThreadExists: vi.fn().mockImplementation(() => Promise.resolve()),
    };

    const mockCommentRepository = {
      verifyCommentExists: vi.fn().mockImplementation(() => Promise.resolve()),
    };

    const mockReplyRepository = {
      addReply: vi.fn().mockImplementation(() => Promise.resolve(mockAddedReply)),
    };

    const mockIdGenerator = vi.fn(() => '123');

    const addReplyUseCase = new AddReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
      idGenerator: mockIdGenerator,
    });

    // Action
    const addedReply = await addReplyUseCase.execute(useCasePayload);

    // Assert
    expect(addedReply).toStrictEqual(new AddedReply({
      id: 'reply-123',
      content: useCasePayload.content,
      owner: useCasePayload.userId,
    }));

    expect(mockThreadRepository.verifyThreadExists).toHaveBeenCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.verifyCommentExists)
      .toHaveBeenCalledWith(useCasePayload.commentId, useCasePayload.threadId);
    expect(mockReplyRepository.addReply).toHaveBeenCalledWith(
      expect.objectContaining({
        content: useCasePayload.content,
        owner: useCasePayload.userId,
        commentId: useCasePayload.commentId,
      }),
    );
  });
});
