export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
}

export type Permission =
    | 'clubs.view'
    | 'clubs.manage'
    | 'transactions.view'
    | 'transactions.manage'
    | 'reports.view'
    | 'settings.manage'
    | 'users.manage';

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
        roles: string[];
        permissions: Permission[];
    };
};
