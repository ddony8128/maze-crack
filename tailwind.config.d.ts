declare const _default: {
    darkMode: string[];
    content: string[];
    theme: {
        container: {
            center: boolean;
            padding: string;
            screens: {
                '2xl': string;
            };
        };
        extend: {
            fontFamily: {
                display: string[];
                mono: string[];
            };
            colors: {
                border: string;
                input: string;
                ring: string;
                background: string;
                foreground: string;
                primary: {
                    DEFAULT: string;
                    foreground: string;
                };
                secondary: {
                    DEFAULT: string;
                    foreground: string;
                };
                muted: {
                    DEFAULT: string;
                    foreground: string;
                };
                accent: {
                    DEFAULT: string;
                    foreground: string;
                };
                card: {
                    DEFAULT: string;
                    foreground: string;
                };
                popover: {
                    DEFAULT: string;
                    foreground: string;
                };
                destructive: {
                    DEFAULT: string;
                    foreground: string;
                };
                sidebar: {
                    DEFAULT: string;
                    foreground: string;
                    primary: string;
                    'primary-foreground': string;
                    accent: string;
                    'accent-foreground': string;
                    border: string;
                    ring: string;
                };
            };
            borderRadius: {
                lg: string;
                md: string;
                sm: string;
            };
        };
    };
    plugins: {
        handler: () => void;
    }[];
};
export default _default;
