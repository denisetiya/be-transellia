import z from "zod";

// For creating a new subscription
export const createSubscriptionSchema = z.object({
    name: z.string({ message: "Nama subscription wajib diisi" })
        .min(1, { message: "Nama subscription wajib diisi" })
        .min(2, { message: "Nama subscription minimal 2 karakter" })
        .max(100, { message: "Nama subscription maksimal 100 karakter" }),
    price: z.number({ message: "Harga subscription wajib diisi" })
        .min(0, { message: "Harga subscription tidak boleh negatif" }),
    description: z.string({ message: "Deskripsi subscription wajib diisi" })
        .min(1, { message: "Deskripsi subscription wajib diisi" })
        .max(500, { message: "Deskripsi subscription maksimal 500 karakter" })
        .optional()
        .nullable(),
    features: z.array(z.string())
        .min(1, { message: "Minimal harus ada 1 fitur" })
        .max(20, { message: "Maksimal 20 fitur" })
});

// For updating a subscription
export const updateSubscriptionSchema = z.object({
    name: z.string({ message: "Nama subscription wajib diisi" })
        .min(1, { message: "Nama subscription wajib diisi" })
        .min(2, { message: "Nama subscription minimal 2 karakter" })
        .max(100, { message: "Nama subscription maksimal 100 karakter" })
        .optional(),
    price: z.number({ message: "Harga subscription wajib diisi" })
        .min(0, { message: "Harga subscription tidak boleh negatif" })
        .optional(),
    description: z.string({ message: "Deskripsi subscription wajib diisi" })
        .min(1, { message: "Deskripsi subscription wajib diisi" })
        .max(500, { message: "Deskripsi subscription maksimal 500 karakter" })
        .optional()
        .nullable(),
    features: z.array(z.string())
        .min(1, { message: "Minimal harus ada 1 fitur" })
        .max(20, { message: "Maksimal 20 fitur" })
        .optional()
});

// For getting a subscription by ID
export const subscriptionIdSchema = z.object({
    id: z.string({ message: "ID subscription wajib diisi" })
        .min(1, { message: "ID subscription wajib diisi" })
});

export type iCreateSubscription = z.infer<typeof createSubscriptionSchema>;
export type iUpdateSubscription = z.infer<typeof updateSubscriptionSchema>;
export type iSubscriptionId = z.infer<typeof subscriptionIdSchema>;

// For getting users by subscription ID
export const getUsersBySubscriptionIdSchema = z.object({
    subscriptionId: z.string({ message: "ID subscription wajib diisi" })
        .min(1, { message: "ID subscription wajib diisi" })
});

export type iGetUsersBySubscriptionId = z.infer<typeof getUsersBySubscriptionIdSchema>;