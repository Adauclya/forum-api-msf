class CommentDetail {
  constructor(payload) {
    this._verifyPayload(payload);

    const {
      id, username, date, content, replies, likeCount,
    } = payload;

    this.id = id;
    this.username = username;
    this.date = date;
    this.content = content;
    this.replies = replies;
    this.likeCount = likeCount;
  }

  _verifyPayload({
    id, username, date, content, replies, likeCount,
  }) {
    if (!id || !username || !date || !content || !replies || likeCount === undefined) {
      throw new Error('COMMENT_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof id !== 'string'
      || typeof username !== 'string'
      || typeof date !== 'object'
      || typeof content !== 'string'
      || !Array.isArray(replies)
      || typeof likeCount !== 'number'
    ) {
      throw new Error('COMMENT_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

export default CommentDetail;
