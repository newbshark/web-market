import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';


export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.createTable('messages', {
        id: { type: 'serial', primaryKey: true, notNull: true },
        thread_id: { type: 'smallserial', primaryKey: true, notNull: true },
        sender_id: { type: 'smallserial' },
        body: { type: 'varchar(1000)', notNull: true },
        created_at: {
            type: 'timestamptz',
            notNull: true,
            default: pgm.func('current_timestamp')
        },

    });



    pgm.sql(`INSERT INTO "user_roles" (role) VALUES ('admin'), ('customer') `);

    pgm.addColumn('users', {
        role: {
            type: 'varchar(50)',
            notNull: true,
            default: 'customer'
        }
    });


    pgm.addConstraint('users', 'user_roles_fk', {
        foreignKeys: {
            columns: 'role',
            references: '"user_roles"(role)'
        }
    });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    pgm.dropConstraint('users', 'user_roles_fk');
    pgm.dropColumn('users', 'role');
    pgm.dropTable('user_roles');

}
