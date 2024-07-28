CREATE TABLE `result_views` (
	`id` integer PRIMARY KEY NOT NULL,
	`sheet_id` integer,
	`data_set_result_id` integer,
	`title` text,
	`unit` text,
	`style` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP)
);
