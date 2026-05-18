import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// Make sure these are set in your .env file
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("❌ ERROR: Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_KEY in .env");
  console.error("Please add SUPABASE_SERVICE_KEY to your .env file and try again.");
  process.exit(1);
}

// Initialize Supabase with the SERVICE ROLE KEY (Bypasses all security rules)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function migrate() {
  console.log("🚀 Starting Employee Authentication Migration...\n");

  // 1. Fetch all old profiles that have plain-text passwords
  const { data: oldProfiles, error: fetchErr } = await supabase
    .from('profiles')
    .select('*');

  if (fetchErr) {
    console.error("❌ Error fetching profiles:", fetchErr.message);
    return;
  }

  const profilesToMigrate = oldProfiles.filter(p => p.password);
  console.log(`Found ${profilesToMigrate.length} profiles to migrate.\n`);

  for (const old of profilesToMigrate) {
    console.log(`Migrating user: ${old.email} (Role: ${old.role})...`);

    // 2. Temporarily change the old email in the database to prevent UNIQUE constraint errors
    // just in case your Supabase is set up to auto-create profiles for new auth users.
    const tempEmail = `migrated_${Date.now()}_${old.email}`;
    await supabase.from('profiles').update({ email: tempEmail }).eq('id', old.id);

    // 3. Create the real, secure Supabase Auth User
    const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
      email: old.email,
      password: old.password, // This will be securely hashed automatically!
      email_confirm: true,
      user_metadata: { full_name: old.full_name }
    });

    if (authErr) {
      console.error(`❌ Failed to create auth user for ${old.email}:`, authErr.message);
      // Revert the email back if it failed
      await supabase.from('profiles').update({ email: old.email }).eq('id', old.id);
      continue;
    }

    const newAuthId = authData.user.id;
    console.log(`  ✅ Secure Auth account created.`);

    // 4. Handle the Profile row
    // Check if Supabase automatically created a new profile row via a trigger
    const { data: newProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', newAuthId)
      .single();

    if (newProfile) {
      // Trigger exists! Update the auto-created profile with the old roles & name
      await supabase.from('profiles').update({
        full_name: old.full_name,
        role: old.role,
        password: null // Ensure no plain text password carries over
      }).eq('id', newAuthId);
    } else {
      // No trigger exists. Create the profile row manually
      await supabase.from('profiles').insert({
        id: newAuthId,
        email: old.email,
        full_name: old.full_name,
        role: old.role
      });
    }
    console.log(`  ✅ Profile data restored.`);

    // 5. Re-link foreign keys (Transfer tasks to the new ID)
    await supabase.from('tasks').update({ assigned_to: newAuthId }).eq('assigned_to', old.id);
    await supabase.from('tasks').update({ created_by: newAuthId }).eq('created_by', old.id);
    console.log(`  ✅ Tasks safely transferred.`);

    // 6. Delete the old "ghost" profile
    const { error: delErr } = await supabase.from('profiles').delete().eq('id', old.id);
    if (delErr) {
      console.error(`  ⚠️ Could not delete old profile ${old.id}:`, delErr.message);
    } else {
      console.log(`  ✅ Old profile cleaned up.`);
    }

    console.log(`----------------------------------------`);
  }

  console.log("\n🎉 Migration Complete! All employees are now securely stored in Supabase.");
  console.log("They can now log in with their exact same email and password.");
}

migrate();
