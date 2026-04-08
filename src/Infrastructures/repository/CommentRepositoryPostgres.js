import NotFoundError from '../../Commons/exceptions/NotFoundError.js';
import InvariantError from '../../Commons/exceptions/InvariantError.js';
import CommentRepository from '../../Domains/comments/CommentRepository.js';
import CommentDetail from '../../Domains/comments/entities/CommentDetail.js';

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(newComment) {
    const { id, content, owner, threadId } = newComment;

    const query = {
      text: 'INSERT INTO comments (id, content, owner, thread_id) VALUES($1, $2, $3, $4) RETURNING id, content, owner',
      values: [id, content, owner, threadId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Komentar gagal ditambahkan');
    }

    return result.rows[0];
  }

  async getCommentsByThreadId(threadId) {
    const query = {
      text: `SELECT comments.id, comments.content, comments.owner, comments.is_delete, 
                     comments.created_at, users.username
              FROM comments
              LEFT JOIN users ON comments.owner = users.id
              WHERE comments.thread_id = $1
              ORDER BY comments.created_at ASC`,
      values: [threadId],
    };

    const result = await this._pool.query(query);

    return result.rows.map((row) => ({
      id: row.id,
      username: row.username,
      date: row.created_at,
      content: row.content,
      is_delete: row.is_delete,
    }));
  }

  async verifyCommentExists(commentId, threadId) {
    const query = {
      text: 'SELECT id FROM comments WHERE id = $1 AND thread_id = $2',
      values: [commentId, threadId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Komentar tidak ditemukan');
    }
  }

  async verifyCommentOwner(commentId, userId) {
    const query = {
      text: 'SELECT owner FROM comments WHERE id = $1',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Komentar tidak ditemukan');
    }

    return result.rows[0].owner === userId;
  }

  async deleteComment(commentId) {
    const query = {
      text: 'UPDATE comments SET is_delete = true WHERE id = $1',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Komentar gagal dihapus');
    }
  }

  async getCommentById(commentId) {
    const query = {
      text: 'SELECT id FROM comments WHERE id = $1',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Komentar tidak ditemukan');
    }

    return result.rows[0];
  }
}

export default CommentRepositoryPostgres;
