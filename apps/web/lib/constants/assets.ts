export const DRIVER_CDN_IDS: { [key: string]: { id: string; slug: string } } = {
  'max_verstappen': { id: 'MAXVER01', slug: 'maxver' },
  'hamilton': { id: 'LEWHAM01', slug: 'lewham' },
  'leclerc': { id: 'CHALEC01', slug: 'chalec' },
  'norris': { id: 'LANDON01', slug: 'lannor' },
  'perez': { id: 'SERPER01', slug: 'serper' },
  'sainz': { id: 'CARSAI01', slug: 'carsai' },
  'russell': { id: 'GEORUS01', slug: 'georus' },
  'piastri': { id: 'OSCPIA01', slug: 'oscpia' },
  'alonso': { id: 'FERALO01', slug: 'feralo' },
  'stroll': { id: 'LANSTR01', slug: 'lanstr' },
  'albon': { id: 'ALEALB01', slug: 'alealb' },
  'gasly': { id: 'PIEGAS01', slug: 'piegas' },
  'ocon': { id: 'ESTOCO01', slug: 'estoco' },
  'hulkenberg': { id: 'NICHUL01', slug: 'nichul' },
  'kevin_magnussen': { id: 'KEVMAG01', slug: 'kevmag' },
  'tsunoda': { id: 'YUKTSU01', slug: 'yuktsu' },
  'ricciardo': { id: 'DANRIC01', slug: 'danric' },
  'bottas': { id: 'VALBOT01', slug: 'valbot' },
  'zhou': { id: 'GUAZHO01', slug: 'guazho' },
  'sargeant': { id: 'LOGSAR01', slug: 'logsar' },
};

export const TEAM_CDN_SLUGS: { [key: string]: string } = {
  'red_bull': 'red-bull-racing',
  'mercedes': 'mercedes',
  'ferrari': 'ferrari',
  'mclaren': 'mclaren',
  'aston_martin': 'aston-martin',
  'alpine': 'alpine',
  'williams': 'williams',
  'rb': 'rb',
  'sauber': 'sauber',
  'haas': 'haas',
};

export const getDriverHeadshot = (ref: string, year: number = 2026) => {
  // Prefer local WebP assets first
  if (!ref) return '/assets/drivers/_placeholder.webp';
  
  const localPath = `/assets/drivers/${ref}.webp`;
  
  // We check if the driver exists in our CDN IDs, but for local assets we just return the path
  // and let Next.js handle the fallback if the file is missing (though ideally we should verify file existence)
  return localPath;
};

export const getTeamLogo = (ref: string, year: number = 2026) => {
  const localPath = `/assets/teams/${ref}.png`;
  const slug = TEAM_CDN_SLUGS[ref];
  if (!slug) return localPath || '/images/team-placeholder.png';
  
  return localPath;
};
