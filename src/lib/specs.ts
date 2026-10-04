import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { parse } from 'yaml';

export interface SpecSummary {
  slug: string;
  title: string;
  type: string;
  status: string;
  description: string;
  criteria: string[];
  tests: number;
}

const asStrings = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];

export function parseSpec(slug: string, source: string): SpecSummary | null {
  try {
    const data = parse(source);
    if (!data || typeof data !== 'object' || typeof data.title !== 'string') return null;
    return {
      slug,
      title: data.title,
      type: typeof data.type === 'string' ? data.type : 'feature',
      status: typeof data.status === 'string' ? data.status : 'draft',
      description: typeof data.description === 'string' ? data.description.trim() : '',
      criteria: asStrings(data.acceptance_criteria),
      tests: asStrings(data.test_plan).length,
    };
  } catch {
    return null;
  }
}

export function specsDir(): string {
  return process.env.SPECS_DIR ?? path.join(process.cwd(), '.openspec', 'specs');
}

export async function loadSpecs(dir = specsDir()): Promise<SpecSummary[]> {
  let files: string[];
  try {
    files = await readdir(dir);
  } catch {
    return [];
  }
  const specs = await Promise.all(
    files
      .filter((file) => file.endsWith('.spec.yaml'))
      .map(async (file) => parseSpec(file.replace(/\.spec\.yaml$/, ''), await readFile(path.join(dir, file), 'utf8'))),
  );
  return specs.filter((spec): spec is SpecSummary => spec !== null).sort((a, b) => a.title.localeCompare(b.title));
}
