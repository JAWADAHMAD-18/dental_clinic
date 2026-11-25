import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().optional(),
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  GROQ_API_KEY: z.string().optional(),
  EMBEDDING_API_KEY: z.string().optional(),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  DEMO_INBOX_EMAIL: z.string().email().optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional().default("http://localhost:3000"),
});

export type Env = z.infer<typeof envSchema>;

export const env: Env = new Proxy({} as Env, {
  get(_target, prop: string) {
    envSchema.safeParse(process.env);
    return process.env[prop];
  },
});
