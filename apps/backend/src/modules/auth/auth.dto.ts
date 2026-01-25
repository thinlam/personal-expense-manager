import { z } from "zod";

export const RegisterSchema = z.object({
  name: z.string().min(2).max(60),
  email: z.string().email().max(120),
  password: z.string().min(8).max(72),
});

export type RegisterDto = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  email: z.string().email().max(120),
  password: z.string().min(1).max(72),
});

export type LoginDto = z.infer<typeof LoginSchema>;
