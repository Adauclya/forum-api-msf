import AddThreadUseCase from '../../../../Applications/use_case/AddThreadUseCase.js';
import GetThreadDetailUseCase from '../../../../Applications/use_case/GetThreadDetailUseCase.js';
import AddCommentUseCase from '../../../../Applications/use_case/AddCommentUseCase.js';
import DeleteCommentUseCase from '../../../../Applications/use_case/DeleteCommentUseCase.js';
import AddReplyUseCase from '../../../../Applications/use_case/AddReplyUseCase.js';
import DeleteReplyUseCase from '../../../../Applications/use_case/DeleteReplyUseCase.js';

class ThreadHandler {
  constructor(container) {
    this._container = container;

    this.postThreadHandler = this.postThreadHandler.bind(this);
    this.getThreadDetailHandler = this.getThreadDetailHandler.bind(this);
    this.postCommentHandler = this.postCommentHandler.bind(this);
    this.deleteCommentHandler = this.deleteCommentHandler.bind(this);
    this.postReplyHandler = this.postReplyHandler.bind(this);
    this.deleteReplyHandler = this.deleteReplyHandler.bind(this);
  }

  async postThreadHandler(req, res, next) {
    try {
      const { title, body } = req.body;
      const userId = req.user.id;

      const addThreadUseCase = this._container.getInstance(AddThreadUseCase.name);
      const addedThread = await addThreadUseCase.execute({
        title,
        body,
        owner: userId,
      });

      res.status(201).json({
        status: 'success',
        data: {
          addedThread,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getThreadDetailHandler(req, res, next) {
    try {
      const { threadId } = req.params;

      const getThreadDetailUseCase = this._container.getInstance(GetThreadDetailUseCase.name);
      const threadDetail = await getThreadDetailUseCase.execute(threadId);

      res.status(200).json({
        status: 'success',
        data: {
          thread: threadDetail,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async postCommentHandler(req, res, next) {
    try {
      const { threadId } = req.params;
      const { content } = req.body;
      const userId = req.user.id;

      const addCommentUseCase = this._container.getInstance(AddCommentUseCase.name);
      const addedComment = await addCommentUseCase.execute({
        threadId,
        userId,
        content,
      });

      res.status(201).json({
        status: 'success',
        data: {
          addedComment,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteCommentHandler(req, res, next) {
    try {
      const { threadId, commentId } = req.params;
      const userId = req.user.id;

      const deleteCommentUseCase = this._container.getInstance(DeleteCommentUseCase.name);
      await deleteCommentUseCase.execute({
        threadId,
        commentId,
        userId,
      });

      res.status(200).json({
        status: 'success',
      });
    } catch (error) {
      next(error);
    }
  }

  async postReplyHandler(req, res, next) {
    try {
      const { threadId, commentId } = req.params;
      const { content } = req.body;
      const userId = req.user.id;

      const addReplyUseCase = this._container.getInstance(AddReplyUseCase.name);
      const addedReply = await addReplyUseCase.execute({
        threadId,
        commentId,
        userId,
        content,
      });

      res.status(201).json({
        status: 'success',
        data: {
          addedReply,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteReplyHandler(req, res, next) {
    try {
      const { threadId, commentId, replyId } = req.params;
      const userId = req.user.id;

      const deleteReplyUseCase = this._container.getInstance(DeleteReplyUseCase.name);
      await deleteReplyUseCase.execute({
        threadId,
        commentId,
        replyId,
        userId,
      });

      res.status(200).json({
        status: 'success',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default ThreadHandler;
