ALTER TABLE `normalized_data_sets` ADD `created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL;--> statement-breakpoint
ALTER TABLE `normalized_data_sets` ADD `updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL;--> statement-breakpoint
ALTER TABLE `raw_data_sets` ADD `created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL;--> statement-breakpoint
ALTER TABLE `raw_data_sets` ADD `updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL;