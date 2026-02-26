CREATE TABLE `events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(200) NOT NULL,
	`title_es` varchar(200),
	`description` text,
	`description_es` text,
	`event_date` bigint NOT NULL,
	`image_url` text,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `food_photos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`url` text NOT NULL,
	`file_key` varchar(500) NOT NULL,
	`caption` text,
	`menu_item_id` int,
	`uploaded_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `food_photos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `menu_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`category` varchar(100) NOT NULL,
	`name` varchar(200) NOT NULL,
	`name_es` varchar(200),
	`price` float,
	`description` text,
	`description_es` text,
	`modifier_groups` varchar(300),
	`is_active` boolean NOT NULL DEFAULT true,
	`is_featured` boolean NOT NULL DEFAULT false,
	`photo_url` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `menu_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`platform` enum('facebook','instagram','both') NOT NULL DEFAULT 'both',
	`caption_en` text NOT NULL,
	`caption_es` text,
	`hashtags` text,
	`image_url` text,
	`menu_item_id` int,
	`post_type` enum('menu_item','special','event','promotion','taco_tuesday','manual','borderline_brew') NOT NULL DEFAULT 'menu_item',
	`status` enum('draft','scheduled','published','cancelled') NOT NULL DEFAULT 'draft',
	`scheduled_at` bigint,
	`published_at` bigint,
	`related_id` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `posts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `promotions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('review_dessert','cdl_discount','honor_roll','educator_discount','custom') NOT NULL,
	`title` varchar(200) NOT NULL,
	`title_es` varchar(200),
	`description` text,
	`description_es` text,
	`discount_value` varchar(50),
	`requirements` text,
	`requirements_es` text,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `promotions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `specials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(200) NOT NULL,
	`title_es` varchar(200),
	`description` text,
	`description_es` text,
	`price` float,
	`valid_from` bigint,
	`valid_to` bigint,
	`is_active` boolean NOT NULL DEFAULT true,
	`image_url` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `specials_id` PRIMARY KEY(`id`)
);
