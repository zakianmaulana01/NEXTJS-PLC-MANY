"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Cable, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/shared/theme-toggle';

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(true);
  
  // Auto-expand if on non-home routes (optional preference)
  useEffect(() => {
    if (pathname !== '/') {
      const timer = setTimeout(() => setCollapsed(false), 0);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  return (
    <div className={`flex flex-col border-r bg-background transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
      <div className="h-14 flex items-center justify-between px-3 border-b">
        {!collapsed && <span className="font-bold text-sm font-mono tracking-tight whitespace-nowrap overflow-hidden">SCADA SYS</span>}
        <Button variant="ghost" size="icon" className="h-8 w-8 ml-auto" onClick={() => setCollapsed(!collapsed)}>
          <Menu className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex-1 py-4 flex flex-col gap-2 px-2">
        <Link href="/">
          <Button variant={pathname === '/' ? 'secondary' : 'ghost'} className={`w-full justify-start ${collapsed ? 'px-2' : 'px-4'}`}>
            <LayoutDashboard className={`h-4 w-4 ${collapsed ? 'mx-auto' : 'mr-2'}`} />
            {!collapsed && <span>Dashboard</span>}
          </Button>
        </Link>
        <Link href="/compressed-air">
          <Button variant={pathname === '/compressed-air' ? 'secondary' : 'ghost'} className={`w-full justify-start ${collapsed ? 'px-2' : 'px-4'}`}>
            <Cable className={`h-4 w-4 ${collapsed ? 'mx-auto' : 'mr-2'}`} />
            {!collapsed && <span>System Editor</span>}
          </Button>
        </Link>
      </div>

      <div className="p-4 border-t flex justify-center">
        <ThemeToggle />
      </div>
    </div>
  );
}
