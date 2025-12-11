import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const interests = [
  "Music",
  "Sports",
  "Hiking",
  "Photography",
  "Painting",
  "Cycling",
  "Programming",
  "Travel",
  "Gaming",
  "Technology",
  "Art",
  "Food",
  "Wellness",
  "Yoga",
  "Reading",
  "Movies",
  "Dancing",
  "Cooking",
  "Fitness",
  "Nature",
  "Networking",
  "Meditation",
  "Coffee",
  "Theater",
  "Comedy",
  "Volunteering",
];

const getRandomInterests = () => {
  const shuffled = interests.sort(() => 0.5 - Math.random());
  const count = Math.floor(Math.random() * 5) + 1; // 1-5 interests
  return shuffled.slice(0, count);
};

const generateUser = (index: number) => {
  return {
    email: `user${index}@example.com`,
    fullName: `User ${index}`,
    password: bcrypt.hashSync("Pass@135", 10),
    phoneNumber: `+1234567${String(index).padStart(3, "0")}`,
    address: `${index} Main Street, City ${index}`,
    bio: `I am user number ${index} and I love participating in events!`,
    interests: getRandomInterests(),
    role: UserRole.USER,
    isEmailVerified: true,
  };
};

export const seedUsers = async () => {
  try {
    console.log("Starting to seed 100 users...");

    const users = [];
    for (let i = 1; i <= 100; i++) {
      users.push(generateUser(i));
    }

    await prisma.user.createMany({
      data: users,
      skipDuplicates: true,
    });

    console.log("Successfully seeded 100 users!");
  } catch (error) {
    console.error("Error seeding users:", error);
  } finally {
    await prisma.$disconnect();
  }
};

// Run if called directly
if (require.main === module) {
  seedUsers();
}
