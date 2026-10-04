CREATE TABLE `transactions` (
	`id` varchar(255) NOT NULL,
	`accountId` varchar(255) NOT NULL,
	`userId` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`amount` decimal(12,2) NOT NULL DEFAULT '0.00',
	`type` varchar(2) NOT NULL DEFAULT 'DB',
	`category` varchar(255) NOT NULL DEFAULT '',
	`notes` varchar(255) DEFAULT '',
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`)
);
