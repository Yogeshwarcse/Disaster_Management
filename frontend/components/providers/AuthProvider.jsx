'use client';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '../../lib/authStore';

export function AuthProvider({ children }) {
    const { user, token } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        const isAuthRoute = pathname === '/login' || pathname === '/register';

        if (!token && !isAuthRoute) {
            router.replace('/login');
        } else if (token && isAuthRoute) {
            // route based on role
            if (user?.role === 'admin') {
                router.replace('/');
            } else {
                router.replace('/volunteer-portal');
            }
        } else if (token) {
            // Protect admin routes from volunteers
            const adminOnlyRoutes = ['/centers', '/volunteers', '/dispatch', '/inventory'];
            const volunteerOnlyRoutes = ['/volunteer-portal'];

            const isAdminRoute = adminOnlyRoutes.some(route => pathname.startsWith(route)) || pathname === '/';
            const isVolunteerRoute = volunteerOnlyRoutes.some(route => pathname.startsWith(route));

            if (user?.role === 'volunteer' && isAdminRoute) {
                router.replace('/volunteer-portal');
            } else if (user?.role === 'admin' && isVolunteerRoute) {
                router.replace('/');
            }
        }
    }, [pathname, token, user, router, mounted]);

    if (!mounted) return null; // Avoid hydration mismatch

    return <>{children}</>;
}
