import { AuthProvider as OidcProvider } from "react-oidc-context";

const getOidcConfig = () => {
    const hostname = window.location.hostname;
    const origin = window.location.origin;

    return {
        authority: `https://${hostname}:5180/realms/erm-platform`,
        client_id: "erm-web-portal",
        redirect_uri: `${origin}/`,
        post_logout_redirect_uri: `${origin}/`,
        scope: "openid profile email",
        loadUserInfo: true,
        monitorSession: false,
        onSigninCallback: () => {
            const newUrl = window.location.href.split("?")[0];
            window.history.replaceState({}, document.title, newUrl);
        },
    };
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const config = getOidcConfig();

    // Self-healing: Clear OIDC storage if we get into a redirect loop/error state
    if (typeof window !== 'undefined' && window.location.search.includes('error=')) {
        console.warn("Auth Error detected in URL, clearing storage...");
        localStorage.clear();
        sessionStorage.clear();
    }

    console.log("OIDC Initialization Parameters (Runtime):", config);

    return (
        <OidcProvider {...config}>
            {children}
        </OidcProvider>
    );
}
