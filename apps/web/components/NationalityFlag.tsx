import Image from "next/image";

const NATIONALITY_TO_CODE: Record<string, string> = {
  "British": "gb",
  "Dutch": "nl",
  "Monegasque": "mc",
  "Spanish": "es",
  "Mexican": "mx",
  "Australian": "au",
  "German": "de",
  "French": "fr",
  "Japanese": "jp",
  "Canadian": "ca",
  "Thai": "th",
  "Danish": "dk",
  "Finnish": "fi",
  "Chinese": "cn",
  "American": "us",
  "Brazilian": "br",
  "Argentine": "ar",
  "Italian": "it",
};

export default function NationalityFlag({ 
  nationality, 
  className = "" 
}: { 
  nationality: string | undefined; 
  className?: string 
}) {
  if (!nationality) return null;

  const code = NATIONALITY_TO_CODE[nationality];
  if (!code) return <span className={className}>{nationality}</span>;

  return (
    <div className={`relative w-6 h-4 overflow-hidden rounded-sm border border-white/10 ${className}`}>
      <Image
        src={`https://flagcdn.com/w80/${code}.png`}
        alt={nationality}
        fill
        className="object-cover"
      />
    </div>
  );
}
