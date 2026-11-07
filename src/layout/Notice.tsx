import type { ReactNode } from 'react'

type NoticeProps = {
  title: string
  description?: string
  children?: ReactNode
}

export function Notice({ title, description, children }: NoticeProps) {
  return (
    <main className="flex h-full items-center justify-center p-8">
      <div className="flex max-w-md flex-col items-center gap-4 text-center">
        <div>
          <h1 className="mb-2 text-lg font-medium">{title}</h1>
          {description && <p className="text-muted-foreground text-sm">{description}</p>}
        </div>
        {children}
      </div>
    </main>
  )
}
