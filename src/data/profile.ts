// Site copy lives here so it can be edited without touching layout code.
// TODO(@arananet): replace the placeholder bio and project blurbs with your own words.

export interface Project {
  name: string;
  blurb: string;
  href: string;
  tags: string[];
}

export interface Link {
  label: string;
  href: string;
}

export const profile = {
  name: 'Eduardo Arana',
  handle: 'arananet',
  domain: 'arananet.net',
  tagline: 'I build things in the open and ship them with specs, tests, and a little curiosity.',
  about: [
    'This is my corner of the internet: a hub for what I am building and a lab where the experiments actually run.',
    'Everything here is spec-driven. Each feature starts as an OpenSpec file with acceptance criteria and a test plan before any code is written.',
  ],
  links: [
    { label: 'GitHub', href: 'https://github.com/arananet' },
    { label: 'Ko-fi', href: 'https://ko-fi.com/H2H51MPWG' },
  ] satisfies Link[],
  kofi: 'https://ko-fi.com/H2H51MPWG',
} as const;

export const projects: Project[] = [
  {
    name: 'benchodev',
    blurb: 'A spec-driven development framework: OpenSpec specs, git hooks, CI gates, and agent instructions that keep humans and AI agents honest.',
    href: 'https://github.com/arananet',
    tags: ['openspec', 'ruby', 'ci'],
  },
  {
    name: 'arananet.net',
    blurb: 'This site. Astro on Railway, built one spec at a time. The lab shows its own specs live.',
    href: '/lab/specs',
    tags: ['astro', 'typescript', 'railway'],
  },
];

export interface LabExperiment {
  name: string;
  blurb: string;
  href: string;
}

export const experiments: LabExperiment[] = [
  {
    name: 'Terminal',
    blurb: 'Navigate the site from a shell. Try `help`.',
    href: '/#terminal',
  },
  {
    name: 'Spec wall',
    blurb: 'The OpenSpec specs that define this site, rendered live from the repository.',
    href: '/lab/specs',
  },
  {
    name: 'Health',
    blurb: 'The JSON endpoint Railway pings to keep the site alive.',
    href: '/api/health',
  },
];
