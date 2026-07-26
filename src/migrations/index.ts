import * as migration_20260725_174206_initial from './20260725_174206_initial';
import * as migration_20260726_170606_legal_fields from './20260726_170606_legal_fields';

export const migrations = [
  {
    up: migration_20260725_174206_initial.up,
    down: migration_20260725_174206_initial.down,
    name: '20260725_174206_initial',
  },
  {
    up: migration_20260726_170606_legal_fields.up,
    down: migration_20260726_170606_legal_fields.down,
    name: '20260726_170606_legal_fields'
  },
];
