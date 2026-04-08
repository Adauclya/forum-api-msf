import { describe, it, expect } from 'vitest';
import ReplyDetail from '../ReplyDetail.js';

describe('ReplyDetail entities', () => {
  it('should throw error when payload not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      username: 'dicoding',
      date: new Date(),
    };

    // Action & Assert
    expect(() => new ReplyDetail(payload)).toThrowError('REPLY_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123,
      username: 'dicoding',
      date: '2023',
      content: 'sebuah balasan',
    };

    // Action & Assert
    expect(() => new ReplyDetail(payload)).toThrowError('REPLY_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create ReplyDetail object correctly', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      username: 'dicoding',
      date: new Date(),
      content: 'sebuah balasan',
    };

    // Action
    const replyDetail = new ReplyDetail(payload);

    // Assert
    expect(replyDetail.id).toEqual(payload.id);
    expect(replyDetail.username).toEqual(payload.username);
    expect(replyDetail.date).toEqual(payload.date);
    expect(replyDetail.content).toEqual(payload.content);
  });
});
