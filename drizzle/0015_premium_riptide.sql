ALTER TABLE `expense_categories` ADD `level` varchar(255) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `expense_categories` ADD `parent` varchar(255) DEFAULT '' NOT NULL;