import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_enquiries\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`status\` text DEFAULT 'new' NOT NULL,
  	\`lead_score\` numeric,
  	\`lead_tier\` text,
  	\`locale\` text,
  	\`event_date\` text NOT NULL,
  	\`event_type\` text,
  	\`city\` text NOT NULL,
  	\`venue\` text,
  	\`guests\` numeric,
  	\`start_time\` text,
  	\`end_time\` text,
  	\`package\` text,
  	\`budget\` text,
  	\`hosting_language\` text,
  	\`first_name\` text NOT NULL,
  	\`last_name\` text NOT NULL,
  	\`partner_name\` text,
  	\`email\` text NOT NULL,
  	\`phone\` text NOT NULL,
  	\`message\` text,
  	\`source\` text,
  	\`consent\` integer DEFAULT false NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`INSERT INTO \`__new_enquiries\`("id", "status", "lead_score", "lead_tier", "locale", "event_date", "event_type", "city", "venue", "guests", "start_time", "end_time", "package", "budget", "hosting_language", "first_name", "last_name", "partner_name", "email", "phone", "message", "source", "consent", "updated_at", "created_at") SELECT "id", "status", "lead_score", "lead_tier", "locale", "event_date", "event_type", "city", "venue", "guests", "start_time", "end_time", "package", "budget", "hosting_language", "first_name", "last_name", "partner_name", "email", "phone", "message", "source", "consent", "updated_at", "created_at" FROM \`enquiries\`;`)
  await db.run(sql`DROP TABLE \`enquiries\`;`)
  await db.run(sql`ALTER TABLE \`__new_enquiries\` RENAME TO \`enquiries\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`enquiries_event_date_idx\` ON \`enquiries\` (\`event_date\`);`)
  await db.run(sql`CREATE INDEX \`enquiries_updated_at_idx\` ON \`enquiries\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`enquiries_created_at_idx\` ON \`enquiries\` (\`created_at\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_enquiries\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`status\` text DEFAULT 'new' NOT NULL,
  	\`lead_score\` numeric,
  	\`lead_tier\` text,
  	\`locale\` text,
  	\`event_date\` text NOT NULL,
  	\`event_type\` text NOT NULL,
  	\`city\` text NOT NULL,
  	\`venue\` text,
  	\`guests\` numeric,
  	\`start_time\` text,
  	\`end_time\` text,
  	\`package\` text,
  	\`budget\` text,
  	\`hosting_language\` text,
  	\`first_name\` text NOT NULL,
  	\`last_name\` text NOT NULL,
  	\`partner_name\` text,
  	\`email\` text NOT NULL,
  	\`phone\` text NOT NULL,
  	\`message\` text,
  	\`source\` text,
  	\`consent\` integer DEFAULT false NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`INSERT INTO \`__new_enquiries\`("id", "status", "lead_score", "lead_tier", "locale", "event_date", "event_type", "city", "venue", "guests", "start_time", "end_time", "package", "budget", "hosting_language", "first_name", "last_name", "partner_name", "email", "phone", "message", "source", "consent", "updated_at", "created_at") SELECT "id", "status", "lead_score", "lead_tier", "locale", "event_date", "event_type", "city", "venue", "guests", "start_time", "end_time", "package", "budget", "hosting_language", "first_name", "last_name", "partner_name", "email", "phone", "message", "source", "consent", "updated_at", "created_at" FROM \`enquiries\`;`)
  await db.run(sql`DROP TABLE \`enquiries\`;`)
  await db.run(sql`ALTER TABLE \`__new_enquiries\` RENAME TO \`enquiries\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`enquiries_event_date_idx\` ON \`enquiries\` (\`event_date\`);`)
  await db.run(sql`CREATE INDEX \`enquiries_updated_at_idx\` ON \`enquiries\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`enquiries_created_at_idx\` ON \`enquiries\` (\`created_at\`);`)
}
