export const up = (pgm) => {
  pgm.createTable('comments', {
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
    thread_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"threads"(id)',
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

  pgm.createIndex('comments', 'owner');
  pgm.createIndex('comments', 'thread_id');
  pgm.createIndex('comments', 'created_at');
};

export const down = (pgm) => {
  pgm.dropTable('comments');
};
