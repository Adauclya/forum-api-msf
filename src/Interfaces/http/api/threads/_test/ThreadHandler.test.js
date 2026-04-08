import { describe, it, expect, beforeEach, afterEach, afterAll } from 'vitest';
import request from 'supertest';
import createServer from '../../../../../Infrastructures/http/createServer.js';
import container from '../../../../../Infrastructures/container.js';
import pool from '../../../../../Infrastructures/database/postgres/pool.js';
import AuthenticationsTableTestHelper from '../../../../../../tests/AuthenticationsTableTestHelper.js';
import UsersTableTestHelper from '../../../../../../tests/UsersTableTestHelper.js';
import ThreadsTableTestHelper from '../../../../../../tests/ThreadsTableTestHelper.js';
import CommentsTableTestHelper from '../../../../../../tests/CommentsTableTestHelper.js';
import RepliesTableTestHelper from '../../../../../../tests/RepliesTableTestHelper.js';

describe('Thread Handler', () => {
  let app;
  let accessToken;
  let userId;

  beforeEach(async () => {
    app = await createServer(container);
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await RepliesTableTestHelper.cleanTable();

    // Register user directly via database helper to ensure it's created
    const testUserId = 'user-123';
    const testUsername = 'dicoding';
    // Password hash for 'secret': $2b$10$loJ5ePUZOqwLVHMNIIn2IO9sWtsT26Sx6Mkc9moEJraCcB6ZAMG/W
    const hashedPassword = '$2b$10$loJ5ePUZOqwLVHMNIIn2IO9sWtsT26Sx6Mkc9moEJraCcB6ZAMG/W';

    await UsersTableTestHelper.addUser({
      id: testUserId,
      username: testUsername,
      password: hashedPassword,
      fullname: 'Dicoding Indonesia',
    });

    userId = testUserId;

    // Login to get access token
    const loginResponse = await request(app)
      .post('/authentications')
      .send({
        username: testUsername,
        password: 'secret',
      });

    if (loginResponse.status !== 201) {
      throw new Error(`Login failed: ${JSON.stringify(loginResponse.body)}`);
    }

    accessToken = loginResponse.body.data.accessToken;
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await RepliesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('POST /threads', () => {
    it('should add thread successfully with valid payload and auth', async () => {
      // Arrange
      const requestPayload = {
        title: 'sebuah thread',
        body: 'sebuah body thread',
      };

      // Action
      const response = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(requestPayload);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.addedThread).toBeDefined();
      expect(response.body.data.addedThread.id).toBeDefined();
      expect(response.body.data.addedThread.title).toBe(requestPayload.title);
      expect(response.body.data.addedThread.owner).toBe(userId);
    });

    it('should return 400 if title is missing', async () => {
      // Arrange
      const requestPayload = {
        body: 'sebuah body thread',
      };

      // Action
      const response = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(requestPayload);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.status).toBe('fail');
    });

    it('should return 400 if body is missing', async () => {
      // Arrange
      const requestPayload = {
        title: 'sebuah thread',
      };

      // Action
      const response = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(requestPayload);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.status).toBe('fail');
    });

    it('should return 401 if no authentication', async () => {
      // Arrange
      const requestPayload = {
        title: 'sebuah thread',
        body: 'sebuah body thread',
      };

      // Action
      const response = await request(app)
        .post('/threads')
        .send(requestPayload);

      // Assert
      expect(response.status).toBe(401);
    });
  });

  describe('GET /threads/{threadId}', () => {
    it('should return thread detail successfully', async () => {
      // Arrange
      const threadId = 'thread-123';
      const userId2 = 'user-456';
      await UsersTableTestHelper.addUser({ id: userId2, username: 'johndoe' });
      await ThreadsTableTestHelper.addThread({
        id: threadId,
        title: 'sebuah thread',
        body: 'sebuah body thread',
        owner: userId,
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        content: 'sebuah comment',
        owner: userId2,
        threadId,
      });

      // Action
      const response = await request(app)
        .get(`/threads/${threadId}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.thread).toBeDefined();
      expect(response.body.data.thread.id).toBe(threadId);
      expect(response.body.data.thread.title).toBe('sebuah thread');
      expect(response.body.data.thread.comments).toHaveLength(1);
    });

    it('should return 404 if thread not found', async () => {
      // Action
      const response = await request(app)
        .get('/threads/thread-xyz');

      // Assert
      expect(response.status).toBe(404);
      expect(response.body.status).toBe('fail');
    });
  });

  describe('POST /threads/{threadId}/comments', () => {
    it('should add comment successfully with valid payload and auth', async () => {
      // Arrange
      const threadId = 'thread-123';
      await ThreadsTableTestHelper.addThread({
        id: threadId,
        owner: userId,
      });
      const requestPayload = {
        content: 'sebuah comment',
      };

      // Action
      const response = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(requestPayload);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.addedComment).toBeDefined();
      expect(response.body.data.addedComment.content).toBe(requestPayload.content);
      expect(response.body.data.addedComment.owner).toBe(userId);
    });

    it('should return 404 if thread not found', async () => {
      // Arrange
      const requestPayload = {
        content: 'sebuah comment',
      };

      // Action
      const response = await request(app)
        .post('/threads/thread-xyz/comments')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(requestPayload);

      // Assert
      expect(response.status).toBe(404);
      expect(response.body.status).toBe('fail');
    });

    it('should return 400 if content is missing', async () => {
      // Arrange
      const threadId = 'thread-123';
      await ThreadsTableTestHelper.addThread({
        id: threadId,
        owner: userId,
      });

      // Action
      const response = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({});

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.status).toBe('fail');
    });
  });

  describe('DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should delete comment successfully', async () => {
      // Arrange
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      await ThreadsTableTestHelper.addThread({
        id: threadId,
        owner: userId,
      });
      await CommentsTableTestHelper.addComment({
        id: commentId,
        owner: userId,
        threadId,
      });

      // Action
      const response = await request(app)
        .delete(`/threads/${threadId}/comments/${commentId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
    });

    it('should return 403 if user is not comment owner', async () => {
      // Arrange
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const userId2 = 'user-456';
      await UsersTableTestHelper.addUser({ id: userId2, username: 'johndoe' });
      await ThreadsTableTestHelper.addThread({
        id: threadId,
        owner: userId,
      });
      await CommentsTableTestHelper.addComment({
        id: commentId,
        owner: userId2,
        threadId,
      });

      // Action
      const response = await request(app)
        .delete(`/threads/${threadId}/comments/${commentId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toBe(403);
      expect(response.body.status).toBe('fail');
    });

    it('should return 404 if comment not found', async () => {
      // Arrange
      const threadId = 'thread-123';
      await ThreadsTableTestHelper.addThread({
        id: threadId,
        owner: userId,
      });

      // Action
      const response = await request(app)
        .delete(`/threads/${threadId}/comments/comment-xyz`)
        .set('Authorization', `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toBe(404);
      expect(response.body.status).toBe('fail');
    });
  });

  describe('POST /threads/{threadId}/comments/{commentId}/replies', () => {
    it('should add reply successfully with valid payload and auth', async () => {
      // Arrange
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      await ThreadsTableTestHelper.addThread({
        id: threadId,
        owner: userId,
      });
      await CommentsTableTestHelper.addComment({
        id: commentId,
        owner: userId,
        threadId,
      });
      const requestPayload = {
        content: 'sebuah reply',
      };

      // Action
      const response = await request(app)
        .post(`/threads/${threadId}/comments/${commentId}/replies`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(requestPayload);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.addedReply).toBeDefined();
      expect(response.body.data.addedReply.content).toBe(requestPayload.content);
      expect(response.body.data.addedReply.owner).toBe(userId);
    });

    it('should return 404 if thread not found', async () => {
      // Arrange
      const requestPayload = {
        content: 'sebuah reply',
      };

      // Action
      const response = await request(app)
        .post('/threads/thread-xyz/comments/comment-123/replies')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(requestPayload);

      // Assert
      expect(response.status).toBe(404);
      expect(response.body.status).toBe('fail');
    });

    it('should return 400 if content is missing', async () => {
      // Arrange
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      await ThreadsTableTestHelper.addThread({
        id: threadId,
        owner: userId,
      });
      await CommentsTableTestHelper.addComment({
        id: commentId,
        owner: userId,
        threadId,
      });

      // Action
      const response = await request(app)
        .post(`/threads/${threadId}/comments/${commentId}/replies`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({});

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.status).toBe('fail');
    });
  });

  describe('DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}', () => {
    it('should delete reply successfully', async () => {
      // Arrange
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const replyId = 'reply-123';
      await ThreadsTableTestHelper.addThread({
        id: threadId,
        owner: userId,
      });
      await CommentsTableTestHelper.addComment({
        id: commentId,
        owner: userId,
        threadId,
      });
      await RepliesTableTestHelper.addReply({
        id: replyId,
        owner: userId,
        commentId,
      });

      // Action
      const response = await request(app)
        .delete(`/threads/${threadId}/comments/${commentId}/replies/${replyId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
    });

    it('should return 403 if user is not reply owner', async () => {
      // Arrange
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const replyId = 'reply-123';
      const userId2 = 'user-456';
      await UsersTableTestHelper.addUser({ id: userId2, username: 'johndoe' });
      await ThreadsTableTestHelper.addThread({
        id: threadId,
        owner: userId,
      });
      await CommentsTableTestHelper.addComment({
        id: commentId,
        owner: userId,
        threadId,
      });
      await RepliesTableTestHelper.addReply({
        id: replyId,
        owner: userId2,
        commentId,
      });

      // Action
      const response = await request(app)
        .delete(`/threads/${threadId}/comments/${commentId}/replies/${replyId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toBe(403);
      expect(response.body.status).toBe('fail');
    });

    it('should return 404 if reply not found', async () => {
      // Arrange
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      await ThreadsTableTestHelper.addThread({
        id: threadId,
        owner: userId,
      });
      await CommentsTableTestHelper.addComment({
        id: commentId,
        owner: userId,
        threadId,
      });

      // Action
      const response = await request(app)
        .delete(`/threads/${threadId}/comments/${commentId}/replies/reply-xyz`)
        .set('Authorization', `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toBe(404);
      expect(response.body.status).toBe('fail');
    });
  });
});
