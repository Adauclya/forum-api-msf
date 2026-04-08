import AuthorizationError from '../../Commons/exceptions/AuthorizationError.js';

class DeleteReplyUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCasePayload) {
    const { threadId, commentId, replyId, userId } = useCasePayload;

    await this._threadRepository.verifyThreadExists(threadId);
    await this._commentRepository.verifyCommentExists(commentId, threadId);
    await this._replyRepository.verifyReplyExists(replyId, commentId);

    const isOwner = await this._replyRepository.verifyReplyOwner(replyId, userId);
    if (!isOwner) {
      throw new AuthorizationError('Anda tidak berhak menghapus balasan ini');
    }

    await this._replyRepository.deleteReply(replyId);
  }
}

export default DeleteReplyUseCase;
