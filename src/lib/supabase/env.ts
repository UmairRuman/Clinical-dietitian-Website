export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

export const storagePublicUrl = (bucket: string, path: string) => `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;

export const supabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);
