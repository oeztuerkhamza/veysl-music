import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`site_settings\` ADD \`legal_vat_id\` text;`)
  await db.run(sql`ALTER TABLE \`site_settings\` ADD \`legal_small_business_exempt\` integer;`)
  await db.run(sql`ALTER TABLE \`site_settings\` ADD \`legal_professional_insurance\` text;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`site_settings\` DROP COLUMN \`legal_vat_id\`;`)
  await db.run(sql`ALTER TABLE \`site_settings\` DROP COLUMN \`legal_small_business_exempt\`;`)
  await db.run(sql`ALTER TABLE \`site_settings\` DROP COLUMN \`legal_professional_insurance\`;`)
}
