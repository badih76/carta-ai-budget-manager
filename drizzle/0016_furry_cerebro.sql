ALTER TABLE `income_categories` ADD `level` varchar(255) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `income_categories` ADD `parent` varchar(255) DEFAULT '' NOT NULL;