CREATE TYPE "public"."provider" AS ENUM('credentials', 'google', 'vk', 'stripe', 'robokassa');--> statement-breakpoint
CREATE TYPE "public"."subscription_plan" AS ENUM('free', 'pro_500', 'pro_1000', 'pro_5000');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('active', 'trial', 'past_due', 'canceled', 'expired');--> statement-breakpoint
CREATE TABLE "analytics_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"event_type" varchar(64) NOT NULL,
	"calculator_id" uuid,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"ip_address" varchar(64),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "api_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(128) NOT NULL,
	"key_hash" text NOT NULL,
	"last_used_at" timestamp with time zone,
	"is_revoked" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "api_usage" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"api_key_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"endpoint" varchar(255) NOT NULL,
	"request_count" integer DEFAULT 1 NOT NULL,
	"period" varchar(7) NOT NULL,
	"ip_address" varchar(64),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "calculators" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(120) NOT NULL,
	"title" varchar(255) NOT NULL,
	"calculator_type" varchar(64) NOT NULL,
	"input_schema" jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "formulas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"calculator_id" uuid NOT NULL,
	"region_id" uuid NOT NULL,
	"version" varchar(32) NOT NULL,
	"effective_from" timestamp with time zone NOT NULL,
	"effective_to" timestamp with time zone,
	"json_definition" jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"provider" "provider" NOT NULL,
	"provider_event_id" text NOT NULL,
	"status" varchar(64) NOT NULL,
	"amount_minor" bigint,
	"currency" varchar(16),
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "regions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(100) NOT NULL,
	"code" varchar(16) NOT NULL,
	"name" varchar(120) NOT NULL,
	"currency" varchar(10) DEFAULT 'USD' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saved_calculations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"calculator_id" uuid NOT NULL,
	"region_id" uuid NOT NULL,
	"formula_id" uuid NOT NULL,
	"calculation_date" timestamp with time zone NOT NULL,
	"input_payload" jsonb NOT NULL,
	"result_payload" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shared_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"calculation_id" uuid NOT NULL,
	"token" varchar(128) NOT NULL,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"plan" "subscription_plan" DEFAULT 'free' NOT NULL,
	"status" "subscription_status" DEFAULT 'active' NOT NULL,
	"quota_per_month" integer DEFAULT 100 NOT NULL,
	"consumed_this_month" integer DEFAULT 0 NOT NULL,
	"watermark_disabled" boolean DEFAULT false NOT NULL,
	"provider_ref" text,
	"current_period_start" timestamp with time zone,
	"current_period_end" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text,
	"full_name" varchar(255),
	"role" varchar(32) DEFAULT 'user' NOT NULL,
	"provider" "provider" DEFAULT 'credentials' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "widget_configs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"api_key_id" uuid NOT NULL,
	"allowed_origins" jsonb NOT NULL,
	"watermark_enabled" boolean DEFAULT true NOT NULL,
	"theme_options" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_calculator_id_calculators_id_fk" FOREIGN KEY ("calculator_id") REFERENCES "public"."calculators"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_usage" ADD CONSTRAINT "api_usage_api_key_id_api_keys_id_fk" FOREIGN KEY ("api_key_id") REFERENCES "public"."api_keys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_usage" ADD CONSTRAINT "api_usage_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "formulas" ADD CONSTRAINT "formulas_calculator_id_calculators_id_fk" FOREIGN KEY ("calculator_id") REFERENCES "public"."calculators"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "formulas" ADD CONSTRAINT "formulas_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_events" ADD CONSTRAINT "payment_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_calculations" ADD CONSTRAINT "saved_calculations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_calculations" ADD CONSTRAINT "saved_calculations_calculator_id_calculators_id_fk" FOREIGN KEY ("calculator_id") REFERENCES "public"."calculators"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_calculations" ADD CONSTRAINT "saved_calculations_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_calculations" ADD CONSTRAINT "saved_calculations_formula_id_formulas_id_fk" FOREIGN KEY ("formula_id") REFERENCES "public"."formulas"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shared_links" ADD CONSTRAINT "shared_links_calculation_id_saved_calculations_id_fk" FOREIGN KEY ("calculation_id") REFERENCES "public"."saved_calculations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "widget_configs" ADD CONSTRAINT "widget_configs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "widget_configs" ADD CONSTRAINT "widget_configs_api_key_id_api_keys_id_fk" FOREIGN KEY ("api_key_id") REFERENCES "public"."api_keys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "analytics_events_type_idx" ON "analytics_events" USING btree ("event_type","created_at");--> statement-breakpoint
CREATE INDEX "api_keys_user_idx" ON "api_keys" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "api_usage_user_period_idx" ON "api_usage" USING btree ("user_id","period");--> statement-breakpoint
CREATE UNIQUE INDEX "calculators_slug_uq" ON "calculators" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "formulas_lookup_idx" ON "formulas" USING btree ("calculator_id","region_id","effective_from");--> statement-breakpoint
CREATE UNIQUE INDEX "payment_events_provider_id_uq" ON "payment_events" USING btree ("provider","provider_event_id");--> statement-breakpoint
CREATE UNIQUE INDEX "regions_slug_uq" ON "regions" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "regions_code_uq" ON "regions" USING btree ("code");--> statement-breakpoint
CREATE INDEX "saved_calculations_user_idx" ON "saved_calculations" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "shared_links_token_uq" ON "shared_links" USING btree ("token");--> statement-breakpoint
CREATE INDEX "subscriptions_user_idx" ON "subscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_uq" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "widget_configs_user_idx" ON "widget_configs" USING btree ("user_id");