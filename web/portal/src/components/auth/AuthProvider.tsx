import { AuthProvider as OidcProvider } from "react-oidc-context";

const hostname = window.location.hostname;
const origin = window.location.origin;

// Authority must be the hostname the BROWSER uses to reach Keycloak
const authority = `http://${hostname}:8080/realms/erm-platform`;

const oidcConfig = {
    authority: authority,
    client_id: "erm-web-portal",
    redirect_uri: `${origin}/`,
    post_logout_redirect_uri: `${origin}/`,
    onSigninCallback: () => {
        const newUrl = window.location.href.split("?")[0];
        window.history.replaceState({}, document.title, newUrl);
    },
};

console.log("OIDC Config Initialized:", { authority, redirect_uri: oidcConfig.redirect_uri });

export function AuthProvider({ children }: { children: React.ReactNode }) {
    return (
        <OidcProvider {...oidcConfig}>
            {children}
        </OidcProvider>
    );
}
