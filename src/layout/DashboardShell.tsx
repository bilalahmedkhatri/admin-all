"use client";

import { useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import React from "react";

export default function DashboardShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: { name: string; email: string; role: string; page_permissions: string };
}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  // Dynamic class for main content margin based on sidebar state
  const mainContentMargin = isMobileOpen
    ? "ms-0"
    : isExpanded || isHovered
      ? "xl:ms-[290px]"
      : "xl:ms-[90px]";

  return (
    <div className="min-h-screen text-gray-800 xl:flex dark:text-gray-100">
      {/* Sidebar and Backdrop */}
      <AppSidebar user={user} />
      <Backdrop />
      {/* Main Content Area */}
      <div
        className={`grid min-h-dvh min-w-0 flex-1 grid-rows-[auto_1fr] transition-all duration-300 ease-in-out ${mainContentMargin}`}
      >
        {/* Header */}
        <AppHeader user={user} />
        {/* Page Content */}
        <div className="relative mx-auto w-full max-w-(--breakpoint-2xl) p-4 md:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
