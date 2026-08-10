import "dotenv/config";
import { db, FieldValue, Timestamp } from "../config/firebase.js";

const now = new Date();
const dateFromNow = (days) => {
  const date = new Date(now);
  date.setDate(date.getDate() + days);
  date.setHours(0, 0, 0, 0);
  return Timestamp.fromDate(date);
};

const events = [
  {
    title: "Mindoro Tech Connect 2026",
    description:
      "Meet student developers, local innovators, and technology enthusiasts for an afternoon of practical talks, project demonstrations, and new connections.",
    date: dateFromNow(14),
    time: "1:00 PM - 5:00 PM",
    venue: "MinSU Main Campus Activity Center",
    category: "Technology",
    organizer: "College of Computer Studies",
    capacity: 180,
    registeredCount: 46,
    theme: "violet",
  },
  {
    title: "Build Your First Web App",
    description:
      "A beginner-friendly workshop covering the building blocks of a modern website, from interface planning to connecting data and publishing a working project.",
    date: dateFromNow(23),
    time: "9:00 AM - 3:00 PM",
    venue: "CCS Computer Laboratory 2",
    category: "Education",
    organizer: "MinSU IT Society",
    capacity: 60,
    registeredCount: 31,
    theme: "blue",
  },
  {
    title: "Local Creators Weekend",
    description:
      "A relaxed community gathering where artists, student entrepreneurs, and local makers can showcase their work and learn from one another.",
    date: dateFromNow(37),
    time: "10:00 AM - 6:00 PM",
    venue: "Calapan City Convention Center",
    category: "Community",
    organizer: "Young Mindoro Creators",
    capacity: 250,
    registeredCount: 88,
    theme: "orange",
  },
];

const batch = db.batch();
events.forEach((event) => {
  const reference = db.collection("events").doc();
  batch.set(reference, {
    ...event,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
});

await batch.commit();
console.log(`Added ${events.length} sample events.`);
process.exit(0);
