export async function up(pgm) {
    pgm.createTable('listings', {
        id: {
            type: 'serial',
            notNull: true,
            primaryKey: true,
        },
        seller_id: {
            type: 'integer',
            notNull: true,
            references: 'users(id)',
            onDelete: 'CASCADE',
        },
        title: {
            type: 'text',
            notNull: true,
        },
        description: {
            type: 'text',
            notNull: true,
        },
        price: {
            type: 'integer', 
            notNull: true,
        },
        category: {
            type: 'varchar(50)',
            notNull: true,
        },
        status: {
            type: 'varchar(20)',
            notNull: true,
            default: 'active',
        },
        deleted_at: {
            type: 'timestamptz',
        },
        created_at: {
            type: 'timestamptz',
            notNull: true,
            default: pgm.func('current_timestamp'),
        },
        updated_at: {
            type: 'timestamptz',
            notNull: true,
            default: pgm.func('current_timestamp'),
        },
    });

   
    pgm.createIndex('listings', 'seller_id');
    pgm.createIndex('listings', 'status');
    pgm.createIndex('listings', 'category');
}

export async function down(pgm) {
    pgm.dropTable('listings', { ifExists: true });
}