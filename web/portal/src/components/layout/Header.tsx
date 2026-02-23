import { Bell, User, LogOut, LogIn } from 'lucide-react';
import { useAuth } from 'react-oidc-context';

export function Header() {
    const auth = useAuth();

    console.log("Auth State:", {
        isLoading: auth.isLoading,
        isAuthenticated: auth.isAuthenticated,
        error: auth.error?.message
    });

    return (
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-8">
            <div className="flex items-center space-x-4">
                <h2 className="text-lg font-semibold text-slate-800">Overview</h2>
            </div>

            <div className="flex items-center space-x-6">
                <button className="text-slate-400 hover:text-slate-600 transition-colors">
                    <Bell className="h-5 w-5" />
                </button>

                <div className="flex items-center space-x-3 border-l border-slate-200 pl-6 text-slate-600">
                    {auth.isLoading ? (
                        <span className="text-sm animate-pulse">Authenticating...</span>
                    ) : auth.error ? (
                        <div className="flex flex-col items-end">
                            <span className="text-xs text-crm-danger font-medium">Auth Error</span>
                            <span className="text-[10px] text-crm-danger max-w-xs truncate">{auth.error?.message}</span>
                            <button
                                onClick={() => window.location.reload()}
                                className="text-[10px] underline hover:text-crm-brand"
                            >
                                Retry
                            </button>
                        </div>
                    ) : auth.isAuthenticated ? (
                        <>
                            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                                <User className="h-5 w-5 text-slate-400" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-medium">{auth.user?.profile.preferred_username || 'User'}</span>
                                <span className="text-xs text-slate-400">ERM User</span>
                            </div>
                            <button
                                onClick={() => auth.signoutRedirect()}
                                className="ml-4 p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600"
                                title="Sign Out"
                            >
                                <LogOut className="h-4 w-4" />
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => {
                                console.log("Attempting Sign In Redirect...");
                                auth.signinRedirect().catch(err => {
                                    console.error("Sign In Redirect Failed:", err);
                                });
                            }}
                            className="flex items-center text-sm font-medium hover:text-crm-brand transition-colors"
                        >
                            <LogIn className="mr-2 h-4 w-4" />
                            Sign In
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}
