import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { loadSpecs, parseSpec } from '../../src/lib/specs';

const spec = (title: string, status = 'review') => `title: ${title}
type: feature
status: ${status}
description: |
  Does a thing.
acceptance_criteria:
  - "first"
  - "second"
test_plan:
  - "unit"
`;

let dir: string | undefined;
afterEach(async () => {
  if (dir) await rm(dir, { recursive: true, force: true });
  dir = undefined;
});

describe('parseSpec', () => {
  it('summarizes a valid spec', () => {
    expect(parseSpec('alpha', spec('Alpha'))).toEqual({
      slug: 'alpha',
      title: 'Alpha',
      type: 'feature',
      status: 'review',
      description: 'Does a thing.',
      criteria: ['first', 'second'],
      tests: 1,
    });
  });

  it('rejects malformed YAML and specs without a title', () => {
    expect(parseSpec('bad', 'title: [unclosed')).toBeNull();
    expect(parseSpec('untitled', 'status: draft')).toBeNull();
    expect(parseSpec('scalar', 'just text')).toBeNull();
  });
});

describe('loadSpecs', () => {
  it('loads spec files sorted by title and skips broken or unrelated files', async () => {
    dir = await mkdtemp(path.join(tmpdir(), 'specs-'));
    await writeFile(path.join(dir, 'zeta.spec.yaml'), spec('Zeta', 'draft'));
    await writeFile(path.join(dir, 'alpha.spec.yaml'), spec('Alpha'));
    await writeFile(path.join(dir, 'broken.spec.yaml'), 'title: [unclosed');
    await writeFile(path.join(dir, 'notes.yaml'), spec('Not a spec'));

    const specs = await loadSpecs(dir);
    expect(specs.map((item) => item.slug)).toEqual(['alpha', 'zeta']);
    expect(specs[1].status).toBe('draft');
  });

  it('returns an empty list when the directory is missing', async () => {
    expect(await loadSpecs(path.join(tmpdir(), 'does-not-exist-specs'))).toEqual([]);
  });

  it('reads this repository\'s own specs', async () => {
    const specs = await loadSpecs();
    expect(specs.some((item) => item.slug === 'arananet-site-foundation')).toBe(true);
  });
});
