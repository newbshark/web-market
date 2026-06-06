import { MigrationBuilder } from 'node-pg-migrate';

const ACTIVE_STATUS_ID = 1;  

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.createTable('ad_categories', {
        category_id: { type: 'serial', primaryKey: true },
        category_name: { type: 'varchar(100)', notNull: true, unique: true }
    });
    
    pgm.createTable('ad_statuses', {
        status_id: { type: 'smallserial', primaryKey: true },
        status_name: { type: 'varchar(50)', notNull: true, unique: true }
    });
    
    pgm.sql(`
        INSERT INTO ad_categories (category_name) VALUES 
        ('техника'), ('одежда'), ('недвижимость'), ('мебель'), ('услуги');
    `);
    
    pgm.sql(`
        INSERT INTO ad_statuses (status_id, status_name) VALUES 
        (${ACTIVE_STATUS_ID}, 'активен'), (2, 'продан'), (3, 'в архиве');
    `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    pgm.dropTable('ad_statuses');
    pgm.dropTable('ad_categories');
}