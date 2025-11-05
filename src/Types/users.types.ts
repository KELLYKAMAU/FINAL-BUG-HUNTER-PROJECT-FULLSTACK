export interface User {
    userid: number;
    first_name: string;
    last_name: string;
    email: string;
    role_user: string;
    password_hash: string;
}

export interface NewUser {
    first_name: string;
    last_name: string;
    email: string;
    role_user: string;
    password_hash: string;
    created_at: Date;
}

// update user type
export interface UpdateUser {
    first_name?: string;
    last_name?: string;
    email?: string;
    role_user?: string;
    password_hash?: string;
}

