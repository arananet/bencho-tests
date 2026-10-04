import { spawn, execFileSync, type ChildProcess } from 'node:child_process';
import { createServer } from 'node:net';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import pkg from '../../package.json';

const root = new URL('../../', import.meta.url).pathname;
let server: ChildProcess;
let base: string;

const freePort = () =>
  new Promise<number>((resolve, reject) => {
    const probe = createServer().listen(0, '127.0.0.1', () => {
      const address = probe.address();
      probe.close(() => (typeof address === 'object' && address ? resolve(address.port) : reject(new Error('no port'))));
    });
  });

async function waitForServer(url: string, timeoutMs = 20_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      if ((await fetch(url)).ok) return;
    } catch {
      // not listening yet
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error(`server did not start at ${url}`);
}

beforeAll(async () => {
  // Vitest exports NODE_ENV, MODE, DEV and PROD into process.env; build the way production does.
  const env = Object.fromEntries(
    Object.entries(process.env).filter(([key]) => !['MODE', 'DEV', 'PROD', 'SSR', 'BASE_URL'].includes(key)),
  );
  execFileSync('npx', ['astro', 'build'], { cwd: root, stdio: 'ignore', env: { ...env, NODE_ENV: 'production' } });
  const port = await freePort();
  base = `http://127.0.0.1:${port}`;
  server = spawn('node', ['dist/server/entry.mjs'], {
    cwd: root,
    env: { ...process.env, HOST: '127.0.0.1', PORT: String(port) },
    stdio: 'ignore',
  });
  await waitForServer(`${base}/api/health`);
});

afterAll(() => {
  server?.kill();
});

describe('built server', () => {
  it('serves the home page with hub, projects, terminal and ko-fi', async () => {
    const response = await fetch(`${base}/`);
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('text/html');
    const html = await response.text();
    expect(html).toContain('Eduardo Arana');
    expect(html).toContain('id="projects"');
    expect(html).toContain('data-terminal');
    expect(html).toContain('https://ko-fi.com/H2H51MPWG');
    expect(html).toContain('href="https://bencho.dev/"');
  });

  it('reports health as JSON', async () => {
    const response = await fetch(`${base}/api/health`);
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('application/json');
    const body = await response.json();
    expect(body).toMatchObject({ status: 'ok', version: pkg.version });
    expect(Number.isInteger(body.uptime)).toBe(true);
  });

  it('renders the spec wall from the repository specs', async () => {
    const response = await fetch(`${base}/lab/specs`);
    expect(response.status).toBe(200);
    const html = await response.text();
    expect(html).toContain('arananet site foundation');
    expect(html).toMatch(/\d+ acceptance criteria/);
  });

  it('returns a 404 page with a link home', async () => {
    const response = await fetch(`${base}/definitely-not-here`);
    expect(response.status).toBe(404);
    expect(await response.text()).toContain('href="/"');
  });

  it('sends security headers on HTML responses', async () => {
    for (const path of ['/', '/lab/specs', '/definitely-not-here']) {
      const { headers } = await fetch(`${base}${path}`);
      expect(headers.get('content-security-policy')).toContain("default-src 'self'");
      expect(headers.get('x-content-type-options')).toBe('nosniff');
      expect(headers.get('referrer-policy')).toBe('strict-origin-when-cross-origin');
      expect(headers.get('x-frame-options')).toBe('DENY');
    }
  });

  it('keeps every script and stylesheet external so the CSP holds', async () => {
    const html = await (await fetch(`${base}/`)).text();
    expect(html).not.toMatch(/<script(?![^>]*\bsrc=)[^>]*>/);
    expect(html).not.toMatch(/<style[\s>]/);
  });
});
