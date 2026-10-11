ALTER TABLE `transactions` RENAME COLUMN `created_at` TO `createDate`;--> statement-breakpoint
ALTER TABLE `transactions` ADD `effectDate` timestamp DEFAULT (now()) NOT NULL;--> statement-breakpoint
ALTER TABLE `transactions` ADD `balance` decimal(12,2) DEFAULT '0.00' NOT NULL;