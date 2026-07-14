CREATE TABLE `media` (
	`id` text PRIMARY KEY NOT NULL,
	`file_name` text NOT NULL,
	`thumb_file_name` text,
	`original_name` text NOT NULL,
	`mime` text NOT NULL,
	`kind` text DEFAULT 'image' NOT NULL,
	`size_bytes` integer NOT NULL,
	`width` integer,
	`height` integer,
	`alt_en` text DEFAULT '' NOT NULL,
	`alt_ar` text DEFAULT '' NOT NULL,
	`created_by` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `media_file_unique` ON `media` (`file_name`);--> statement-breakpoint
CREATE INDEX `media_kind_idx` ON `media` (`kind`);