import NewReply from '../../Domains/replies/entities/NewReply.js';
import AddedReply from '../../Domains/replies/entities/AddedReply.js';

class AddReplyUseCase {
  constructor({ threadRepository, commentRepository, replyRepository, idGenerator }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
    this._idGenerator = idGenerator;
  }

  async execute(useCasePayload) {
    const { threadId, commentId, userId, content } = useCasePayload;

    await this._threadRepository.verifyThreadExists(threadId);
    await this._commentRepository.verifyCommentExists(commentId, threadId);

    const newReply = new NewReply({
      content,
      owner: userId,
      commentId,
    });

    const replyId = `reply-${this._idGenerator()}`;

    return this._replyRepository.addReply({
      ...newReply,
      id: replyId,
    }).then((replyData) => new AddedReply({
      id: replyData.id,
      content: replyData.content,
      owner: replyData.owner,
    }));
  }
}

export default AddReplyUseCase;
