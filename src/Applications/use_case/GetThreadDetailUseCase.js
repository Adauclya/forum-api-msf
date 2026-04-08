import DetailThread from '../../Domains/threads/entities/DetailThread.js';
import CommentDetail from '../../Domains/comments/entities/CommentDetail.js';
import ReplyDetail from '../../Domains/replies/entities/ReplyDetail.js';

class GetThreadDetailUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(threadId) {
    await this._threadRepository.verifyThreadExists(threadId);
    const thread = await this._threadRepository.getThreadById(threadId);
    const comments = await this._commentRepository.getCommentsByThreadId(threadId);

    // Get replies for each comment and map entities
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await this._replyRepository.getRepliesByCommentId(comment.id);
        const mappedReplies = replies.map((reply) => new ReplyDetail({
          ...reply,
          content: reply.is_delete ? '**balasan telah dihapus**' : reply.content,
        }));

        return new CommentDetail({
          ...comment,
          content: comment.is_delete ? '**komentar telah dihapus**' : comment.content,
          replies: mappedReplies,
        });
      }),
    );

    return new DetailThread({
      ...thread,
      comments: commentsWithReplies,
    });
  }
}

export default GetThreadDetailUseCase;
