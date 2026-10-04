CREATE TABLE `income_categories` (
	`id` varchar(255) NOT NULL,
	`purpose` varchar(50) NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text NOT NULL,
	`examples` mediumtext,
	`userId` varchar(255) DEFAULT '',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `income_categories_id` PRIMARY KEY(`id`)
);
