CREATE TABLE `workbooks` (
	`id` integer PRIMARY KEY NOT NULL,
	`title` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP)
);
