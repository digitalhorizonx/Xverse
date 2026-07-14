CREATE TABLE `cms_products` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`showcase_slug` text NOT NULL,
	`tagline_en` text NOT NULL,
	`tagline_ar` text NOT NULL,
	`description_en` text NOT NULL,
	`description_ar` text NOT NULL,
	`color` text NOT NULL,
	`accent_color` text NOT NULL,
	`live` integer DEFAULT false NOT NULL,
	`cta_label_en` text NOT NULL,
	`cta_label_ar` text NOT NULL,
	`cta_url` text NOT NULL,
	`orbit_radius` integer NOT NULL,
	`orbit_speed_pct` integer NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`updated_by` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `cms_products_slug_unique` ON `cms_products` (`showcase_slug`);--> statement-breakpoint
CREATE TABLE `content_versions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`reason` text NOT NULL,
	`snapshot` text NOT NULL,
	`created_by` text,
	`created_by_email` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `content_versions_entity_idx` ON `content_versions` (`entity_type`,`entity_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `industries` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name_en` text NOT NULL,
	`name_ar` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`active` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `industries_slug_unique` ON `industries` (`slug`);--> statement-breakpoint
CREATE TABLE `showcases` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`product_id` text NOT NULL,
	`type` text DEFAULT 'demo-brand' NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`verified` integer DEFAULT false NOT NULL,
	`featured` integer DEFAULT false NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`industry_id` text,
	`tag_ids` text DEFAULT '' NOT NULL,
	`title_en` text DEFAULT '' NOT NULL,
	`title_ar` text DEFAULT '' NOT NULL,
	`summary_en` text DEFAULT '' NOT NULL,
	`summary_ar` text DEFAULT '' NOT NULL,
	`story_en` text DEFAULT '' NOT NULL,
	`story_ar` text DEFAULT '' NOT NULL,
	`seo_title_en` text DEFAULT '' NOT NULL,
	`seo_title_ar` text DEFAULT '' NOT NULL,
	`seo_description_en` text DEFAULT '' NOT NULL,
	`seo_description_ar` text DEFAULT '' NOT NULL,
	`blocks_en` text DEFAULT '{}' NOT NULL,
	`blocks_ar` text DEFAULT '{}' NOT NULL,
	`created_by` text,
	`updated_by` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`published_at` integer,
	FOREIGN KEY (`product_id`) REFERENCES `cms_products`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`industry_id`) REFERENCES `industries`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `showcases_slug_unique` ON `showcases` (`slug`);--> statement-breakpoint
CREATE INDEX `showcases_product_idx` ON `showcases` (`product_id`);--> statement-breakpoint
CREATE INDEX `showcases_status_idx` ON `showcases` (`status`);--> statement-breakpoint
CREATE TABLE `tags` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`kind` text DEFAULT 'tag' NOT NULL,
	`name_en` text NOT NULL,
	`name_ar` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tags_slug_unique` ON `tags` (`slug`);