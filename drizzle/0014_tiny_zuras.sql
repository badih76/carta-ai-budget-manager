CREATE TABLE `transaction_breakdown` (
	`id` varchar(255) NOT NULL,
	`transactionId` varchar(255) NOT NULL,
	`userId` varchar(255) NOT NULL,
	`details` varchar(255) NOT NULL DEFAULT '',
	`unitPrice` decimal(12,2) NOT NULL DEFAULT '0.00',
	`totalPrice` decimal(12,2) NOT NULL DEFAULT '0.00',
	`category` varchar(255) NOT NULL DEFAULT '',
	CONSTRAINT `transaction_breakdown_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `transactions` ADD `details` varchar(255) DEFAULT '' NOT NULL;