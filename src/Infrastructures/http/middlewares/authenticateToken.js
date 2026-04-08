import AuthenticationError from '../../../Commons/exceptions/AuthenticationError.js';

const authenticateToken = (container) => async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next(new AuthenticationError('Missing authentication'));
  }

  try {
    const authenticationTokenManager = container.getInstance('AuthenticationTokenManager');
    const decoded = await authenticationTokenManager.verifyAccessToken(token);
    req.user = { id: decoded.id };
    next();
  } catch (error) {
    next(error);
  }
};

export default authenticateToken;
