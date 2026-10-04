import { describe, expect, it } from 'vitest';
import { healthPayload } from '../../src/lib/health';

describe('healthPayload', () => {
  it('reports ok with version and whole-second uptime', () => {
    expect(healthPayload('1.2.3', 42.9)).toEqual({ status: 'ok', version: '1.2.3', uptime: 42 });
  });

  it('never reports negative uptime', () => {
    expect(healthPayload('1.2.3', -5).uptime).toBe(0);
  });
});
