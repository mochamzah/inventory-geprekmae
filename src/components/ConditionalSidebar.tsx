"use client";

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';

export default function ConditionalSidebar({ mobile }: { mobile?: boolean }) {
  const pathname = usePathname();
  // Do not show sidebar on login page
  if (pathname === '/login') return null;
  return <Sidebar mobile={mobile} />;
}
