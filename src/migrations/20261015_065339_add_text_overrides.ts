import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`text_overrides\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`locale\` text NOT NULL,
  	\`key\` text NOT NULL,
  	\`value\` text NOT NULL,
  	\`slug\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`text_overrides_slug_idx\` ON \`text_overrides\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`text_overrides_updated_at_idx\` ON \`text_overrides\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`text_overrides_created_at_idx\` ON \`text_overrides\` (\`created_at\`);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`text_overrides_id\` integer REFERENCES text_overrides(id);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_text_overrides_id_idx\` ON \`payload_locked_documents_rels\` (\`text_overrides_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`text_overrides\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	\`media_id\` integer,
  	\`site_images_id\` integer,
  	\`blocked_dates_id\` integer,
  	\`bookings_id\` integer,
  	\`enquiries_id\` integer,
  	\`contact_messages_id\` integer,
  	\`whatsapp_leads_id\` integer,
  	\`curated_posts_id\` integer,
  	\`blog_posts_id\` integer,
  	\`testimonials_id\` integer,
  	\`weddings_id\` integer,
  	\`wedding_clips_id\` integer,
  	\`wedding_submissions_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`site_images_id\`) REFERENCES \`site_images\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`blocked_dates_id\`) REFERENCES \`blocked_dates\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`bookings_id\`) REFERENCES \`bookings\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`enquiries_id\`) REFERENCES \`enquiries\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`contact_messages_id\`) REFERENCES \`contact_messages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`whatsapp_leads_id\`) REFERENCES \`whatsapp_leads\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`curated_posts_id\`) REFERENCES \`curated_posts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`blog_posts_id\`) REFERENCES \`blog_posts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`testimonials_id\`) REFERENCES \`testimonials\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`weddings_id\`) REFERENCES \`weddings\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`wedding_clips_id\`) REFERENCES \`wedding_clips\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`wedding_submissions_id\`) REFERENCES \`wedding_submissions\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_payload_locked_documents_rels\`("id", "order", "parent_id", "path", "users_id", "media_id", "site_images_id", "blocked_dates_id", "bookings_id", "enquiries_id", "contact_messages_id", "whatsapp_leads_id", "curated_posts_id", "blog_posts_id", "testimonials_id", "weddings_id", "wedding_clips_id", "wedding_submissions_id") SELECT "id", "order", "parent_id", "path", "users_id", "media_id", "site_images_id", "blocked_dates_id", "bookings_id", "enquiries_id", "contact_messages_id", "whatsapp_leads_id", "curated_posts_id", "blog_posts_id", "testimonials_id", "weddings_id", "wedding_clips_id", "wedding_submissions_id" FROM \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_payload_locked_documents_rels\` RENAME TO \`payload_locked_documents_rels\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_site_images_id_idx\` ON \`payload_locked_documents_rels\` (\`site_images_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_blocked_dates_id_idx\` ON \`payload_locked_documents_rels\` (\`blocked_dates_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_bookings_id_idx\` ON \`payload_locked_documents_rels\` (\`bookings_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_enquiries_id_idx\` ON \`payload_locked_documents_rels\` (\`enquiries_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_contact_messages_id_idx\` ON \`payload_locked_documents_rels\` (\`contact_messages_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_whatsapp_leads_id_idx\` ON \`payload_locked_documents_rels\` (\`whatsapp_leads_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_curated_posts_id_idx\` ON \`payload_locked_documents_rels\` (\`curated_posts_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_blog_posts_id_idx\` ON \`payload_locked_documents_rels\` (\`blog_posts_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_testimonials_id_idx\` ON \`payload_locked_documents_rels\` (\`testimonials_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_weddings_id_idx\` ON \`payload_locked_documents_rels\` (\`weddings_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_wedding_clips_id_idx\` ON \`payload_locked_documents_rels\` (\`wedding_clips_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_wedding_submissions_id_idx\` ON \`payload_locked_documents_rels\` (\`wedding_submissions_id\`);`)
}
