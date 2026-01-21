import { db } from "./drizzle";
import { usersTable } from "./schema";

const names = [
  "Aarav", "Vihaan", "Ishaan", "Ananya", "Aditi",
  "Rohan", "Kunal", "Neha", "Pooja", "Rahul"
];

function randomAge() {
  return Math.floor(Math.random() * 30) + 18; // 18–47
}

function randomEmail(name: string, index: number) {
  return `${name.toLowerCase()}${index}@example.com`;
}

export async function seed() {
  console.log("🌱 Seeding DATABASE...");

  const users = Array.from({ length: 10 }).map((_, i) => {
    const name = names[Math.floor(Math.random() * names.length)];

    return {
      name,
      age: randomAge(),
      email: randomEmail(name, i),
    };
  });

  await db.insert(usersTable).values(users);

  console.log("✅ Database seeded successfully");
}

seed();