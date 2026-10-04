export interface Health {
  status: 'ok';
  version: string;
  uptime: number;
}

export function healthPayload(version: string, uptimeSeconds: number): Health {
  return { status: 'ok', version, uptime: Math.max(0, Math.floor(uptimeSeconds)) };
}
