import { describe, it, expect, beforeEach, afterEach, afterAll } from 'vitest';
import pool from '../../../Infrastructures/database/postgres/pool.js';
import ThreadRepositoryPostgres from '../ThreadRepositoryPostgres.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import NotFoundError from '../../../Commons/exceptions/NotFoundError.js';
import { nanoid } from 'nanoid';

describe('ThreadRepositoryPostgres', () => {
  let threadRepository;

  beforeEach(async () => {
    threadRepository = new ThreadRepositoryPostgres(pool, nanoid);
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread function', () => {
    it('should persist new thread and return added thread correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      const newThread = {
        id: 'thread-123',
        title: 'sebuah thread',
        body: 'sebuah body thread',
        owner: 'user-123',
      };

      // Action
      const addedThread = await threadRepository.addThread(newThread);

      // Assert
      const threads = await ThreadsTableTestHelper.findThreadsById('thread-123');
      expect(threads).toHaveLength(1);
      expect(addedThread.id).toEqual('thread-123');
      expect(addedThread.title).toEqual('sebuah thread');
      expect(addedThread.owner).toEqual('user-123');
    });
  });

  describe('getThreadById function', () => {
    it('should return thread with correct data', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'sebuah thread',
        body: 'sebuah body thread',
        owner: 'user-123',
      });

      // Action
      const threadDetail = await threadRepository.getThreadById('thread-123');

      // Assert
      expect(threadDetail.id).toEqual('thread-123');
      expect(threadDetail.title).toEqual('sebuah thread');
      expect(threadDetail.body).toEqual('sebuah body thread');
      expect(threadDetail.username).toEqual('dicoding');
      expect(threadDetail.comments).toEqual([]);
    });

    it('should throw NotFoundError when thread not found', async () => {
      // Act and Assert
      await expect(threadRepository.getThreadById('thread-xyz')).rejects.toThrow(NotFoundError);
    });
  });

  describe('verifyThreadExists function', () => {
    it('should not throw NotFoundError when thread exists', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });

      // Act and Assert
      await expect(threadRepository.verifyThreadExists('thread-123')).resolves.not.toThrow();
    });

    it('should throw NotFoundError when thread does not exist', async () => {
      // Act and Assert
      await expect(threadRepository.verifyThreadExists('thread-xyz')).rejects.toThrow(NotFoundError);
    });
  });
});
