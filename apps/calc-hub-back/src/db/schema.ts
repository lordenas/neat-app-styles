import {
  bigint,
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const subscriptionPlanEnum = pgEnum('subscription_plan', [
  'free',
  'pro_500',
  'pro_1000',
  'pro_5000',
]);

export const subscriptionStatusEnum = pgEnum('subscription_status', [
  'active',
  'trial',
  'past_due',
  'canceled',
  'expired',
]);

export const providerEnum = pgEnum('provider', [
  'credentials',
  'google',
  'vk',
  'stripe',
  'robokassa',
]);

export const users = pgTable(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    email: varchar('email', { length: 255 }).notNull(),
    passwordHash: text('password_hash'),
    fullName: varchar('full_name', { length: 255 }),
    role: varchar('role', { length: 32 }).default('user').notNull(),
    provider: providerEnum('provider').default('credentials').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [uniqueIndex('users_email_uq').on(table.email)],
);

export const subscriptions = pgTable(
  'subscriptions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    plan: subscriptionPlanEnum('plan').default('free').notNull(),
    status: subscriptionStatusEnum('status').default('active').notNull(),
    quotaPerMonth: integer('quota_per_month').default(100).notNull(),
    consumedThisMonth: integer('consumed_this_month').default(0).notNull(),
    watermarkDisabled: boolean('watermark_disabled').default(false).notNull(),
    providerRef: text('provider_ref'),
    currentPeriodStart: timestamp('current_period_start', {
      withTimezone: true,
    }),
    currentPeriodEnd: timestamp('current_period_end', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index('subscriptions_user_idx').on(table.userId)],
);

export const apiKeys = pgTable(
  'api_keys',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 128 }).notNull(),
    keyHash: text('key_hash').notNull(),
    lastUsedAt: timestamp('last_used_at', { withTimezone: true }),
    isRevoked: boolean('is_revoked').default(false).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index('api_keys_user_idx').on(table.userId)],
);

export const apiUsage = pgTable(
  'api_usage',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    apiKeyId: uuid('api_key_id')
      .notNull()
      .references(() => apiKeys.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    endpoint: varchar('endpoint', { length: 255 }).notNull(),
    requestCount: integer('request_count').default(1).notNull(),
    period: varchar('period', { length: 7 }).notNull(),
    ipAddress: varchar('ip_address', { length: 64 }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('api_usage_user_period_idx').on(table.userId, table.period),
  ],
);

export const regions = pgTable(
  'regions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    slug: varchar('slug', { length: 100 }).notNull(),
    code: varchar('code', { length: 16 }).notNull(),
    name: varchar('name', { length: 120 }).notNull(),
    currency: varchar('currency', { length: 10 }).default('USD').notNull(),
    isActive: boolean('is_active').default(true).notNull(),
  },
  (table) => [
    uniqueIndex('regions_slug_uq').on(table.slug),
    uniqueIndex('regions_code_uq').on(table.code),
  ],
);

export const calculators = pgTable(
  'calculators',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    slug: varchar('slug', { length: 120 }).notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    calculatorType: varchar('calculator_type', { length: 64 }).notNull(),
    inputSchema: jsonb('input_schema').notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [uniqueIndex('calculators_slug_uq').on(table.slug)],
);

export const formulas = pgTable(
  'formulas',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    calculatorId: uuid('calculator_id')
      .notNull()
      .references(() => calculators.id, { onDelete: 'cascade' }),
    regionId: uuid('region_id')
      .notNull()
      .references(() => regions.id, { onDelete: 'cascade' }),
    version: varchar('version', { length: 32 }).notNull(),
    effectiveFrom: timestamp('effective_from', {
      withTimezone: true,
    }).notNull(),
    effectiveTo: timestamp('effective_to', { withTimezone: true }),
    // Stores FormulaDslDefinition AST document (see src/modules/formulas/dsl.types.ts).
    jsonDefinition: jsonb('json_definition').notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('formulas_lookup_idx').on(
      table.calculatorId,
      table.regionId,
      table.effectiveFrom,
    ),
  ],
);

export const savedCalculations = pgTable(
  'saved_calculations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    calculatorId: uuid('calculator_id')
      .notNull()
      .references(() => calculators.id, { onDelete: 'restrict' }),
    regionId: uuid('region_id')
      .notNull()
      .references(() => regions.id, { onDelete: 'restrict' }),
    formulaId: uuid('formula_id')
      .notNull()
      .references(() => formulas.id, { onDelete: 'restrict' }),
    calculationDate: timestamp('calculation_date', {
      withTimezone: true,
    }).notNull(),
    inputPayload: jsonb('input_payload').notNull(),
    resultPayload: jsonb('result_payload').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index('saved_calculations_user_idx').on(table.userId)],
);

export const sharedLinks = pgTable(
  'shared_links',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    calculationId: uuid('calculation_id')
      .notNull()
      .references(() => savedCalculations.id, { onDelete: 'cascade' }),
    token: varchar('token', { length: 128 }).notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [uniqueIndex('shared_links_token_uq').on(table.token)],
);

export const widgetConfigs = pgTable(
  'widget_configs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    apiKeyId: uuid('api_key_id')
      .notNull()
      .references(() => apiKeys.id, { onDelete: 'cascade' }),
    allowedOrigins: jsonb('allowed_origins').notNull(),
    watermarkEnabled: boolean('watermark_enabled').default(true).notNull(),
    themeOptions: jsonb('theme_options').default({}).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index('widget_configs_user_idx').on(table.userId)],
);

export const builderCalculators = pgTable(
  'builder_calculators',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    slug: varchar('slug', { length: 120 }).notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    theme: jsonb('theme').default({}).notNull(),
    isPublic: boolean('is_public').default(false).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex('builder_calculators_slug_uq').on(table.slug),
    index('builder_calculators_user_idx').on(table.userId),
  ],
);

export const calcPages = pgTable(
  'calc_pages',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    calculatorId: uuid('calculator_id')
      .notNull()
      .references(() => builderCalculators.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 255 }),
    orderIndex: integer('order_index').default(0).notNull(),
    autoAdvance: jsonb('auto_advance'),
    routes: jsonb('routes'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index('calc_pages_calculator_idx').on(table.calculatorId)],
);

export const calcFields = pgTable(
  'calc_fields',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    calculatorId: uuid('calculator_id')
      .notNull()
      .references(() => builderCalculators.id, { onDelete: 'cascade' }),
    pageId: uuid('page_id').references(() => calcPages.id, {
      onDelete: 'set null',
    }),
    type: varchar('type', { length: 64 }).notNull(),
    label: varchar('label', { length: 255 }).notNull(),
    key: varchar('key', { length: 128 }).notNull(),
    orderIndex: integer('order_index').notNull(),
    rowId: varchar('row_id', { length: 64 }).notNull(),
    config: jsonb('config').default({}).notNull(),
    formula: text('formula'),
    visibility: jsonb('visibility'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('calc_fields_calculator_idx').on(table.calculatorId),
    uniqueIndex('calc_fields_key_per_calc_uq').on(
      table.calculatorId,
      table.key,
    ),
  ],
);

export const embedTokens = pgTable(
  'embed_tokens',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    calculatorId: uuid('calculator_id')
      .notNull()
      .references(() => builderCalculators.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    token: varchar('token', { length: 128 }).notNull(),
    monthlyViews: integer('monthly_views').default(0).notNull(),
    viewsResetAt: timestamp('views_reset_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex('embed_tokens_token_uq').on(table.token),
    uniqueIndex('embed_tokens_calculator_uq').on(table.calculatorId),
    index('embed_tokens_calculator_idx').on(table.calculatorId),
  ],
);

export const calcLeads = pgTable(
  'calc_leads',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    calculatorId: uuid('calculator_id')
      .notNull()
      .references(() => builderCalculators.id, { onDelete: 'cascade' }),
    calculatorTitle: varchar('calculator_title', { length: 255 }),
    ownerUserId: uuid('owner_user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    email: varchar('email', { length: 255 }).notNull(),
    name: varchar('name', { length: 255 }),
    phone: varchar('phone', { length: 64 }),
    formValues: jsonb('form_values').default({}).notNull(),
    resultValues: jsonb('result_values').default({}).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('calc_leads_owner_idx').on(table.ownerUserId),
    index('calc_leads_calculator_idx').on(table.calculatorId),
  ],
);

export const analyticsEvents = pgTable(
  'analytics_events',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    eventType: varchar('event_type', { length: 64 }).notNull(),
    calculatorId: uuid('calculator_id').references(() => calculators.id, {
      onDelete: 'set null',
    }),
    payload: jsonb('payload').default({}).notNull(),
    ipAddress: varchar('ip_address', { length: 64 }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('analytics_events_type_idx').on(table.eventType, table.createdAt),
  ],
);

export const paymentEvents = pgTable(
  'payment_events',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    provider: providerEnum('provider').notNull(),
    providerEventId: text('provider_event_id').notNull(),
    status: varchar('status', { length: 64 }).notNull(),
    amountMinor: bigint('amount_minor', { mode: 'number' }),
    currency: varchar('currency', { length: 16 }),
    payload: jsonb('payload').default({}).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex('payment_events_provider_id_uq').on(
      table.provider,
      table.providerEventId,
    ),
  ],
);
