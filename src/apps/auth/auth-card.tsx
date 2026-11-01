import { ReactNode } from 'react'

interface AuthCardProps {
  title: string
  description?: string
  children: ReactNode
}

// Shared shell for the pre-app pages (sign-in, start shift).
export function AuthCard({ title, description, children }: AuthCardProps) {
  return (
    <div className='flex min-h-svh items-center justify-center p-4'>
      <div className='bg-card text-card-foreground w-full max-w-sm space-y-6 rounded-xl border p-6 shadow-sm'>
        <div className='space-y-1 text-center'>
          <h1 className='text-xl font-semibold'>{title}</h1>
          {description && <p className='text-muted-foreground text-sm'>{description}</p>}
        </div>
        {children}
      </div>
    </div>
  )
}