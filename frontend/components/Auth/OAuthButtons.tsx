"use client";
export default function OAuthButtons({ getUrl }: { getUrl: (p: string) => string }) {
  return (
    <div className="space-y-2">
      <a href={getUrl('google')} className="block w-full text-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Google</a>
      <a href={getUrl('facebook')} className="block w-full text-center px-4 py-2 bg-blue-800 text-white rounded hover:bg-blue-900">Facebook</a>
      <a href={getUrl('stebby')} className="block w-full text-center px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700">Stebby</a>
    </div>
  );
}

