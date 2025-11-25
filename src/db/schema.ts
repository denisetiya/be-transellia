import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  decimal,
  pgEnum,
  index
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const roleEnum = pgEnum('role', ['user', 'admin']);
export const statusEnum = pgEnum('status', ['active', 'inactive', 'pending']);
export const durationUnitEnum = pgEnum('durationUnit', ['days', 'weeks', 'months', 'years']);
export const paymentMethodEnum = pgEnum('paymentMethod', ['va', 'qr', 'wallet', 'credit_card']);
export const paymentStatusEnum = pgEnum('paymentStatus', ['pending', 'success', 'failed', 'expired']);
export const attendanceStatusEnum = pgEnum('attendanceStatus', ['present', 'absent', 'late', 'sick']);

// Users table
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  role: roleEnum('role').default('user'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  isEmployee: boolean('is_employee').default(false),
  subscriptionId: text('subscription_id').references(() => subscriptionLists.id),
}, (table) => ({
  emailIdx: index('email_idx').on(table.email),
}));

// SubscriptionList table
export const subscriptionLists = pgTable('subscription_lists', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  currency: text('currency').default('USD').notNull(),
  description: text('description'),
  durationValue: integer('duration_value').default(1).notNull(),
  durationUnit: durationUnitEnum('duration_unit').default('months').notNull(),
  features: text('features').array().notNull(),
  status: statusEnum('status').default('active').notNull(),
  subscribersCount: integer('subscribers_count').default(0).notNull(),
  totalRevenue: decimal('total_revenue', { precision: 10, scale: 2 }).default('0').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// UserDetails table
export const userDetails = pgTable('user_details', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  name: text('name'),
  imageProfile: text('image_profile'),
  phoneNumber: text('phone_number'),
  address: text('address'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('user_details_user_id_idx').on(table.userId),
}));

// Store table
export const stores = pgTable('stores', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().unique().references(() => users.id),
  address: text('address'),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('stores_user_id_idx').on(table.userId),
}));

// Employee table
export const employees = pgTable('employees', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  storeId: text('store_id').notNull().references(() => stores.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('employees_user_id_idx').on(table.userId),
  storeIdIdx: index('employees_store_id_idx').on(table.storeId),
}));

// Product table
export const products = pgTable('products', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  storeId: text('store_id').notNull().references(() => stores.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  storeIdIdx: index('products_store_id_idx').on(table.storeId),
}));

// HistorySale table
export const historySales = pgTable('history_sales', {
  id: text('id').primaryKey(),
  productId: text('product_id').notNull().references(() => products.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  employeeId: text('employee_id').notNull().references(() => employees.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  totalProduct: decimal('total_product', { precision: 10, scale: 2 }).notNull(),
  paymentMethod: paymentMethodEnum('payment_method'),
  totalPrice: decimal('total_price', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  productIdIdx: index('history_sales_product_id_idx').on(table.productId),
  employeeIdIdx: index('history_sales_employee_id_idx').on(table.employeeId),
}));

// Attendance table
export const attendances = pgTable('attendances', {
  id: text('id').primaryKey(),
  employeeId: text('employee_id').notNull().references(() => employees.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  date: timestamp('date').notNull(),
  status: attendanceStatusEnum('status').notNull(),
  image: text('image'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  employeeIdIdx: index('attendances_employee_id_idx').on(table.employeeId),
  dateIdx: index('attendances_date_idx').on(table.date),
}));

// PaymentHistory table
export const paymentHistories = pgTable('payment_histories', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  subscriptionId: text('subscription_id').notNull().references(() => subscriptionLists.id),
  orderId: text('order_id').notNull().unique(),
  paymentId: text('payment_id'),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency: text('currency').notNull(),
  paymentMethod: paymentMethodEnum('payment_method').notNull(),
  status: paymentStatusEnum('status').notNull(),
  transactionTime: timestamp('transaction_time'),
  expiryTime: timestamp('expiry_time'),
  vaNumber: text('va_number'),
  bank: text('bank'),
  qrCode: text('qr_code'),
  redirectUrl: text('redirect_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('payment_histories_user_id_idx').on(table.userId),
  subscriptionIdIdx: index('payment_histories_subscription_id_idx').on(table.subscriptionId),
  orderIdIdx: index('payment_histories_order_id_idx').on(table.orderId),
}));

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  userDetails: one(userDetails, {
    fields: [users.id],
    references: [userDetails.userId],
  }),
  subscription: one(subscriptionLists, {
    fields: [users.subscriptionId],
    references: [subscriptionLists.id],
  }),
  employee: one(employees, {
    fields: [users.id],
    references: [employees.userId],
  }),
  store: one(stores, {
    fields: [users.id],
    references: [stores.userId],
  }),
  paymentHistories: many(paymentHistories),
}));

export const subscriptionListsRelations = relations(subscriptionLists, ({ many }) => ({
  users: many(users),
  paymentHistories: many(paymentHistories),
}));

export const userDetailsRelations = relations(userDetails, ({ one }) => ({
  user: one(users, {
    fields: [userDetails.userId],
    references: [users.id],
  }),
}));

export const storesRelations = relations(stores, ({ one, many }) => ({
  user: one(users, {
    fields: [stores.userId],
    references: [users.id],
  }),
  products: many(products),
  employees: many(employees),
}));

export const employeesRelations = relations(employees, ({ one, many }) => ({
  user: one(users, {
    fields: [employees.userId],
    references: [users.id],
  }),
  store: one(stores, {
    fields: [employees.storeId],
    references: [stores.id],
  }),
  attendances: many(attendances),
  historySales: many(historySales),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  store: one(stores, {
    fields: [products.storeId],
    references: [stores.id],
  }),
  historySales: many(historySales),
}));

export const historySalesRelations = relations(historySales, ({ one }) => ({
  product: one(products, {
    fields: [historySales.productId],
    references: [products.id],
  }),
  employee: one(employees, {
    fields: [historySales.employeeId],
    references: [employees.id],
  }),
}));

export const attendancesRelations = relations(attendances, ({ one }) => ({
  employee: one(employees, {
    fields: [attendances.employeeId],
    references: [employees.id],
  }),
}));

export const paymentHistoriesRelations = relations(paymentHistories, ({ one }) => ({
  user: one(users, {
    fields: [paymentHistories.userId],
    references: [users.id],
  }),
  subscription: one(subscriptionLists, {
    fields: [paymentHistories.subscriptionId],
    references: [subscriptionLists.id],
  }),
}));

// Type exports for convenience
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type SubscriptionList = typeof subscriptionLists.$inferSelect;
export type NewSubscriptionList = typeof subscriptionLists.$inferInsert;
export type UserDetails = typeof userDetails.$inferSelect;
export type NewUserDetails = typeof userDetails.$inferInsert;
export type Store = typeof stores.$inferSelect;
export type NewStore = typeof stores.$inferInsert;
export type Employee = typeof employees.$inferSelect;
export type NewEmployee = typeof employees.$inferInsert;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type HistorySale = typeof historySales.$inferSelect;
export type NewHistorySale = typeof historySales.$inferInsert;
export type Attendance = typeof attendances.$inferSelect;
export type NewAttendance = typeof attendances.$inferInsert;
export type PaymentHistory = typeof paymentHistories.$inferSelect;
export type NewPaymentHistory = typeof paymentHistories.$inferInsert;