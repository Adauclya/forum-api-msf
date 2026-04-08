class ToggleLikeCommentUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    const { threadId, commentId, userId } = useCasePayload;

    await this._threadRepository.verifyThreadExists(threadId);
    await this._commentRepository.verifyCommentExists(commentId, threadId);

    const isLiked = await this._commentRepository.checkLikeState(commentId, userId);

    if (isLiked) {
      await this._commentRepository.unlikeComment(commentId, userId);
    } else {
      await this._commentRepository.likeComment(commentId, userId);
    }
  }
}

export default ToggleLikeCommentUseCase;
