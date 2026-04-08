import NewThread from '../../Domains/threads/entities/NewThread.js';
import AddedThread from '../../Domains/threads/entities/AddedThread.js';

class AddThreadUseCase {
  constructor({ threadRepository, idGenerator }) {
    this._threadRepository = threadRepository;
    this._idGenerator = idGenerator;
  }

  async execute(useCasePayload) {
    const newThread = new NewThread(useCasePayload);
    const threadId = `thread-${this._idGenerator()}`;

    return this._threadRepository.addThread({
      ...newThread,
      id: threadId,
    }).then((threadData) => new AddedThread({
      id: threadData.id,
      title: threadData.title,
      owner: threadData.owner,
    }));
  }
}

export default AddThreadUseCase;
