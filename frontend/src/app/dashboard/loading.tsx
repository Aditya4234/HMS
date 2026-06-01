export default function DashboardLoading() {
  return (
    <div className="space-y-6 p-6">
      <div className="h-8 w-48 rounded-xl bg-white/[0.02] animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse" />
        ))}
      </div>
      <div className="h-80 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse" />
    </div>
  );
}
