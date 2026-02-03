DROP TABLE `categories`;--> statement-breakpoint
DROP TABLE `customizationOptions`;--> statement-breakpoint
DROP TABLE `customizationValues`;--> statement-breakpoint
DROP TABLE `favorites`;--> statement-breakpoint
DROP TABLE `menuItemCustomizations`;--> statement-breakpoint
DROP TABLE `menuItems`;--> statement-breakpoint
DROP TABLE `orderItems`;--> statement-breakpoint
DROP TABLE `orders`;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin') NOT NULL DEFAULT 'user';