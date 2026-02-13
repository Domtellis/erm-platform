import { useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import axios from 'axios';

export function AxiosInterceptor({ children }: { children: React.ReactNode }) {
    const auth = useAuth();

    useEffect(() => {
        const requestInterceptor = axios.interceptors.request.use(
            (config) => {
                if (auth.user?.access_token) {
                    config.headers.Authorization = `Bearer ${auth.user.access_token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        return () => {
            axios.interceptors.request.eject(requestInterceptor);
        };
    }, [auth.user]);

    return <>{children}</>;
}
