import { describe, it, expect } from 'vitest';
import NewReply from '../NewReply.js';

describe('NewReply entities', () => {
  it('should throw error when payload not contain needed property', () => {
    // Arrange
    const payload = {
      content: 'sebuah balasan',
    };

    // Action & Assert
    expect(() => new NewReply(payload)).toThrowError('ADD_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type specification', () => {
    // Arrange
    const payload = {
      content: 'sebuah balasan',
      owner: 123,
      commentId: 'comment-123',
    };

    // Action & Assert
    expect(() => new NewReply(payload)).toThrowError('ADD_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create NewReply object correctly', () => {
    // Arrange
    const payload = {
      content: 'sebuah balasan',
      owner: 'user-123',
      commentId: 'comment-123',
    };

    // Action
    const newReply = new NewReply(payload);

    // Assert
    expect(newReply.content).toEqual(payload.content);
    expect(newReply.owner).toEqual(payload.owner);
    expect(newReply.commentId).toEqual(payload.commentId);
  });
});
