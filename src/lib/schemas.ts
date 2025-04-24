import { z } from "zod";

export const wishFormSchema = z.object({
  description: z.string().min(1, "Description is required"),
  link: z.string().url("Please enter a valid URL"),
});

export type WishFormValues = z.infer<typeof wishFormSchema>;

export const signInFormSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  flow: z.enum(["signIn", "signUp"]),
});

export type SignInFormValues = z.infer<typeof signInFormSchema>;
