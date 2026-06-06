import { MigrationBuilder } from 'node-pg-migrate';

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.createTable('offers', {
        id: { type: 'serial', primaryKey: true },
        title: { type: 'varchar(200)', notNull: true },
        description: { type: 'varchar(1000)' },
        price: { type: 'decimal(12,2)', notNull: true },
        category_id: { type: 'integer', notNull: true },
        status_id: { type: 'smallint', notNull: true, default: 1 },
        user_id: { type: 'integer', notNull: true },
        created_date: { type: 'date', notNull: true, default: pgm.func('current_date') }
    });

    
    pgm.addConstraint('offers', 'fk_category', {
        foreignKeys: { columns: 'category_id', references: 'ad_categories(category_id)', onDelete: 'RESTRICT' }
    });
    pgm.addConstraint('offers', 'fk_status', {
        foreignKeys: { columns: 'status_id', references: 'ad_statuses(status_id)', onDelete: 'RESTRICT' }
    });
    pgm.addConstraint('offers', 'fk_user', {
        foreignKeys: { columns: 'user_id', references: 'users(id)', onDelete: 'CASCADE' }
    });

}

export async function down(pgm: MigrationBuilder): Promise<void> {
    pgm.dropTable('offers');
}