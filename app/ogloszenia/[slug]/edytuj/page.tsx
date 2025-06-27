import { Suspense } from "react"
import { EditAdClient } from "@/components/edit-client"
import { Skeleton } from "@/components/ui/skeleton"

export default async function EditAdPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
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

