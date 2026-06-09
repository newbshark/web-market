import { MigrationBuilder } from 'node-pg-migrate';

const ACTIVE_STATUS_ID = 1;  

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.createTable('offer_categories', {
        category_id: { type: 'serial', primaryKey: true },
        category_name: { type: 'varchar(100)', notNull: true, unique: true }
    });
    
    pgm.createTable('offer_statuses', {
        status_id: { type: 'smallserial', primaryKey: true },
        status_name: { type: 'varchar(50)', notNull: true, unique: true }
    });
    
    pgm.sql(`
        INSERT INTO offer_categories (category_name) VALUES 
        ('electronics'), ('clothes'), ('estate'), ('furniture'), ('services');
    `);
    
    pgm.sql(`
        INSERT INTO offer_statuses (status_id, status_name) VALUES 
        (${ACTIVE_STATUS_ID}, 'active'), (2, 'sold'), (3, 'archived');
    `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    pgm.dropTable('offer_statuses');
    pgm.dropTable('offer_categories');
}