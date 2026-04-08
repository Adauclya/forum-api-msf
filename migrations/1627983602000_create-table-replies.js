export const up = (pgm) => {
  pgm.createTable('replies', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    content: {
      type: 'TEXT',
      notNull: true,
    },
    owner: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"users"(id)',
      onDelete: 'restrict',
      onUpdate: 'restrict',
    },
    comment_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"comments"(id)',
      onDelete: 'cascade',
      onUpdate: 'cascade',
    },
    is_delete: {
      type: 'boolean',
      notNull: true,
      default: false,
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  pgm.createIndex('replies', 'owner');
  pgm.createIndex('replies', 'comment_id');
  pgm.createIndex('replies', 'created_at');
};

export const down = (pgm) => {
  pgm.dropTable('replies');
};
