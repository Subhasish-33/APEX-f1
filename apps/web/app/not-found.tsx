import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <div className="text-f1-red font-black text-9xl mb-4 opacity-20">404</div>
      <h2 className="text-3xl font-bold mb-2 -mt-12">Off Track</h2>
      <p className="text-gray-400 mb-8 text-center max-w-md">
        You've wandered into the gravel trap. The page you're looking for doesn't exist in our database.
      </p>
      <Link
        href="/"
        className="bg-f1-red text-white px-8 py-3 rounded-sm font-bold uppercase tracking-wider hover:bg-red-700 transition-colors"
      >
        Return to Track
      </Link>
    </div>
  );
}
