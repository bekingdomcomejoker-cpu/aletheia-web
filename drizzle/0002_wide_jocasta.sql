CREATE TABLE `intelligenceLedger` (
	`id` int AUTO_INCREMENT NOT NULL,
	`module` enum('MINER','REAPER','HUNTER','SEEKER','SIN_EATER') NOT NULL,
	`type` varchar(64) NOT NULL,
	`data` text NOT NULL,
	`severity` enum('CRITICAL','HIGH','MEDIUM','LOW','INFO') NOT NULL DEFAULT 'INFO',
	`lambda` int NOT NULL DEFAULT 167,
	`processedAt` timestamp NOT NULL DEFAULT (now()),
	`idempotencyKey` varchar(255),
	`sourceReference` varchar(255),
	`processed` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `intelligenceLedger_id` PRIMARY KEY(`id`)
);
