import { AuthProvider as OidcProvider } from "react-oidc-context";

const oidcConfig = {
    authority: "http://localhost:8080/realms/erm-platform",
    client_id: "erm-web-portal",
    redirect_uri: "http://localhost:5180/",
    post_logout_redirect_uri: "http://localhost:5180/",
    onSigninCallback: () => {
        const newUrl = window.location.href.split("?")[0];
        window.history.replaceState({}, document.title, newUrl);
    },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
    return <OidcProvider {...oidcConfig}>{children}</OidcProvider>;
}
