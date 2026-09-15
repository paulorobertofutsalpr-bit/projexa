import { pgTable, text, timestamp, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const companies = pgTable("companies", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  document: text("document"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("ADMIN"),
  companyId: text("company_id")
    .notNull()
    .references(() => companies.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const sessions = pgTable("sessions", {
  token: text("token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const clients = pgTable("clients", {
  id: text("id").primaryKey(),
  companyId: text("company_id")
    .notNull()
    .references(() => companies.id),
  tipo: text("tipo").notNull().default("Pessoa Física"),
  nome: text("nome").notNull(),
  documento: text("documento"),
  telefone: text("telefone"),
  email: text("email"),
  cidade: text("cidade"),
  estado: text("estado"),
  observacoes: text("observacoes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const clientHistoryEvents = pgTable("client_history_events", {
  id: text("id").primaryKey(),
  clientId: text("client_id")
    .notNull()
    .references(() => clients.id),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const budgets = pgTable("budgets", {
  id: text("id").primaryKey(),
  companyId: text("company_id")
    .notNull()
    .references(() => companies.id),
  clientId: text("client_id")
    .notNull()
    .references(() => clients.id),
  numero: text("numero").notNull(),
  status: text("status").notNull().default("Rascunho"),
  total: integer("total").notNull().default(0),
  publicToken: text("public_token").notNull().unique(),
  approvedAt: timestamp("approved_at"),
  approvedIp: text("approved_ip"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const budgetItems = pgTable("budget_items", {
  id: text("id").primaryKey(),
  budgetId: text("budget_id")
    .notNull()
    .references(() => budgets.id),
  nome: text("nome").notNull(),
  valor: integer("valor").notNull(),
});

export const budgetsRelations = relations(budgets, ({ one, many }) => ({
  client: one(clients, {
    fields: [budgets.clientId],
    references: [clients.id],
  }),
  items: many(budgetItems),
}));

export const budgetItemsRelations = relations(budgetItems, ({ one }) => ({
  budget: one(budgets, {
    fields: [budgetItems.budgetId],
    references: [budgets.id],
  }),
}));

export const companiesRelations = relations(companies, ({ many }) => ({
  users: many(users),
  clients: many(clients),
  budgets: many(budgets),
}));

export const usersRelations = relations(users, ({ one }) => ({
  company: one(companies, {
    fields: [users.companyId],
    references: [companies.id],
  }),
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
  company: one(companies, {
    fields: [clients.companyId],
    references: [companies.id],
  }),
  history: many(clientHistoryEvents),
}));

export const clientHistoryEventsRelations = relations(clientHistoryEvents, ({ one }) => ({
  client: one(clients, {
    fields: [clientHistoryEvents.clientId],
    references: [clients.id],
  }),
}));
