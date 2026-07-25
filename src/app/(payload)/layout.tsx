import type { ServerFunctionClient } from 'payload';
import config from '@payload-config';
import '@payloadcms/next/css';
import { handleServerFunctions, RootLayout } from '@payloadcms/next/layouts';
import React from 'react';
import { importMap } from './admin/importMap';

/**
 * A second, independent root for the admin panel — this app has no
 * `src/app/layout.tsx` (the public `[locale]` segment already acts as the
 * effective root for every public page), so `(payload)` provides its own
 * `<html>`/`<body>` via Payload's `RootLayout`, exactly like Payload's own
 * Next.js templates do. Purely English/German admin chrome, not localized
 * with `next-intl` — this route sits outside `[locale]` on purpose so
 * `/admin` never gets a locale prefix.
 */
type Args = {
  children: React.ReactNode;
};

const serverFunction: ServerFunctionClient = async function (args) {
  'use server';
  return handleServerFunctions({ ...args, config, importMap });
};

const Layout = ({ children }: Args) => (
  <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
    {children}
  </RootLayout>
);

export default Layout;
