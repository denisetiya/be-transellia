import z from "zod";

export const loginSchema = z.object({
    email: z.string({ message: "Email wajib diisi" })
        .min(1, { message: "Email wajib diisi" })
        .email({ message: "Format email tidak valid. Contoh: user@example.com" }),
    password: z.string({ message: "Password wajib diisi" })
        .min(1, { message: "Password wajib diisi" })
        .min(6, { message: "Password minimal 6 karakter" })
        .max(100, { message: "Password maksimal 100 karakter" })
});

export type iLogin = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
    email: z.string({ message: "Email wajib diisi" })
        .min(1, { message: "Email wajib diisi" })
        .email({ message: "Format email tidak valid. Contoh: user@example.com" }),
    password: z.string({ message: "Password wajib diisi" })
        .min(1, { message: "Password wajib diisi" })
        .min(6, { message: "Password minimal 6 karakter" })
        .max(100, { message: "Password maksimal 100 karakter" }),
    name: z.string({ message: "Nama wajib diisi" })
        .min(1, { message: "Nama wajib diisi" })
        .min(2, { message: "Nama minimal 2 karakter" })
        .max(100, { message: "Nama maksimal 100 karakter" })
        .regex(/^[a-zA-Z\s]+$/, { message: "Nama hanya boleh berisi huruf dan spasi" })
});

export type iRegister = z.infer<typeof registerSchema>;


