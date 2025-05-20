import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { PageLayout } from "@/components/page-layout"

export default function Loading() {
  return (
    <PageLayout>
      <div className="container py-6">
        <div className="relative h-40 w-full rounded-xl bg-gradient-to-r from-primary/20 to-primary/10 mb-16">
          <div className="absolute -bottom-12 left-6">
            <Skeleton className="h-24 w-24 rounded-full" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-20" />
              </div>
              <div className="flex gap-4 text-sm">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>

            <Card>
              <CardContent className="p-4 space-y-4">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            <Skeleton className="h-10 w-full mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} className="overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <CardContent className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-4" />
                    <Skeleton className="h-5 w-1/3 mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
