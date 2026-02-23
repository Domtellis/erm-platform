import { AuthProvider as OidcProvider } from "react-oidc-context";

const origin = window.location.origin;
const hostname = window.location.hostname;

// Use 'erm.prod' if present, otherwise fallback to current hostname
const authDomain = hostname === 'erm.prod' ? 'erm.prod' : hostname;

const oidcConfig = {
    authority: `http://${authDomain}:8080/realms/erm-platform`,
    client_id: "erm-web-portal",
    redirect_uri: `${origin}/`,
    post_logout_redirect_uri: `${origin}/`,
    onSigninCallback: () => {
        const newUrl = window.location.href.split("?")[0];
        window.history.replaceState({}, document.title, newUrl);
    },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
    return <OidcProvider {...oidcConfig}>{children}</OidcProvider>;
}
