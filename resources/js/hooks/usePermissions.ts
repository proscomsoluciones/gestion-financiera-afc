import { Permission, PageProps } from '@/types';
import { usePage } from '@inertiajs/react';

export default function usePermissions() {
    const { auth } = usePage<PageProps>().props;
    const permissions = auth.permissions ?? [];

    const can = (permission: Permission) => permissions.includes(permission);

    return { can, roles: auth.roles ?? [] };
}
