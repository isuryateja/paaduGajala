import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

type VercelRedirect = {
  source: string;
  destination: string;
  permanent: boolean;
};

type VercelConfig = {
  engines?: {
    node?: string;
  };
  framework?: string;
  installCommand?: string;
  buildCommand?: string;
  redirects?: VercelRedirect[];
  rewrites?: unknown;
};

const readVercelConfig = (): VercelConfig =>
  JSON.parse(readFileSync(resolve(process.cwd(), 'vercel.json'), 'utf8')) as VercelConfig;

describe('vercel deployment config', () => {
  it('keeps the repo configured as a root-level SvelteKit deployment', () => {
    const config = readVercelConfig();
    const packageJson = JSON.parse(
      readFileSync(resolve(process.cwd(), 'package.json'), 'utf8')
    ) as { engines?: { node?: string } };

    expect(config.framework).toBe('sveltekit');
    expect(config.installCommand).toBe('npm install');
    expect(config.buildCommand).toBe('npm run build');
    expect(config).not.toHaveProperty('rewrites');
    expect(packageJson.engines?.node).toBe('20.x');
  });

  it('preserves legacy entrypoints through redirects only', () => {
    const config = readVercelConfig();

    expect(config.redirects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source: '/paadugajaala',
          destination: '/',
          permanent: true
        }),
        expect.objectContaining({
          source: '/paadugajaala/',
          destination: '/',
          permanent: true
        }),
        expect.objectContaining({
          source: '/paadugajaala/index.html',
          destination: '/',
          permanent: true
        }),
        expect.objectContaining({
          source: '/virtual_piano.html',
          destination: '/piano',
          permanent: true
        })
      ])
    );
  });
});
