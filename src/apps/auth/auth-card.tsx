import { ReactNode } from 'react'
import { AuroraText } from '@/components/ui/aurora-text'

interface AuthCardProps {
  title: string
  description?: string
  children: ReactNode
}

// Right-column content for the simple auth pages (sign-in, start shift).
// The split-screen shell and background live in AuthLayout.
export function AuthCard({ title, description, children }: AuthCardProps) {
  return (
    <main className='flex flex-1 items-center justify-center px-6 py-12 sm:px-10'>
      <div className='w-full max-w-md space-y-6'>
        <div className='flex flex-col'>
          <AuroraText className='text-3xl font-bold'>{title}</AuroraText>
          {description && <p className='text-muted-foreground text-sm'>{description}</p>}
        </div>
        {children}
      </div>
    </main>
  )
}