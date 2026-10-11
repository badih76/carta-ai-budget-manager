CREATE TABLE `budget_maker_settings` (
	`id` varchar(255) NOT NULL,
	`userId` varchar(255) NOT NULL,
	`displayCartaAiAvatar` tinyint NOT NULL DEFAULT 1,
	`cartaAiAvatarGender` varchar(10) NOT NULL DEFAULT 'female',
	`cartaAiAvatarNameFemale` varchar(10) NOT NULL DEFAULT 'Sandra',
	`cartaAiAvatarNameMale` varchar(10) NOT NULL DEFAULT 'Alex',
	`cartaAiAvatarStyle` tinyint NOT NULL DEFAULT 2,
	`effectDate` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `budget_maker_settings_id` PRIMARY KEY(`id`)
);
