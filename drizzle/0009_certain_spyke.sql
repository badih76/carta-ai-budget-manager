CREATE TABLE `expense_budgets` (
	`id` varchar(255) NOT NULL,
	`budgetName` varchar(255) NOT NULL,
	`userId` varchar(255) NOT NULL,
	`accountId` varchar(255) NOT NULL,
	`expenseCateg` varchar(255) NOT NULL,
	`initAmount` decimal(12,2) NOT NULL DEFAULT '0.00',
	`breakdown` mediumtext,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `expense_budgets_id` PRIMARY KEY(`id`)
);
