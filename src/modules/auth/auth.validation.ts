import z from "zod";
export const loginSchema = z.object({
    email: z.email({ message: "Format email tidak valid." }),
    password: z.string().min(6, { message: "Password minimal 6 karakter." }).max(100, { message: "Password maksimal 100 karakter." })
});

export type iLogin = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
    email: z.email({ message: "Format email tidak valid." }),
    password: z.string().min(6, { message: "Password minimal 6 karakter." }).max(100, { message: "Password maksimal 100 karakter." }),
    name: z.string().min(2, { message: "Nama minimal 2 karakter." }).max(100, { message: "Nama maksimal 100 karakter." }), 
});

export type iRegister = z.infer<typeof registerSchema>;


export interface iUser {
    id?: string;
    email?: string;
    role?: string | null;
    subscriptionType?: string | null;
    UserDetails? : {
        name: string | null;
        imageProfile?: string | null;
        phoneNumber?: string | null;
        address?: string | null;
    } | null;
    isEmployee?: boolean | null;
}