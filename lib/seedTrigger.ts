import postgres from "postgres";
import "dotenv/config";

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  throw new Error("Couldn't find db url");
}
const sql = postgres(dbUrl);

async function main() {
  // Create function to handle new users in `auth.users`
  await sql`
    create or replace function public.handle_new_user()
    returns trigger as $$
    begin
      insert into user_schema.user_table (user_id, user_email,user_step)
      values (
        new.id,
        new.email,
        'REGISTRATION'
      );
      return new;
    end;
    $$ language plpgsql security definer;
  `;

  await sql`
    create or replace trigger on_auth_user_created
      after insert on auth.users
      for each row execute procedure public.handle_new_user();
  `;

  // Create function to handle user deletions
  await sql`
    create or replace function public.handle_user_delete()
    returns trigger as $$
    begin
      delete from user_schema.user_table where user_id = old.id;
      return old;
    end;
    $$ language plpgsql security definer;
  `;

  // Trigger for user deletions in `auth.users`
  await sql`
    create or replace trigger on_auth_user_deleted
      after delete on auth.users
      for each row execute procedure user_schema.handle_user_delete();
  `;

  console.log("Finished adding triggers and functions for user handling.");
  process.exit();
}

main();
