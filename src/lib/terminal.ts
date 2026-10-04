import { experiments, profile, projects } from '../data/profile';

export interface TerminalLine {
  text: string;
  href?: string;
  kind?: 'out' | 'error' | 'muted';
}

export interface TerminalResult {
  lines: TerminalLine[];
  clear?: boolean;
}

interface Command {
  summary: string;
  run: () => TerminalResult;
}

const commands: Record<string, Command> = {
  help: {
    summary: 'list available commands',
    run: () => ({
      lines: Object.entries(commands).map(([name, command]) => ({
        text: `${name.padEnd(10)}${command.summary}`,
      })),
    }),
  },
  about: {
    summary: `who is ${profile.handle}`,
    run: () => ({
      lines: [{ text: `${profile.name} (${profile.handle})` }, ...profile.about.map((text) => ({ text, kind: 'muted' as const }))],
    }),
  },
  projects: {
    summary: 'things I build',
    run: () => ({
      lines: projects.map((project) => ({ text: `${project.name} - ${project.blurb}`, href: project.href })),
    }),
  },
  lab: {
    summary: 'live experiments',
    run: () => ({
      lines: experiments.map((experiment) => ({ text: `${experiment.name} - ${experiment.blurb}`, href: experiment.href })),
    }),
  },
  specs: {
    summary: 'the specs behind this site',
    run: () => ({ lines: [{ text: 'open the spec wall', href: '/lab/specs' }] }),
  },
  contact: {
    summary: 'say hello',
    run: () => ({ lines: profile.links.map((link) => ({ text: link.label, href: link.href })) }),
  },
  clear: {
    summary: 'clear the screen',
    run: () => ({ lines: [], clear: true }),
  },
};

export const commandNames = Object.keys(commands);

export function runCommand(input: string): TerminalResult {
  const name = input.trim().toLowerCase();
  if (name === '') return { lines: [] };
  const command = commands[name];
  if (!command) {
    return { lines: [{ text: `command not found: ${name}. Type 'help' to see what I can do.`, kind: 'error' }] };
  }
  return command.run();
}
