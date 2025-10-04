import z from "zod";

// For pagination
export const getUsersSchema = z.object({
    page: z.string().optional().transform(val => val ? parseInt(val) : 1),
    limit: z.string().optional().transform(val => val ? parseInt(val) : 10)
}).refine(data => data.page >= 1, {
    message: "Parameter 'page' harus berupa angka positif",
    path: ["page"]
}).refine(data => data.limit >= 1 && data.limit <= 100, {
    message: "Parameter 'limit' harus berupa angka antara 1 dan 100",
    path: ["limit"]
});

// For getting user by ID
export const getUserByIdSchema = z.object({
    id: z.string().min(1, "ID pengguna wajib diisi")
});

// For creating user
export const createUserSchema = z.object({
    email: z.string().email("Format email tidak valid"),
    password: z.string().min(6, "Password minimal harus 6 karakter"),
    role: z.enum(["user", "ADMIN"]).default("user"),
    isEmployee: z.boolean().default(false),
    userDetails: z.object({
        name: z.string().min(1, "Nama lengkap wajib diisi"),
        phoneNumber: z.string().optional(),
        address: z.string().optional()
    }).optional()
});

// For updating user
export const updateUserSchema = z.object({
    email: z.string().email("Format email tidak valid").optional(),
    role: z.enum(["user", "ADMIN"]).optional(),
    isEmployee: z.boolean().optional(),
    subscriptionId: z.string().nullable().optional(),
    userDetails: z.object({
        name: z.string().min(1, "Nama lengkap wajib diisi").optional(),
        phoneNumber: z.string().optional(),
        address: z.string().optional()
    }).optional()
});

// For updating user subscription
export const updateUserSubscriptionSchema = z.object({
    subscriptionId: z.string().nullable()
});

export type iGetUsers = z.infer<typeof getUsersSchema>;
export type iGetUserById = z.infer<typeof getUserByIdSchema>;
export type iCreateUser = z.infer<typeof createUserSchema>;
export type iUpdateUser = z.infer<typeof updateUserSchema>;
export type iUpdateUserSubscription = z.infer<typeof updateUserSubscriptionSchema>;