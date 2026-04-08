import { describe, it, expect, vi } from 'vitest';
import AddThreadUseCase from '../AddThreadUseCase.js';
import AddedThread from '../../../Domains/threads/entities/AddedThread.js';

describe('AddThreadUseCase', () => {
  it('should orchestrate the add thread action correctly', async () => {
    // Arrange
    const useCasePayload = {
      title: 'sebuah thread',
      body: 'sebuah body thread',
      owner: 'user-123',
    };

    const mockAddedThread = {
      id: 'thread-123',
      title: useCasePayload.title,
      owner: useCasePayload.owner,
    };

    const mockThreadRepository = {
      addThread: vi.fn().mockImplementation(() => Promise.resolve(mockAddedThread)),
    };

    const mockIdGenerator = vi.fn(() => '123');

    const addThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
      idGenerator: mockIdGenerator,
    });

    // Action
    const addedThread = await addThreadUseCase.execute(useCasePayload);

    // Assert
    expect(addedThread).toStrictEqual(
      new AddedThread({
        id: 'thread-123',
        title: useCasePayload.title,
        owner: useCasePayload.owner,
      }),
    );

    expect(mockIdGenerator).toHaveBeenCalled();
    expect(mockThreadRepository.addThread).toHaveBeenCalledWith(
      expect.objectContaining({
        title: useCasePayload.title,
        body: useCasePayload.body,
        owner: useCasePayload.owner,
      }),
    );
  });
});
