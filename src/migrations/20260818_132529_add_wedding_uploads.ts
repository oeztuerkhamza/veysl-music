import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`weddings_clips\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`clip_id\` integer NOT NULL,
  	FOREIGN KEY (\`clip_id\`) REFERENCES \`wedding_clips\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`weddings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`weddings_clips_order_idx\` ON \`weddings_clips\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`weddings_clips_parent_id_idx\` ON \`weddings_clips\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`weddings_clips_clip_idx\` ON \`weddings_clips\` (\`clip_id\`);`)
  await db.run(sql`CREATE TABLE \`wedding_clips\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`url\` text,
  	\`thumbnail_u_r_l\` text,
  	\`filename\` text,
  	\`mime_type\` text,
  	\`filesize\` numeric,
  	\`width\` numeric,
  	\`height\` numeric,
  	\`focal_x\` numeric,
  	\`focal_y\` numeric
  );
  `)
  await db.run(sql`CREATE INDEX \`wedding_clips_updated_at_idx\` ON \`wedding_clips\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`wedding_clips_created_at_idx\` ON \`wedding_clips\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`wedding_clips_filename_idx\` ON \`wedding_clips\` (\`filename\`);`)
  await db.run(sql`CREATE TABLE \`wedding_clips_locales\` (
  	\`title\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`wedding_clips\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`wedding_clips_locales_locale_parent_id_unique\` ON \`wedding_clips_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`wedding_submissions_photos\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer NOT NULL,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`wedding_submissions\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`wedding_submissions_photos_order_idx\` ON \`wedding_submissions_photos\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`wedding_submissions_photos_parent_id_idx\` ON \`wedding_submissions_photos\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`wedding_submissions_photos_image_idx\` ON \`wedding_submissions_photos\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`wedding_submissions_clips\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`clip_id\` integer NOT NULL,
  	FOREIGN KEY (\`clip_id\`) REFERENCES \`wedding_clips\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`wedding_submissions\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`wedding_submissions_clips_order_idx\` ON \`wedding_submissions_clips\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`wedding_submissions_clips_parent_id_idx\` ON \`wedding_submissions_clips\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`wedding_submissions_clips_clip_idx\` ON \`wedding_submissions_clips\` (\`clip_id\`);`)
  await db.run(sql`CREATE TABLE \`wedding_submissions_youtube_urls\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`url\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`wedding_submissions\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`wedding_submissions_youtube_urls_order_idx\` ON \`wedding_submissions_youtube_urls\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`wedding_submissions_youtube_urls_parent_id_idx\` ON \`wedding_submissions_youtube_urls\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`wedding_submissions\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`wedding_id\` integer NOT NULL,
  	\`submitter_name\` text,
  	\`note\` text,
  	\`status\` text DEFAULT 'pending' NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`wedding_id\`) REFERENCES \`weddings\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`wedding_submissions_wedding_idx\` ON \`wedding_submissions\` (\`wedding_id\`);`)
  await db.run(sql`CREATE INDEX \`wedding_submissions_status_idx\` ON \`wedding_submissions\` (\`status\`);`)
  await db.run(sql`CREATE INDEX \`wedding_submissions_updated_at_idx\` ON \`wedding_submissions\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`wedding_submissions_created_at_idx\` ON \`wedding_submissions\` (\`created_at\`);`)
  await db.run(sql`ALTER TABLE \`weddings\` ADD \`upload_token\` text;`)
  await db.run(sql`ALTER TABLE \`weddings\` ADD \`upload_enabled\` integer DEFAULT true;`)
  await db.run(sql`CREATE UNIQUE INDEX \`weddings_upload_token_idx\` ON \`weddings\` (\`upload_token\`);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`wedding_clips_id\` integer REFERENCES wedding_clips(id);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`wedding_submissions_id\` integer REFERENCES wedding_submissions(id);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_wedding_clips_id_idx\` ON \`payload_locked_documents_rels\` (\`wedding_clips_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_wedding_submissions_id_idx\` ON \`payload_locked_documents_rels\` (\`wedding_submissions_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`weddings_clips\`;`)
  await db.run(sql`DROP TABLE \`wedding_clips\`;`)
  await db.run(sql`DROP TABLE \`wedding_clips_locales\`;`)
  await db.run(sql`DROP TABLE \`wedding_submissions_photos\`;`)
  await db.run(sql`DROP TABLE \`wedding_submissions_clips\`;`)
  await db.run(sql`DROP TABLE \`wedding_submissions_youtube_urls\`;`)
  await db.run(sql`DROP TABLE \`wedding_submissions\`;`)
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
  	FOREIGN KEY (\`weddings_id\`) REFERENCES \`weddings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_payload_locked_documents_rels\`("id", "order", "parent_id", "path", "users_id", "media_id", "site_images_id", "blocked_dates_id", "bookings_id", "enquiries_id", "contact_messages_id", "whatsapp_leads_id", "curated_posts_id", "blog_posts_id", "testimonials_id", "weddings_id") SELECT "id", "order", "parent_id", "path", "users_id", "media_id", "site_images_id", "blocked_dates_id", "bookings_id", "enquiries_id", "contact_messages_id", "whatsapp_leads_id", "curated_posts_id", "blog_posts_id", "testimonials_id", "weddings_id" FROM \`payload_locked_documents_rels\`;`)
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
  await db.run(sql`DROP INDEX \`weddings_upload_token_idx\`;`)
  await db.run(sql`ALTER TABLE \`weddings\` DROP COLUMN \`upload_token\`;`)
  await db.run(sql`ALTER TABLE \`weddings\` DROP COLUMN \`upload_enabled\`;`)
}
