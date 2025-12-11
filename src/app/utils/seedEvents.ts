import { PrismaClient, EventStatus } from "@prisma/client";

const prisma = new PrismaClient();

const eventCategories = [
  "Technology",
  "Education",
  "Sports",
  "Photography",
  "Programming",
  "Music",
  "Art",
  "Food",
  "Business",
  "Health",
  "Travel",
  "Gaming",
];

const eventTitles = {
  Technology: ["Tech Conference 2025", "AI Workshop", "Blockchain Summit", "Web Dev Bootcamp"],
  Education: ["Learning Festival", "Study Group", "Academic Conference", "Skills Workshop"],
  Sports: ["Marathon Event", "Football Tournament", "Basketball League", "Tennis Championship"],
  Photography: ["Photo Walk", "Portrait Workshop", "Nature Photography", "Street Photography"],
  Programming: ["Code Hackathon", "Developer Meetup", "Programming Contest", "Tech Talk"],
  Music: ["Live Concert", "Music Festival", "Jazz Night", "Rock Concert"],
  Art: ["Art Exhibition", "Painting Workshop", "Sculpture Show", "Creative Arts"],
  Food: ["Food Festival", "Cooking Class", "Wine Tasting", "Culinary Workshop"],
  Business: ["Business Summit", "Networking Event", "Startup Pitch", "Entrepreneur Meet"],
  Health: ["Wellness Workshop", "Fitness Challenge", "Health Seminar", "Yoga Retreat"],
  Travel: ["Travel Expo", "Adventure Trip", "Cultural Tour", "Travel Photography"],
  Gaming: ["Gaming Tournament", "Esports Event", "Board Game Night", "Gaming Convention"],
};

const getRandomDate = () => {
  const start = new Date("2025-12-01");
  const end = new Date("2025-12-31");
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const getEventStatus = (eventDate: Date, currentParticipants: number, maxParticipants: number, minParticipants: number, joiningFee: number) => {
  const now = new Date();
  const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  if (eventDate < now) {
    return currentParticipants >= minParticipants ? EventStatus.COMPLETED : EventStatus.CANCELLED;
  }
  
  if (currentParticipants >= maxParticipants) {
    return EventStatus.FULL;
  }
  
  if (joiningFee === 0) {
    return EventStatus.OPEN;
  }
  
  if (eventDate > oneWeekFromNow) {
    return EventStatus.UPCOMING;
  }
  
  return EventStatus.ONGOING;
};

const generateEvent = (index: number, hostIds: string[]) => {
  const category = eventCategories[Math.floor(Math.random() * eventCategories.length)];
  const titles = eventTitles[category as keyof typeof eventTitles];
  const title = titles[Math.floor(Math.random() * titles.length)] + ` ${index}`;
  
  const eventDate = getRandomDate();
  const minParticipants = Math.floor(Math.random() * 10) + 5;
  const maxParticipants = minParticipants + Math.floor(Math.random() * 20) + 10;
  const joiningFee = Math.random() > 0.5 ? 0 : Math.floor(Math.random() * 100) + 10;
  const currentParticipants = Math.floor(Math.random() * (maxParticipants + 5));
  
  const status = getEventStatus(eventDate, currentParticipants, maxParticipants, minParticipants, joiningFee);
  
  return {
    title,
    description: `This is an amazing ${category.toLowerCase()} event. Join us for an unforgettable experience!`,
    eventCategory: category,
    date: eventDate,
    time: `${Math.floor(Math.random() * 12) + 1}:${Math.random() > 0.5 ? "00" : "30"} ${Math.random() > 0.5 ? "AM" : "PM"}`,
    location: `${category} Center, City ${Math.floor(Math.random() * 20) + 1}`,
    minParticipants,
    maxParticipants,
    currentParticipants: Math.min(currentParticipants, maxParticipants),
    joiningFee,
    status,
    userId: hostIds[Math.floor(Math.random() * hostIds.length)],
    eventImage: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
  };
};

export const seedEvents = async () => {
  try {
    console.log("Starting to seed 100 events...");

    const hosts = await prisma.user.findMany({
      where: { role: "HOST" },
      select: { id: true },
    });

    if (hosts.length === 0) {
      console.log("No hosts found. Please seed hosts first.");
      return;
    }

    const hostIds = hosts.map(host => host.id);
    const events = [];

    for (let i = 1; i <= 100; i++) {
      events.push(generateEvent(i, hostIds));
    }

    await prisma.event.createMany({
      data: events,
      skipDuplicates: true,
    });

    console.log("Successfully seeded 100 events!");
  } catch (error) {
    console.error("Error seeding events:", error);
  } finally {
    await prisma.$disconnect();
  }
};

if (require.main === module) {
  seedEvents();
}