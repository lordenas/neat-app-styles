CREATE TABLE "builder_calculators" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"slug" varchar(120) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"theme" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "calc_fields" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"calculator_id" uuid NOT NULL,
	"page_id" uuid,
	"type" varchar(64) NOT NULL,
	"label" varchar(255) NOT NULL,
	"key" varchar(128) NOT NULL,
	"order_index" integer NOT NULL,
	"row_id" varchar(64) NOT NULL,
	"config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"formula" text,
	"visibility" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "calc_leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"calculator_id" uuid NOT NULL,
	"calculator_title" varchar(255),
	"owner_user_id" uuid NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255),
	"phone" varchar(64),
	"form_values" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"result_values" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "calc_pages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"calculator_id" uuid NOT NULL,
	"title" varchar(255),
	"order_index" integer DEFAULT 0 NOT NULL,
	"auto_advance" jsonb,
	"routes" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "embed_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"calculator_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"token" varchar(128) NOT NULL,
	"monthly_views" integer DEFAULT 0 NOT NULL,
	"views_reset_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "builder_calculators" ADD CONSTRAINT "builder_calculators_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calc_fields" ADD CONSTRAINT "calc_fields_calculator_id_builder_calculators_id_fk" FOREIGN KEY ("calculator_id") REFERENCES "public"."builder_calculators"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calc_fields" ADD CONSTRAINT "calc_fields_page_id_calc_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."calc_pages"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calc_leads" ADD CONSTRAINT "calc_leads_calculator_id_builder_calculators_id_fk" FOREIGN KEY ("calculator_id") REFERENCES "public"."builder_calculators"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calc_leads" ADD CONSTRAINT "calc_leads_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calc_pages" ADD CONSTRAINT "calc_pages_calculator_id_builder_calculators_id_fk" FOREIGN KEY ("calculator_id") REFERENCES "public"."builder_calculators"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "embed_tokens" ADD CONSTRAINT "embed_tokens_calculator_id_builder_calculators_id_fk" FOREIGN KEY ("calculator_id") REFERENCES "public"."builder_calculators"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "embed_tokens" ADD CONSTRAINT "embed_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "builder_calculators_slug_uq" ON "builder_calculators" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "builder_calculators_user_idx" ON "builder_calculators" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "calc_fields_calculator_idx" ON "calc_fields" USING btree ("calculator_id");--> statement-breakpoint
CREATE UNIQUE INDEX "calc_fields_key_per_calc_uq" ON "calc_fields" USING btree ("calculator_id","key");--> statement-breakpoint
CREATE INDEX "calc_leads_owner_idx" ON "calc_leads" USING btree ("owner_user_id");--> statement-breakpoint
CREATE INDEX "calc_leads_calculator_idx" ON "calc_leads" USING btree ("calculator_id");--> statement-breakpoint
CREATE INDEX "calc_pages_calculator_idx" ON "calc_pages" USING btree ("calculator_id");--> statement-breakpoint
CREATE UNIQUE INDEX "embed_tokens_token_uq" ON "embed_tokens" USING btree ("token");--> statement-breakpoint
CREATE UNIQUE INDEX "embed_tokens_calculator_uq" ON "embed_tokens" USING btree ("calculator_id");--> statement-breakpoint
CREATE INDEX "embed_tokens_calculator_idx" ON "embed_tokens" USING btree ("calculator_id");