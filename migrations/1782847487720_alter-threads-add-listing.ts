export async function up(pgm) {
    pgm.addColumn('threads', {
        listing_id: {
            type: 'integer',
            notNull: true,
            references: 'listings(id)',
            onDelete: 'CASCADE',
        }
    });
    pgm.renameColumn('threads', 'user_id', 'seller_id');
    pgm.renameColumn('threads', 'nextuser_id', 'buyer_id');
    pgm.createIndex('threads', 'listing_id');
}

export async function down(pgm) {
    pgm.dropIndex('threads', 'listing_id', { ifExists: true });
    pgm.renameColumn('threads', 'seller_id', 'user_id');
    pgm.renameColumn('threads', 'buyer_id', 'nextuser_id');
    pgm.dropColumn('threads', 'listing_id');
}