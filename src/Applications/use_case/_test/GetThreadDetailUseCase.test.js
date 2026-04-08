import { describe, it, expect, vi } from 'vitest';
import GetThreadDetailUseCase from '../GetThreadDetailUseCase.js';
import DetailThread from '../../../Domains/threads/entities/DetailThread.js';

describe('GetThreadDetailUseCase', () => {
  it('should get thread detail correctly', async () => {
    // Arrange
    const threadId = 'thread-123';

    const mockThreadData = {
      id: threadId,
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: new Date(),
      username: 'dicoding',
    };

    const mockThreadRepository = {
      verifyThreadExists: vi.fn().mockImplementation(() => Promise.resolve()),
      getThreadById: vi.fn().mockImplementation(() => Promise.resolve(mockThreadData)),
    };

    const mockCommentRepository = {
      getCommentsByThreadId: vi.fn().mockImplementation(() => Promise.resolve([])),
      getLikeCountByCommentId: vi.fn(),
    };

    const mockReplyRepository = {
      getRepliesByCommentId: vi.fn(),
    };

    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const threadDetail = await getThreadDetailUseCase.execute(threadId);

    // Assert
    expect(threadDetail).toStrictEqual(new DetailThread({
      ...mockThreadData,
      comments: [],
    }));
    expect(mockThreadRepository.verifyThreadExists).toHaveBeenCalledWith(threadId);
    expect(mockThreadRepository.getThreadById).toHaveBeenCalledWith(threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toHaveBeenCalledWith(threadId);
  });

  it('should get thread detail with comments and replies correctly', async () => {
    // Arrange
    const threadId = 'thread-123';

    const mockThreadData = {
      id: threadId,
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: new Date(),
      username: 'dicoding',
    };

    const mockComments = [
      {
        id: 'comment-123',
        username: 'johndoe',
        date: new Date(),
        content: 'sebuah comment',
        isDelete: false,
      },
      {
        id: 'comment-456',
        username: 'dicoding',
        date: new Date(),
        content: 'sebuah comment dihapus',
        isDelete: true,
      },
    ];

    const mockReplies = [
      {
        id: 'reply-123',
        username: 'dicoding',
        date: new Date(),
        content: 'sebuah reply',
        isDelete: false,
      },
      {
        id: 'reply-456',
        username: 'johndoe',
        date: new Date(),
        content: 'sebuah reply dihapus',
        isDelete: true,
      },
    ];

    const mockThreadRepository = {
      verifyThreadExists: vi.fn().mockImplementation(() => Promise.resolve()),
      getThreadById: vi.fn().mockImplementation(() => Promise.resolve(mockThreadData)),
    };

    const mockCommentRepository = {
      getCommentsByThreadId: vi.fn().mockImplementation(() => Promise.resolve(mockComments)),
      getLikeCountByCommentId: vi.fn().mockImplementation(() => Promise.resolve(2)),
    };

    const mockReplyRepository = {
      getRepliesByCommentId: vi.fn().mockImplementation(() => Promise.resolve(mockReplies)),
    };

    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const threadDetail = await getThreadDetailUseCase.execute(threadId);

    // Assert
    expect(threadDetail.comments).toHaveLength(2);
    expect(threadDetail.comments[0].content).toEqual('sebuah comment');
    expect(threadDetail.comments[1].content).toEqual('**komentar telah dihapus**');
    expect(threadDetail.comments[0].replies).toHaveLength(2);
    expect(threadDetail.comments[0].replies[0].content).toEqual('sebuah reply');
    expect(threadDetail.comments[0].replies[1].content).toEqual('**balasan telah dihapus**');
    expect(threadDetail.comments[0].likeCount).toEqual(2);
    expect(threadDetail.comments[1].likeCount).toEqual(2);
    expect(mockReplyRepository.getRepliesByCommentId).toHaveBeenCalledWith('comment-123');
    expect(mockReplyRepository.getRepliesByCommentId).toHaveBeenCalledWith('comment-456');
    expect(mockCommentRepository.getLikeCountByCommentId).toHaveBeenCalledWith('comment-123');
    expect(mockCommentRepository.getLikeCountByCommentId).toHaveBeenCalledWith('comment-456');
  });
});
