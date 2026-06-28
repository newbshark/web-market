import { MigrationBuilder } from 'node-pg-migrate';

export async function up(pgm: MigrationBuilder): Promise<void> {

    pgm.createTable('threads', {
        idthread: {
            type: 'serial',
            notNull: true
        },
        user_id: {
            type: 'integer',
            notNull: true,
            references: 'users(id)',
        },
        nextuser_id: {
            type: 'integer',
            notNull: true,
            references: 'users(id)',
        },
    });

    pgm.createTable('messages', {
        id: {
            type: 'serial',
            notNull: true
        },
        thread_id: {
            type: 'integer',
            notNull: true,
            references: 'threads(id)',
        },
        sender_id: {
            type: 'integer',
            notNull: true,
            references: 'users(id)',
        },
        body: {
            type: 'text',
            notNull: true
        },
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