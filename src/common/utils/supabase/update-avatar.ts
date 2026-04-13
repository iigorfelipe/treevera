import { supabase } from "./client";

const BUCKET = "avatars";
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

export const uploadAvatar = async (
  userId: string,
  file: File,
): Promise<string> => {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("File too large (max 5MB)");
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Invalid file type");
  }

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(userId, file, { upsert: true, contentType: file.type });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(userId);
  const url = `${data.publicUrl}?t=${Date.now()}`;

  const { error: updateError } = await supabase
    .from("users")
    .update({ avatar_url: url })
    .eq("id", userId);

  if (updateError) throw updateError;

  return url;
};

export const removeAvatar = async (userId: string): Promise<void> => {
  await supabase.storage.from(BUCKET).remove([userId]);

  const { error } = await supabase
    .from("users")
    .update({ avatar_url: null })
    .eq("id", userId);

  if (error) throw error;
};
