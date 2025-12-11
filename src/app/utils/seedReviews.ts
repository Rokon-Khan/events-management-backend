import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const reviewComments = [
  "Amazing event! The host was very organized and professional.",
  "Great experience, would definitely attend again.",
  "Well-planned event with excellent execution.",
  "The host was friendly and made everyone feel welcome.",
  "Outstanding event management and coordination.",
  "Fantastic venue and great atmosphere created by the host.",
  "Highly recommend this host for future events.",
  "Professional service and attention to detail.",
  "The event exceeded my expectations.",
  "Wonderful organization and smooth execution.",
  "The host was responsive and helpful throughout.",
  "Great networking opportunity, well facilitated.",
  "Excellent event planning and management skills.",
  "Very satisfied with the overall experience.",
  "The host created a perfect environment for the event.",
  "Impressive organization and time management.",
  "Would love to attend more events by this host.",
  "Great communication and event coordination.",
  "The host went above and beyond expectations.",
  "Perfect event execution from start to finish.",
];

const generateReview = (userId: string, eventId: string) => {
  const rating = Math.floor(Math.random() * 5) + 1; // 1-5 rating
  const comment = reviewComments[Math.floor(Math.random() * reviewComments.length)];
  
  return {
    rating,
    comment,
    userId,
    eventId,
  };
};

export const seedReviews = async () => {
  try {
    console.log("Starting to seed 100 reviews...");

    // Get all users (excluding hosts to avoid self-reviews)
    const users = await prisma.user.findMany({
      where: { role: "USER" },
      select: { id: true },
    });

    // Get all events with their host information
    const events = await prisma.event.findMany({
      select: { 
        id: true, 
        userId: true // host id
      },
    });

    if (users.length === 0 || events.length === 0) {
      console.log("No users or events found. Please seed users and events first.");
      return;
    }

    const reviews = [];
    const usedCombinations = new Set();

    for (let i = 0; i < 100; i++) {
      let userId, eventId, hostId;
      let attempts = 0;
      
      do {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const randomEvent = events[Math.floor(Math.random() * events.length)];
        
        userId = randomUser.id;
        eventId = randomEvent.id;
        hostId = randomEvent.userId;
        
        attempts++;
        if (attempts > 1000) break; // Prevent infinite loop
        
      } while (
        userId === hostId || // Prevent self-reviews
        usedCombinations.has(`${userId}-${eventId}`) // Prevent duplicate reviews
      );

      if (attempts <= 1000) {
        usedCombinations.add(`${userId}-${eventId}`);
        reviews.push(generateReview(userId, eventId));
      }
    }

    await prisma.review.createMany({
      data: reviews,
      skipDuplicates: true,
    });

    // Update reviewCount for hosts
    const hostReviewCounts = await prisma.review.groupBy({
      by: ['eventId'],
      _count: {
        id: true,
      },
    });

    for (const { eventId, _count } of hostReviewCounts) {
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        select: { userId: true },
      });

      if (event) {
        await prisma.user.update({
          where: { id: event.userId },
          data: { reviewCount: { increment: _count.id } },
        });
      }
    }

    console.log(`Successfully seeded ${reviews.length} reviews!`);
  } catch (error) {
    console.error("Error seeding reviews:", error);
  } finally {
    await prisma.$disconnect();
  }
};

if (require.main === module) {
  seedReviews();
}