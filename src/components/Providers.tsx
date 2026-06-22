"use client";

import { App as AntdApp, ConfigProvider, theme as antdTheme } from "antd";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { Provider } from "react-redux";

import { tokenStore } from "@/lib/authToken";
import { loadSession } from "@/store/authSlice";
import { store } from "@/store/store";

// --- theme mode (light/dark) ---
const ThemeContext = createContext<{ dark: boolean; toggle: () => void }>({
  dark: false,
  toggle: () => {},
});
export const useThemeMode = () => useContext(ThemeContext);

function ThemeBridge({ children }: { children: React.ReactNode }) {
  // null until initialised, so we never persist a wrong value over the saved one.
  const [dark, setDark] = useState<boolean | null>(null);

  // Initialise from the class the inline script already applied (falls back to storage/OS).
  useEffect(() => {
    if (typeof document === "undefined") return;
    const saved = localStorage.getItem("theme");
    const fromClass = document.documentElement.classList.contains("dark");
    setDark(saved ? saved === "dark" : fromClass);
  }, []);

  // Persist + reflect onto <html> only after we know the real value.
  useEffect(() => {
    if (dark === null) return;
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  const effectiveDark = dark ?? false;

  return (
    <ThemeContext.Provider
      value={{ dark: effectiveDark, toggle: () => setDark((d) => !(d ?? false)) }}
    >
      <ConfigProvider
        theme={{
          algorithm: effectiveDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
          token: effectiveDark
            ? {
                // Align antd's dark surfaces to the Tailwind slate palette so
                // inputs/selects/modals match the cards instead of clashing.
                colorPrimary: "#6366f1",
                borderRadius: 8,
                fontFamily: "inherit",
                colorBgLayout: "#020617", // slate-950 (page)
                colorBgContainer: "#0f172a", // slate-900 (cards/inputs)
                colorBgElevated: "#1e293b", // slate-800 (modals/dropdowns)
                colorBorder: "#334155", // slate-700
                colorBorderSecondary: "#1e293b",
              }
            : {
                colorPrimary: "#4f46e5",
                borderRadius: 8,
                fontFamily: "inherit",
                colorBgLayout: "#f1f5f9", // slate-100 (page)
              },
        }}
      >
        <AntdApp>{children}</AntdApp>
      </ConfigProvider>
    </ThemeContext.Provider>
  );
}

function SessionBootstrap({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  useEffect(() => {
    store.dispatch(loadSession());
    tokenStore.setOnUnauthorized(() => router.replace("/login"));
  }, [router]);
  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeBridge>
      <Provider store={store}>
        <SessionBootstrap>{children}</SessionBootstrap>
      </Provider>
    </ThemeBridge>
  );
}
