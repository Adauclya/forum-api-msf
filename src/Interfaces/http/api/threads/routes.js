import express from 'express';
import authenticateToken from '../../../../Infrastructures/http/middlewares/authenticateToken.js';

const createThreadsRouter = (handler, container) => {
  const router = express.Router();
  const authenticate = authenticateToken(container);

  router.post('/', authenticate, handler.postThreadHandler);
  router.get('/:threadId', handler.getThreadDetailHandler);
  router.post('/:threadId/comments', authenticate, handler.postCommentHandler);
  router.delete('/:threadId/comments/:commentId', authenticate, handler.deleteCommentHandler);
  router.post('/:threadId/comments/:commentId/replies', authenticate, handler.postReplyHandler);
  router.delete('/:threadId/comments/:commentId/replies/:replyId', authenticate, handler.deleteReplyHandler);
  router.put('/:threadId/comments/:commentId/likes', authenticate, handler.putCommentLikeHandler);

  return router;
};

export default createThreadsRouter;
