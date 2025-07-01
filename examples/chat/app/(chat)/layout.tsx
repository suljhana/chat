import { cookies } from 'next/headers';

import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { auth } from '../(auth)/auth';
import Script from 'next/script';
import { SessionProvider } from '@/components/session-provider';
import { SignedOutHeader } from '@/components/signed-out-header';

export const experimental_ppr = true;

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, cookieStore] = await Promise.all([auth(), cookies()]);
  const isCollapsed = cookieStore.get('sidebar:state')?.value !== 'true';
  const isSignedIn = !!session?.user;

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js"
        strategy="beforeInteractive"
      />
      <SessionProvider>
        <SidebarProvider defaultOpen={!isCollapsed}>
          {isSignedIn ? (
            <>
              <AppSidebar user={session.user} />
              <SidebarInset>{children}</SidebarInset>
            </>
          ) : (
            <div className="flex flex-col min-h-svh w-full">
              <SignedOutHeader />
              <main className="flex-1">{children}</main>
            </div>
          )}
        </SidebarProvider>
      </SessionProvider>
    </>
  );
}
