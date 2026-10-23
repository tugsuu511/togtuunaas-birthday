CREATE TABLE `rsvps` (
	`id` text PRIMARY KEY NOT NULL,
	`guest_name` text NOT NULL,
	`attendance` text NOT NULL,
	`adult_count` integer DEFAULT 0 NOT NULL,
	`child_count` integer DEFAULT 0 NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`created_at` integer NOT NULL
);
