import { ConvexClient } from "convex/browser";

const url = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!url) {
  console.error("Missing NEXT_PUBLIC_CONVEX_URL in .env.local");
  process.exit(1);
}

const client = new ConvexClient(url);

async function seed() {
  const users = [
    { email: "ambassador@xolaceinc.com", password: "Password123", role: "ambassador" },
    { email: "admin@xolaceinc.com", password: "Password123", role: "admin" }
  ];

  for (const u of users) {
    try {
      console.log(`Checking/Registering ${u.email}...`);
      
      // Usually auth:signIn handles signUp flow in convex-dev/auth
      const result = await client.action("auth:signIn", {
        provider: "password",
        params: {
          email: u.email,
          password: u.password,
          flow: "signUp"
        }
      });
      console.log(`Signed up: ${u.email}`);
    } catch (e: any) {
       console.log(`User ${u.email} might already exist or signup failed:`, e.message);
    }
    
    // Assign role via mutation
    const updated = await client.mutation("seedRole:assignRole", { email: u.email, role: u.role });
    if (updated) {
       console.log(`Assigned role '${u.role}' to ${u.email}`);
    } else {
       console.log(`Failed to assign role. Could not find user ${u.email}`);
    }
  }
}

seed().then(() => {
  console.log("Seeding complete.");
  process.exit(0);
});
