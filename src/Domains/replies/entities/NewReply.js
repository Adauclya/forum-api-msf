class NewReply {
  constructor({ content, owner, commentId }) {
    this._verifyPayload({ content, owner, commentId });

    this.content = content;
    this.owner = owner;
    this.commentId = commentId;
  }

  _verifyPayload({ content, owner, commentId }) {
    if (!content || !owner || !commentId) {
      throw new Error('ADD_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof content !== 'string' || typeof owner !== 'string' || typeof commentId !== 'string') {
      throw new Error('ADD_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }

    if (content.length > 500) {
      throw new Error('ADD_REPLY.CONTENT_LIMIT_CHAR');
    }
  }
}

export default NewReply;
