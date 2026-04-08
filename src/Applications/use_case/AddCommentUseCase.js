import NewComment from '../../Domains/comments/entities/NewComment.js';
import AddedComment from '../../Domains/comments/entities/AddedComment.js';

class AddCommentUseCase {
  constructor({ threadRepository, commentRepository, idGenerator }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._idGenerator = idGenerator;
  }

  async execute(useCasePayload) {
    const { threadId, userId, content } = useCasePayload;

    await this._threadRepository.verifyThreadExists(threadId);

    const newComment = new NewComment({
      content,
      owner: userId,
      threadId,
    });

    const commentId = `comment-${this._idGenerator()}`;

    return this._commentRepository.addComment({
      ...newComment,
      id: commentId,
    }).then((commentData) => new AddedComment({
      id: commentData.id,
      content: commentData.content,
      owner: commentData.owner,
    }));
  }
}

export default AddCommentUseCase;
