CREATE TABLE `recurring_expenses` (
	`id` varchar(255) NOT NULL,
	`accountId` varchar(255) NOT NULL,
	`userId` varchar(255) NOT NULL,
	`service` varchar(255) NOT NULL,
	`frequency` varchar(20) NOT NULL,
	`cycleDays` int DEFAULT 30,
	`balance` decimal(12,2) NOT NULL DEFAULT '0.00',
	`nextDate` varchar(20),
	`comment` varchar(255),
	CONSTRAINT `recurring_expenses_id` PRIMARY KEY(`id`)
);
