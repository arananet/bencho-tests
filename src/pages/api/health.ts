import type { APIRoute } from 'astro';
import { version } from '../../../package.json';
import { healthPayload } from '../../lib/health';

export const GET: APIRoute = () =>
  new Response(JSON.stringify(healthPayload(version, process.uptime())), {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
