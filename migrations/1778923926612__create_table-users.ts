import { MigrationBuilder } from 'node-pg-migrate';


export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.createTable('users',{
        
        id: {
            type: 'serial',
            primaryKey: true,
        },

        email: {
            type: 'varchar(100)',
            notNull: true,
            unique: true
        },

        name: {
            type: 'varchar(255)',
            notNull: true
        },

        password: {
            type: 'varchar(255)',
            notNull: true
        },

        created_at: {
            type:  'timestamptz',
            notNull: true,
            default: pgm.func('current_timestamp')
        },
       
    });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    pgm.dropTable('users');
}
