CREATE TABLE `client_pages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(200) NOT NULL,
	`facebook_page_id` varchar(50),
	`facebook_page_token` text,
	`instagram_account_id` varchar(50),
	`is_active` boolean NOT NULL DEFAULT true,
	`is_primary` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `client_pages_id` PRIMARY KEY(`id`)
);
