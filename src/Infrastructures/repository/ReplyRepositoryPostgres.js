import NotFoundError from '../../Commons/exceptions/NotFoundError.js';
import InvariantError from '../../Commons/exceptions/InvariantError.js';
import ReplyRepository from '../../Domains/replies/ReplyRepository.js';

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply(newReply) {
    const { id, content, owner, commentId } = newReply;

    const query = {
      text: 'INSERT INTO replies (id, content, owner, comment_id) VALUES($1, $2, $3, $4) RETURNING id, content, owner',
      values: [id, content, owner, commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Balasan gagal ditambahkan');
    }

    return result.rows[0];
  }

  async getRepliesByCommentId(commentId) {
    const query = {
      text: `SELECT replies.id, replies.content, replies.owner, replies.is_delete, 
                     replies.created_at, users.username
              FROM replies
              LEFT JOIN users ON replies.owner = users.id
              WHERE replies.comment_id = $1
              ORDER BY replies.created_at ASC`,
      values: [commentId],
    };

    const result = await this._pool.query(query);

    return result.rows.map((row) => ({
      id: row.id,
      username: row.username,
      date: row.created_at,
      content: row.content,
      isDelete: row.is_delete,
    }));
  }

  async verifyReplyExists(replyId, commentId) {
    const query = {
      text: 'SELECT id FROM replies WHERE id = $1 AND comment_id = $2',
      values: [replyId, commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Balasan tidak ditemukan');
    }
  }

  async verifyReplyOwner(replyId, userId) {
    const query = {
      text: 'SELECT owner FROM replies WHERE id = $1',
      values: [replyId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Balasan tidak ditemukan');
    }

    return result.rows[0].owner === userId;
  }

  async deleteReply(replyId) {
    const query = {
      text: 'UPDATE replies SET is_delete = true WHERE id = $1',
      values: [replyId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Balasan gagal dihapus');
    }
  }

  async getReplyById(replyId) {
    const query = {
      text: 'SELECT id FROM replies WHERE id = $1',
      values: [replyId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Balasan tidak ditemukan');
    }

    return result.rows[0];
  }
}

export default ReplyRepositoryPostgres;
