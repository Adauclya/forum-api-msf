import ThreadHandler from './handler.js';
import createThreadsRouter from './routes.js';

export default (container) => {
  const handler = new ThreadHandler(container);
  return createThreadsRouter(handler, container);
};
