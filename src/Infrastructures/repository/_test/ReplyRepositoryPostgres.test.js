import { describe, it, expect, beforeEach, afterEach, afterAll } from 'vitest';
import pool from '../../../Infrastructures/database/postgres/pool.js';
import ReplyRepositoryPostgres from '../ReplyRepositoryPostgres.js';
import RepliesTableTestHelper from '../../../../tests/RepliesTableTestHelper.js';
import CommentsTableTestHelper from '../../../../tests/CommentsTableTestHelper.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import NotFoundError from '../../../Commons/exceptions/NotFoundError.js';
import { nanoid } from 'nanoid';

describe('ReplyRepositoryPostgres', () => {
  let replyRepository;

  beforeEach(async () => {
    replyRepository = new ReplyRepositoryPostgres(pool, nanoid);
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await RepliesTableTestHelper.cleanTable();
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await RepliesTableTestHelper.cleanTable();
  });

  describe('addReply function', () => {
    it('should persist new reply and return added reply correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        owner: 'user-123',
        threadId: 'thread-123',
      });
      const newReply = {
        id: 'reply-123',
        content: 'sebuah reply',
        owner: 'user-123',
        commentId: 'comment-123',
      };

      // Action
      const addedReply = await replyRepository.addReply(newReply);

      // Assert
      const replies = await RepliesTableTestHelper.findRepliesById('reply-123');
      expect(replies).toHaveLength(1);
      expect(addedReply.id).toEqual('reply-123');
      expect(addedReply.content).toEqual('sebuah reply');
      expect(addedReply.owner).toEqual('user-123');
    });
  });

  describe('getRepliesByCommentId function', () => {
    it('should return empty array when comment has no replies', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        owner: 'user-123',
        threadId: 'thread-123',
      });

      // Action
      const replies = await replyRepository.getRepliesByCommentId('comment-123');

      // Assert
      expect(replies).toHaveLength(0);
    });

    it('should return replies with correct data', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        owner: 'user-123',
        threadId: 'thread-123',
      });
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        content: 'sebuah reply',
        owner: 'user-123',
        commentId: 'comment-123',
      });

      // Action
      const replies = await replyRepository.getRepliesByCommentId('comment-123');

      // Assert
      expect(replies).toHaveLength(1);
      expect(replies[0].id).toEqual('reply-123');
      expect(replies[0].content).toEqual('sebuah reply');
      expect(replies[0].username).toEqual('dicoding');
      expect(replies[0].is_delete).toBe(false);
    });

    it('should return replies with is_delete true when reply is deleted', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        owner: 'user-123',
        threadId: 'thread-123',
      });
      await pool.query({
        text: 'INSERT INTO replies VALUES($1, $2, $3, $4, $5)',
        values: ['reply-123', 'sebuah reply', 'user-123', 'comment-123', true],
      });

      // Action
      const replies = await replyRepository.getRepliesByCommentId('comment-123');

      // Assert
      expect(replies).toHaveLength(1);
      expect(replies[0].content).toEqual('sebuah reply');
      expect(replies[0].is_delete).toBe(true);
    });
  });

  describe('verifyReplyExists function', () => {
    it('should not throw error when reply exists', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        owner: 'user-123',
        threadId: 'thread-123',
      });
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        owner: 'user-123',
        commentId: 'comment-123',
      });

      // Act and Assert
      expect(replyRepository.verifyReplyExists('reply-123', 'comment-123')).resolves.not.toThrow();
    });

    it('should throw NotFoundError when reply does not exist', async () => {
      // Act and Assert
      expect(replyRepository.verifyReplyExists('reply-xyz', 'comment-123')).rejects
        .toThrow(NotFoundError);
    });
  });

  describe('verifyReplyOwner function', () => {
    it('should return true when user owns the reply', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        owner: 'user-123',
        threadId: 'thread-123',
      });
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        owner: 'user-123',
        commentId: 'comment-123',
      });

      // Action
      const isOwner = await replyRepository.verifyReplyOwner('reply-123', 'user-123');

      // Assert
      expect(isOwner).toBe(true);
    });

    it('should return false when user does not own the reply', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await UsersTableTestHelper.addUser({ id: 'user-456', username: 'johndoe' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        owner: 'user-123',
        threadId: 'thread-123',
      });
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        owner: 'user-123',
        commentId: 'comment-123',
      });

      // Action
      const isOwner = await replyRepository.verifyReplyOwner('reply-123', 'user-456');

      // Assert
      expect(isOwner).toBe(false);
    });
  });

  describe('deleteReply function', () => {
    it('should soft delete reply correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        owner: 'user-123',
        threadId: 'thread-123',
      });
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        owner: 'user-123',
        commentId: 'comment-123',
      });

      // Action
      await replyRepository.deleteReply('reply-123');

      // Assert
      const updatedReplies = await RepliesTableTestHelper.findRepliesById('reply-123');
      expect(updatedReplies[0].is_delete).toBe(true);
    });
  });

  afterAll(async () => {
    await pool.end();
  });
});
