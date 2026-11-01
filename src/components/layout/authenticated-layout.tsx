import { Outlet } from '@tanstack/react-router'
import { Header } from './header'
import { Footer } from './footer'

type AuthenticatedLayoutProps = {
  children?: React.ReactNode
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  return (
    <>
      <div className='@container/content flex min-h-svh w-full flex-col bg-background has-data-[layout=fixed]:h-svh'>
        <Header fixed />
        {children ?? <Outlet />}
        <Footer />
      </div>
    </>
  )
}