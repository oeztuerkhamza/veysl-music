import * as migration_20260725_174206_initial from './20260725_174206_initial';
import * as migration_20260726_170606_legal_fields from './20260726_170606_legal_fields';
import * as migration_20260801_132727_event_type_optional from './20260801_132727_event_type_optional';
import * as migration_20260818_113736_add_weddings from './20260818_113736_add_weddings';

export const migrations = [
  {
    up: migration_20260725_174206_initial.up,
    down: migration_20260725_174206_initial.down,
    name: '20260725_174206_initial',
  },
  {
    up: migration_20260726_170606_legal_fields.up,
    down: migration_20260726_170606_legal_fields.down,
    name: '20260726_170606_legal_fields',
  },
  {
    up: migration_20260801_132727_event_type_optional.up,
    down: migration_20260801_132727_event_type_optional.down,
    name: '20260801_132727_event_type_optional',
  },
  {
    up: migration_20260818_113736_add_weddings.up,
    down: migration_20260818_113736_add_weddings.down,
    name: '20260818_113736_add_weddings'
  },
];
