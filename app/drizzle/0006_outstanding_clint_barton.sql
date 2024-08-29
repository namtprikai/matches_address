CREATE TABLE `data_set_detail_areas` (
	`id` integer PRIMARY KEY NOT NULL,
	`data_set_result_id` integer,
	`reference_date` text NOT NULL,
	`address` text,
	`young_population_ratio` real,
	`elderly_population_ratio` real,
	`total_building_count` integer,
	`vacant_house_ratio` real,
	`area` real,
	`geometry` text,
	`key_code` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `data_set_detail_buildings` (
	`id` integer PRIMARY KEY NOT NULL,
	`data_set_result_id` integer,
	`household_code` text,
	`normalized_address` text,
	`reference_date` text NOT NULL,
	`number_of_people_in_household` integer,
	`number_of_people_under_15_years_old` integer,
	`composition_ratio_of_people_under_15_years_old` real,
	`number_of_people_aged_15_to_64` integer,
	`composition_ratio_of_people_aged_15_to_64` real,
	`number_of_people_aged_65_and_over` integer,
	`composition_ratio_of_people_aged_65_and_over` real,
	`male_to_female_ratio` real,
	`period_of_residence` integer,
	`water_number_suido_residence` text,
	`closing_flag_suido_residence` integer,
	`maximum_water_usage_suido_residence` real,
	`average_water_usage_suido_residence` real,
	`total_water_usage_suido_residence` real,
	`minimum_water_usage_suido_residence` real,
	`name_source_information_suido_residence` text,
	`structure_name_touki_residence` text,
	`registration_date_touki_residence` text,
	`name_source_information_touki_residence` text,
	`id_akiya_result_cleaned` text,
	`address_akiya_result_cleaned` text,
	`geometry` text,
	`measuredheight` real,
	`rank` integer,
	`depth` integer,
	`duration` real,
	`number_of_floors_above_ground` integer,
	`number_of_basement_floors` integer,
	`buildingdisasterriskattribute_buildinginlandfloodingriskattribute_description` text,
	`buildingdisasterriskattribute_buildinginlandfloodingriskattribute_rank` integer,
	`buildingdisasterriskattribute_buildinginlandfloodingriskattribute_depth` real,
	`buildingdisasterriskattribute_buildingriverfloodingriskattribute_description` text,
	`buildingdisasterriskattribute_buildingriverfloodingriskattribute_rank` integer,
	`buildingdisasterriskattribute_buildingriverfloodingriskattribute_depth` real,
	`buildingdisasterriskattribute_buildinglandslideriskattribute_description` text,
	`name` text,
	`pred` integer,
	`pred_proba` real,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
/*
 SQLite does not support "Changing existing column type" out of the box, we do not generate automatic migration for that, so it has to be done manually
 Please refer to: https://www.techonthenet.com/sqlite/tables/alter_table.php
                  https://www.sqlite.org/lang_altertable.html
                  https://stackoverflow.com/questions/2083543/modify-a-columns-type-in-sqlite3

 Due to that we don't generate migration automatically and it has to be done manually
*/