import { AuthProvider as OidcProvider } from "react-oidc-context";

const getOidcConfig = () => {
    const hostname = window.location.hostname;
    const origin = window.location.origin;

    return {
        authority: `http://${hostname}:8080/realms/erm-platform`,
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
    console.log("OIDC Initialization Parameters (Runtime):", config);

    return (
        <OidcProvider {...config}>
            {children}
        </OidcProvider>
    );
}
