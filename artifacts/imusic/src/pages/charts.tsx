import { AppLayout } from "@/components/layout/AppLayout";
import { useGetCharts } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Charts() {
  const { data, isLoading } = useGetCharts();

  return (
    <AppLayout>
      <div className="px-6 py-12 md:px-8 max-w-7xl mx-auto space-y-12">
        <div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-4">Top Charts</h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            The most popular songs across different languages and regions, updated daily.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[2/3] rounded-2xl w-full" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {(data?.charts ?? []).map((chart) => (
              <div key={chart.id} className="relative group overflow-hidden rounded-2xl aspect-[2/3] cursor-pointer border border-border hover:border-violet-500/50 transition-colors shadow-lg">
                <img 
                  src={chart.image} 
                  alt={chart.name} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02] saturate-[0.8] group-hover:saturate-100" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-colors" />
                
                <span className="absolute top-4 left-4 inline-block px-2 py-1 bg-black/60 backdrop-blur text-white rounded-full text-[10px] font-bold uppercase tracking-wider">
                  {chart.language}
                </span>

                <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col justify-end">
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-1 leading-tight">{chart.name}</h3>
                  <p className="text-sm text-white/70 font-medium">{chart.songCount} songs</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}