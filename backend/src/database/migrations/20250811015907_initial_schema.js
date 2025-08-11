/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .createTable('stations', function (table) {
      table.increments('id').primary();
      table.string('name').notNullable().unique();
    })
    .createTable('barbers', function (table) {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.decimal('base_salary').defaultTo(1300);
      table.integer('station_id').unsigned().references('id').inTable('stations');
    })
    .createTable('services', function (table) {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.decimal('price').notNullable();
      table.string('type').notNullable().defaultTo('service');
      table.integer('stock_quantity').defaultTo(0);
      table.integer('min_stock_level').defaultTo(0);
    })
    .createTable('sales', function (table) {
      table.increments('id').primary();
      table.date('sale_date').notNullable();
      table.integer('barber_id').unsigned().notNullable().references('id').inTable('barbers');
      table.integer('station_id').unsigned().notNullable().references('id').inTable('stations');
      table.decimal('total_amount').notNullable();
      table.string('customer_name');
      table.string('payment_method').defaultTo('cash');
    })
    .createTable('sale_items', function (table) {
      table.increments('id').primary();
      table.integer('sale_id').unsigned().notNullable().references('id').inTable('sales').onDelete('CASCADE');
      table.integer('service_id').unsigned().notNullable().references('id').inTable('services');
      table.decimal('price_at_sale').notNullable();
    })
    .createTable('reservations', function (table) {
      table.increments('id').primary();
      table.integer('barber_id').unsigned().notNullable().references('id').inTable('barbers');
      table.integer('station_id').unsigned().notNullable().references('id').inTable('stations');
      table.string('customer_name').notNullable();
      table.string('customer_phone');
      table.datetime('start_time').notNullable();
      table.datetime('end_time').notNullable();
      table.string('status').defaultTo('pending');
      table.timestamp('created_at').defaultTo(knex.fn.now());
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('reservations')
    .dropTableIfExists('sale_items')
    .dropTableIfExists('sales')
    .dropTableIfExists('services')
    .dropTableIfExists('barbers')
    .dropTableIfExists('stations');
};