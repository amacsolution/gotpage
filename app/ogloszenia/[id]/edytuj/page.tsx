import { Suspense } from "react"
import { EditAdClient } from "@/components/edit-client"
import { Skeleton } from "@/components/ui/skeleton"

export default function EditAdPage({ params }: { params: { id: string } }) {
  return (
    <Suspense
      fallback={
        <div className="container py-8">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-[600px] w-full" />
        </div>
      }
    >
      <EditAdClient id={params.id} />
    </Suspense>
  )
}

