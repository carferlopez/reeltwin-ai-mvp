import { createClient } from "@supabase/supabase-js";

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

async function main() {
  const supabase = createClient(
    requiredEnv("SUPABASE_URL"),
    requiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  const { data, error } = await supabase
    .from("intakes")
    .select("id, training_video_bucket, training_video_path")
    .lte("purge_after", new Date().toISOString())
    .not("training_video_path", "is", null);

  if (error) {
    throw error;
  }

  for (const intake of data ?? []) {
    const { error: removeError } = await supabase.storage
      .from(intake.training_video_bucket)
      .remove([intake.training_video_path]);

    if (removeError) {
      console.error(`Failed to purge ${intake.id}: ${removeError.message}`);
      continue;
    }

    const { error: updateError } = await supabase
      .from("intakes")
      .update({
        training_video_path: null,
        status: "training_video_purged"
      })
      .eq("id", intake.id);

    if (updateError) {
      console.error(`Failed to mark ${intake.id}: ${updateError.message}`);
    }
  }

  console.log(`Purge complete. Checked ${data?.length ?? 0} intake records.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
