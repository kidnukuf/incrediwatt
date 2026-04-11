CREATE TABLE `security_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`event_type` enum('failed_login','ip_lockout','captcha_failed','api_probe_blocked','successful_login','rate_limit_hit') NOT NULL,
	`ip` varchar(64) NOT NULL,
	`details` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `security_events_id` PRIMARY KEY(`id`)
);
