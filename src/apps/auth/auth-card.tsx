import { ReactNode } from 'react'
import { AuroraText } from '@/components/ui/aurora-text'

interface AuthCardProps {
  title: string
  description?: string
  children: ReactNode
}

// Shared two-column shell for the pre-app pages (sign-in, start shift).
export function AuthCard({ title, description, children }: AuthCardProps) {
  return (
    <div className='relative container grid h-svh flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0'>
      <div
        className='relative hidden h-full flex-col items-center justify-center bg-cover bg-center bg-no-repeat lg:flex dark:border-r'
        style={{
          backgroundImage: "url('images/background.jpg')",
        }}
      >
        <div className='absolute inset-0' />
      </div>

      <div className='lg:p-8'>
        <div className='mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[500px]'>
          <div className='flex flex-col '>
            <AuroraText className='text-3xl font-bold'>{title}</AuroraText>
            {description && <p className='text-muted-foreground text-sm'>{description}</p>}
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}