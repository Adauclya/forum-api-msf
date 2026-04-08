import AuthorizationError from '../../Commons/exceptions/AuthorizationError.js';

class DeleteCommentUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    const { threadId, commentId, userId } = useCasePayload;

    await this._threadRepository.verifyThreadExists(threadId);
    await this._commentRepository.verifyCommentExists(commentId, threadId);

    const isOwner = await this._commentRepository.verifyCommentOwner(commentId, userId);
    if (!isOwner) {
      throw new AuthorizationError('Anda tidak berhak menghapus komentar ini');
    }

    await this._commentRepository.deleteComment(commentId);
  }
}

export default DeleteCommentUseCase;
