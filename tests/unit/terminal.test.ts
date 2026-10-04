import { describe, expect, it } from 'vitest';
import { commandNames, runCommand } from '../../src/lib/terminal';
import { profile, projects } from '../../src/data/profile';

describe('terminal', () => {
  it('ships exactly the commands the spec promises', () => {
    expect(commandNames.sort()).toEqual(['about', 'clear', 'contact', 'help', 'lab', 'projects', 'specs']);
  });

  it('help lists every command', () => {
    const text = runCommand('help').lines.map((line) => line.text).join('\n');
    for (const name of commandNames) expect(text).toContain(name);
  });

  it('about names the owner', () => {
    expect(runCommand('about').lines[0].text).toContain(profile.name);
  });

  it('projects links every project', () => {
    expect(runCommand('projects').lines.map((line) => line.href)).toEqual(projects.map((project) => project.href));
  });

  it('lab and specs link to the spec wall', () => {
    expect(runCommand('lab').lines.some((line) => line.href === '/lab/specs')).toBe(true);
    expect(runCommand('specs').lines).toEqual([{ text: 'open the spec wall', href: '/lab/specs' }]);
  });

  it('contact links include ko-fi', () => {
    expect(runCommand('contact').lines.map((line) => line.href)).toContain(profile.kofi);
  });

  it('clear asks the screen to clear', () => {
    expect(runCommand('clear')).toEqual({ lines: [], clear: true });
  });

  it('normalizes case and whitespace', () => {
    expect(runCommand('  HeLp  ')).toEqual(runCommand('help'));
  });

  it('reports unknown commands with a hint', () => {
    const [line] = runCommand('sudo rm -rf /').lines;
    expect(line.kind).toBe('error');
    expect(line.text).toContain('command not found');
    expect(line.text).toContain("'help'");
  });

  it('prints nothing for empty input', () => {
    expect(runCommand('   ')).toEqual({ lines: [] });
  });
});
