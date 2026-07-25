import * as migration_20260725_174206_initial from './20260725_174206_initial';

export const migrations = [
  {
    up: migration_20260725_174206_initial.up,
    down: migration_20260725_174206_initial.down,
    name: '20260725_174206_initial'
  },
];
