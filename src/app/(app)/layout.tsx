"use client";

import { LogoutOutlined, TeamOutlined } from "@ant-design/icons";
import { Button, Popover, Tag } from "antd";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useConfirm } from "@/components/ConfirmDialog";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Spinner } from "@/components/ui";
import { logout } from "@/store/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

const NAV = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: <path d="M4 4h7v7H4zM13 4h7v4h-7zM13 11h7v9h-7zM4 13h7v7H4z" />,
  },
  {
    href: "/customers",
    label: "Customers",
    icon: (
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0 .01M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    ),
  },
  {
    href: "/interactions",
    label: "Interactions",
    icon: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
  },
  {
    href: "/users",
    label: "Users",
    adminOnly: true,
    icon: (
      <>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
  },
];

function NavIcon({ children }: { children: React.ReactNode }) {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { user, status } = useAppSelector((s) => s.auth);
  const confirm = useConfirm();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  if (status === "idle" || status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner label="Loading your workspace…" />
      </div>
    );
  }
  if (!user) return null;

  async function handleLogout() {
    const ok = await confirm({
      title: "Log out",
      message: "Are you sure you want to log out of your workspace?",
      confirmLabel: "Log out",
      danger: true,
    });
    if (!ok) return;
    await dispatch(logout());
    router.replace("/login");
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="mb-6 flex items-center gap-2 px-1">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-base text-white">
          <TeamOutlined />
        </div>
        <span className="text-base font-bold text-slate-800 dark:text-slate-100">CS Platform</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV.filter((item) => !item.adminOnly || user.role === "admin").map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                active
                  ? "bg-brand-50 text-brand-700 dark:bg-brand-600/20 dark:text-brand-300"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
              }`}
            >
              <NavIcon>{item.icon}</NavIcon>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-800">
        <Popover
          trigger="click"
          placement="topLeft"
          content={
            <div className="w-60">
              <div className="flex items-center gap-3 pb-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-100 text-base font-semibold text-brand-700 dark:bg-brand-600/30 dark:text-brand-200">
                  {initials(user.name)}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium">{user.name}</p>
                  <p className="truncate text-xs text-slate-500">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 py-2 text-xs text-slate-500 dark:border-slate-800">
                <span>Role</span>
                <Tag color={user.role === "admin" ? "purple" : user.role === "manager" ? "blue" : "default"}>
                  {user.role.toUpperCase()}
                </Tag>
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 py-2 text-xs text-slate-500 dark:border-slate-800">
                <span>Member since</span>
                <span>{new Date(user.created_at).toLocaleDateString()}</span>
              </div>
              <div className="mt-2">
                <Button block size="small" danger icon={<LogoutOutlined />} onClick={handleLogout}>
                  Log out
                </Button>
              </div>
            </div>
          }
        >
          <button className="flex w-full items-center gap-3 rounded-lg px-1 py-1.5 text-left transition hover:bg-slate-100 dark:hover:bg-slate-800">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700 dark:bg-brand-600/30 dark:text-brand-200">
              {initials(user.name)}
            </div>
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <p className="truncate text-sm font-medium">{user.name}</p>
              <span className="badge shrink-0 bg-brand-50 text-brand-700 dark:bg-brand-600/20 dark:text-brand-300">
                {user.role.toUpperCase()}
              </span>
            </div>
          </button>
        </Popover>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 md:block">
        {sidebar}
      </aside>

      {/* Mobile drawer */}
      <div className={`fixed inset-0 z-40 md:hidden ${drawerOpen ? "" : "pointer-events-none"}`}>
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity ${drawerOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setDrawerOpen(false)}
        />
        <aside
          className={`absolute left-0 top-0 h-full w-64 border-r border-slate-200 bg-white p-4 shadow-xl transition-transform duration-200 dark:border-slate-800 dark:bg-slate-900 ${
            drawerOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {sidebar}
        </aside>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200 bg-white/80 px-4 py-2.5 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
          <button
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 md:hidden"
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-bold text-brand-700 dark:text-brand-300 md:hidden">CS Platform</span>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
