import { describe, it, expect, beforeEach, afterEach, afterAll } from 'vitest';
import pool from '../../../Infrastructures/database/postgres/pool.js';
import CommentRepositoryPostgres from '../CommentRepositoryPostgres.js';
import CommentsTableTestHelper from '../../../../tests/CommentsTableTestHelper.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import CommentLikesTableTestHelper from '../../../../tests/CommentLikesTableTestHelper.js';
import NotFoundError from '../../../Commons/exceptions/NotFoundError.js';
import { nanoid } from 'nanoid';

describe('CommentRepositoryPostgres', () => {
  let commentRepository;

  beforeEach(async () => {
    commentRepository = new CommentRepositoryPostgres(pool, nanoid);
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await CommentLikesTableTestHelper.cleanTable();
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await CommentLikesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment function', () => {
    it('should persist new comment and return added comment correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      const newComment = {
        id: 'comment-123',
        content: 'sebuah comment',
        owner: 'user-123',
        threadId: 'thread-123',
      };

      // Action
      const addedComment = await commentRepository.addComment(newComment);

      // Assert
      const comments = await CommentsTableTestHelper.findCommentsById('comment-123');
      expect(comments).toHaveLength(1);
      expect(addedComment.id).toEqual('comment-123');
      expect(addedComment.content).toEqual('sebuah comment');
      expect(addedComment.owner).toEqual('user-123');
    });
  });

  describe('getCommentsByThreadId function', () => {
    it('should return empty array when thread has no comments', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });

      // Action
      const comments = await commentRepository.getCommentsByThreadId('thread-123');

      // Assert
      expect(comments).toHaveLength(0);
    });

    it('should return comments with correct data', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        content: 'sebuah comment',
        owner: 'user-123',
        threadId: 'thread-123',
      });

      // Action
      const comments = await commentRepository.getCommentsByThreadId('thread-123');

      // Assert
      expect(comments).toHaveLength(1);
      expect(comments[0].id).toEqual('comment-123');
      expect(comments[0].content).toEqual('sebuah comment');
      expect(comments[0].username).toEqual('dicoding');
    });

    it('should return comments with is_delete true when comment is deleted', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await pool.query({
        text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5)',
        values: ['comment-123', 'sebuah comment', 'user-123', 'thread-123', true],
      });

      // Action
      const comments = await commentRepository.getCommentsByThreadId('thread-123');

      // Assert
      expect(comments).toHaveLength(1);
      expect(comments[0].content).toEqual('sebuah comment');
      expect(comments[0].isDelete).toBe(true);
    });
  });

  describe('verifyCommentExists function', () => {
    it('should not throw error when comment exists', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        owner: 'user-123',
        threadId: 'thread-123',
      });

      // Act and Assert
      await expect(commentRepository.verifyCommentExists('comment-123', 'thread-123')).resolves.not.toThrow();
    });

    it('should throw NotFoundError when comment does not exist', async () => {
      // Act and Assert
      await expect(commentRepository.verifyCommentExists('comment-xyz', 'thread-123')).rejects
        .toThrow(NotFoundError);
    });
  });

  describe('verifyCommentOwner function', () => {
    it('should return true when user owns the comment', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        owner: 'user-123',
        threadId: 'thread-123',
      });

      // Action
      const isOwner = await commentRepository.verifyCommentOwner('comment-123', 'user-123');

      // Assert
      expect(isOwner).toBe(true);
    });

    it('should return false when user does not own the comment', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await UsersTableTestHelper.addUser({ id: 'user-456', username: 'johndoe' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        owner: 'user-123',
        threadId: 'thread-123',
      });

      // Action
      const isOwner = await commentRepository.verifyCommentOwner('comment-123', 'user-456');

      // Assert
      expect(isOwner).toBe(false);
    });
  });

  describe('deleteComment function', () => {
    it('should soft delete comment correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        owner: 'user-123',
        threadId: 'thread-123',
      });

      // Action
      await commentRepository.deleteComment('comment-123');

      // Assert
      const updatedComments = await CommentsTableTestHelper.findCommentsById('comment-123');
      expect(updatedComments[0].is_delete).toBe(true);
    });
  });

  describe('checkLikeState function', () => {
    it('should return true if like exists', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', owner: 'user-123' });
      await CommentLikesTableTestHelper.addLike({ id: 'like-123', commentId: 'comment-123', owner: 'user-123' });

      // Action
      const isLiked = await commentRepository.checkLikeState('comment-123', 'user-123');

      // Assert
      expect(isLiked).toBe(true);
    });

    it('should return false if like does not exist', async () => {
      // Action
      const isLiked = await commentRepository.checkLikeState('comment-123', 'user-123');

      // Assert
      expect(isLiked).toBe(false);
    });
  });

  describe('likeComment function', () => {
    it('should persist like correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', owner: 'user-123' });

      // Action
      await commentRepository.likeComment('comment-123', 'user-123');

      // Assert
      const likes = await CommentLikesTableTestHelper.findLikesById('like-123');
      expect(likes).toHaveLength(1);
    });
  });

  describe('unlikeComment function', () => {
    it('should remove like correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', owner: 'user-123' });
      await CommentLikesTableTestHelper.addLike({ id: 'like-123', commentId: 'comment-123', owner: 'user-123' });

      // Action
      await commentRepository.unlikeComment('comment-123', 'user-123');

      // Assert
      const likes = await CommentLikesTableTestHelper.findLikesById('like-123');
      expect(likes).toHaveLength(0);
    });
  });

  describe('getLikeCountByCommentId function', () => {
    it('should return the correct like count', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await UsersTableTestHelper.addUser({ id: 'user-456', username: 'johndoe' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', owner: 'user-123' });
      await CommentLikesTableTestHelper.addLike({ id: 'like-1', commentId: 'comment-123', owner: 'user-123' });
      await CommentLikesTableTestHelper.addLike({ id: 'like-2', commentId: 'comment-123', owner: 'user-456' });

      // Action
      const likeCount = await commentRepository.getLikeCountByCommentId('comment-123');

      // Assert
      expect(likeCount).toEqual(2);
    });
  });
});
