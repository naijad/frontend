import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined
);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({
  children,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem("ajora-theme");

    return savedTheme === "dark" ? "dark" : "light";
  });

  const isDark = theme === "dark";

  useEffect(() => {
    localStorage.setItem("ajora-theme", theme);

    const root = document.documentElement;

    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    document.body.style.backgroundColor =
      theme === "dark"
        ? "#0D0D16"
        : "#F7F7FC";

    document.body.style.color =
      theme === "dark"
        ? "#F8F8FF"
        : "#15152A";
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((currentTheme) =>
      currentTheme === "light"
        ? "dark"
        : "light"
    );
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark,
        toggleTheme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme must be used inside a ThemeProvider"
    );
  }

  return context;
}