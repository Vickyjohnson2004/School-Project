import type { ReactNode } from 'react';
import { DashboardNav } from '../../components/dashboard-nav';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <DashboardNav />
      {children}
    </>
  );
}
