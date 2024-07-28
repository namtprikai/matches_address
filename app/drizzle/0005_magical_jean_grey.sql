CREATE TABLE `data_set_results` (
	`id` integer PRIMARY KEY NOT NULL,
	`title` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
DROP TABLE `data_sets_results`;