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
  const count = Math.floor(Math.random() * 5) + 1;
  return shuffled.slice(0, count);
};

const generateHost = (index: number) => {
  return {
    email: `host${index}@example.com`,
    fullName: `Host ${index}`,
    password: bcrypt.hashSync("Pass@135", 10),
    phoneNumber: `+1234567${String(index + 200).padStart(3, "0")}`,
    address: `${index} Host Avenue, City ${index}`,
    bio: `I am host number ${index} and I love organizing amazing events!`,
    interests: getRandomInterests(),
    role: UserRole.HOST,
    isEmailVerified: true,
  };
};

export const seedHosts = async () => {
  try {
    console.log("Starting to seed 20 hosts...");

    const hosts = [];
    for (let i = 1; i <= 20; i++) {
      hosts.push(generateHost(i));
    }

    await prisma.user.createMany({
      data: hosts,
      skipDuplicates: true,
    });

    console.log("Successfully seeded 20 hosts!");
  } catch (error) {
    console.error("Error seeding hosts:", error);
  } finally {
    await prisma.$disconnect();
  }
};

if (require.main === module) {
  seedHosts();
}
