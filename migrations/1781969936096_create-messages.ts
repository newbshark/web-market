import { MigrationBuilder } from 'node-pg-migrate';

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.createTable('messages', {
        id: { type: 'serial', notNull: true },
        thread_id: { type: 'integer', notNull: true },
        sender_id: { type: 'integer', notNull: true },
        body: { type: 'varchar(1000)', notNull: true },
        created_at: {
            type: 'timestamptz',
            notNull: true,
            default: pgm.func('current_timestamp')
        }
    });

    pgm.addConstraint('messages', 'messages_pkey', {
        primaryKey: ['id', 'thread_id']
    });

    pgm.addConstraint('messages', 'messages_sender_fk', {
        foreignKeys: {
            columns: 'sender_id',
            references: 'users(id)',
            onDelete: 'CASCADE'
        }
    });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    pgm.dropConstraint('messages', 'messages_sender_fk');
    pgm.dropTable('messages');
}