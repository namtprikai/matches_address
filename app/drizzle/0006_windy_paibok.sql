CREATE TABLE `data_set_detail_areas` (
	`id` integer PRIMARY KEY NOT NULL,
	`data_set_result_id` integer,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `data_set_detail_buildings` (
	`id` integer PRIMARY KEY NOT NULL,
	`data_set_result_id` integer,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
