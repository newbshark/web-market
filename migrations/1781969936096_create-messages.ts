import { MigrationBuilder } from 'node-pg-migrate';

export async function up(pgm: MigrationBuilder): Promise<void> {

    pgm.createTable('threads', {
        idthread: {
            type: 'serial',
            notNull: true,
            primaryKey: true
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
            references: 'threads(idthread)',
        },
        sender_id: {
            type: 'integer',
            notNull: true
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

    pgm.addConstraint('threads', 'threads_user_fk', {
        foreignKeys: { columns: 'user_id', references: 'users(id)', onDelete: 'CASCADE' }
    });
    pgm.addConstraint('threads', 'threads_nextuser_fk', {
        foreignKeys: { columns: 'nextuser_id', references: 'users(id)', onDelete: 'CASCADE' }
    });

    pgm.addConstraint('messages', 'messages_thread_fk', {
        foreignKeys: { columns: 'thread_id', references: 'threads(idthread)', onDelete: 'CASCADE' }
    });

    pgm.addConstraint('messages', 'messages_sender_fk', {
        foreignKeys: { columns: 'sender_id', references: 'users(id)', onDelete: 'CASCADE' }
    });

    pgm.addConstraint('messages', 'messages_pkey', {
        primaryKey: ['id', 'thread_id']
    });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    pgm.dropConstraint('messages', 'messages_sender_fk', { ifExists: true });
    pgm.dropTable('messages', { ifExists: true });
}

