type Trainer = { slug: string; name: string; avatar: string | null; videosCount: number; videoViews: number };

export default async function TrainerPage({ params }: { params: { slug: string } }) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/trainers/${params.slug}`, { cache: 'no-store' });
  if (!res.ok) return <div className="text-sm text-gray-500">Treenerit ei leitud</div>;
  const data = (await res.json()) as { trainer: Trainer };
  const t = data.trainer;
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-card border border-gray-200 p-6 flex items-center gap-4">
        <img src={t.avatar || 'https://via.placeholder.com/96'} alt={t.name} className="h-24 w-24 rounded-full object-cover" />
        <div>
          <h1 className="text-2xl font-semibold">{t.name}</h1>
          <div className="text-sm text-gray-500">Videoid: {t.videosCount} · Vaatamised: {t.videoViews.toLocaleString('et-EE')}</div>
        </div>
      </div>
      <div className="text-sm text-gray-500">Treeneri kanal ja videod tulevad peagi siia.</div>
    </div>
  );
}

