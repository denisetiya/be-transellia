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

export type iGetUsers = z.infer<typeof getUsersSchema>;