import NotFoundError from '../../Commons/exceptions/NotFoundError.js';
import InvariantError from '../../Commons/exceptions/InvariantError.js';
import ThreadRepository from '../../Domains/threads/ThreadRepository.js';
import DetailThread from '../../Domains/threads/entities/DetailThread.js';

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addThread(newThread) {
    const { id, title, body, owner } = newThread;

    const query = {
      text: 'INSERT INTO threads (id, title, body, owner) VALUES($1, $2, $3, $4) RETURNING id, title, owner',
      values: [id, title, body, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Thread gagal ditambahkan');
    }

    return result.rows[0];
  }

  async getThreadById(threadId) {
    const query = {
      text: `SELECT threads.id, threads.title, threads.body, threads.created_at, users.username
              FROM threads
              LEFT JOIN users ON threads.owner = users.id
              WHERE threads.id = $1`,
      values: [threadId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Thread tidak ditemukan');
    }

    const threadRow = result.rows[0];

    return new DetailThread({
      id: threadRow.id,
      title: threadRow.title,
      body: threadRow.body,
      date: threadRow.created_at,
      username: threadRow.username,
      comments: [],
    });
  }

  async verifyThreadExists(threadId) {
    const query = {
      text: 'SELECT id FROM threads WHERE id = $1',
      values: [threadId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Thread tidak ditemukan');
    }
  }
}

export default ThreadRepositoryPostgres;
