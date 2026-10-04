CREATE TABLE `ai_usage_tracker` (
	`id` varchar(255) NOT NULL,
	`userId` varchar(255) NOT NULL,
	`prompt` mediumtext,
	`input_tokens` int unsigned NOT NULL DEFAULT 0,
	`output_tokens` int unsigned NOT NULL DEFAULT 0,
	`total_tokens` int unsigned NOT NULL DEFAULT 0,
	`time_stamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ai_usage_tracker_id` PRIMARY KEY(`id`)
);
