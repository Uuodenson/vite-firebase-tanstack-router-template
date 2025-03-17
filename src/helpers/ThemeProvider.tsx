import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
    children: React.ReactNode;
    defaultTheme?: Theme;
    storageKey?: string;
};

type ThemeProviderState = {
    theme: Theme;
    setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
    theme: "system",
    setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

function ThemeProvider({
    children,
    defaultTheme = "system",
    storageKey = "vite-ui-theme",
    ...props
}: ThemeProviderProps) {
    const [mounted, setMounted] = useState(false); // Track if component has mounted
    const [theme, setTheme] = useState<Theme>(() => {
        // Get the value from storage on initial state setup.
        const storedTheme = localStorage.getItem(storageKey) as Theme | null;
        return storedTheme || defaultTheme;
    });

    useEffect(() => {
        setMounted(true); // Set mounted to true after first render
    }, []);

    useEffect(() => {
        if (!mounted) return; // Only run after mount.
        const root = window.document.documentElement;

        root.classList.remove("light", "dark");

        if (theme === "system") {
            const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
                .matches
                ? "dark"
                : "light";

            root.classList.add(systemTheme);
            localStorage.removeItem(storageKey);
        } else {
            root.classList.add(theme);
            localStorage.setItem(storageKey, theme);
        }
    }, [theme, storageKey, mounted]);

    const value = {
        theme,
        setTheme: (theme: Theme) => {
            setTheme(theme);
        },
    };

    return (
        <ThemeProviderContext.Provider {...props} value={value}>
            {children}
        </ThemeProviderContext.Provider>
    );
}

const useTheme = () => {
    const context = useContext(ThemeProviderContext);

    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }

    return context;
};

export { useTheme, ThemeProvider };
