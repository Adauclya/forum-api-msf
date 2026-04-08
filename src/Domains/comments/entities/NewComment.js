class NewComment {
  constructor({ content, owner, threadId }) {
    this._verifyPayload({ content, owner, threadId });

    this.content = content;
    this.owner = owner;
    this.threadId = threadId;
  }

  _verifyPayload({ content, owner, threadId }) {
    if (!content || !owner || !threadId) {
      throw new Error('ADD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof content !== 'string' || typeof owner !== 'string' || typeof threadId !== 'string') {
      throw new Error('ADD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }

    if (content.length > 500) {
      throw new Error('ADD_COMMENT.CONTENT_LIMIT_CHAR');
    }
  }
}

export default NewComment;
