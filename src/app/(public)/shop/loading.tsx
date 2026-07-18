import { Skeleton } from "@/components/ui/skeleton";

export default function ShopLoading() {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-cream border-b border-border py-8">
        <div className="container mx-auto px-4">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          <div className="hidden lg:block w-56 space-y-4">
            <Skeleton className="h-5 w-24" />
            {Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-5 w-full" />)}
          </div>
          <div className="flex-1">
            <div className="flex gap-3 mb-6">
              <Skeleton className="h-9 flex-1" />
              <Skeleton className="h-9 w-40" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="rounded-2xl border border-border overflow-hidden">
                  <Skeleton className="aspect-square" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-8 w-full mt-2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
