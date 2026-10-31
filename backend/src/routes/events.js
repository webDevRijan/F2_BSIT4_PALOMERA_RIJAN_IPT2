import { Router } from "express";
import multer from "multer";
import { nanoid } from "nanoid";
import { bucket, db, FieldValue, Timestamp } from "../config/firebase.js";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    if (!file.mimetype.startsWith("image/")) {
      const error = new Error(
        "Only image files can be uploaded as event covers.",
      );
      error.status = 400;
      return callback(error);
    }
    callback(null, true);
  },
});

const allowedCategories = [
  "Technology",
  "Education",
  "Business",
  "Community",
  "Arts",
  "Other",
];

function cleanText(value = "") {
  return String(value).trim();
}

function serializeDate(value) {
  if (!value) return null;
  if (typeof value.toDate === "function") return value.toDate().toISOString();
  return new Date(value).toISOString();
}

function serializeDocument(document) {
  const data = document.data();
  return {
    id: document.id,
    ...data,
    date: serializeDate(data.date),
    createdAt: serializeDate(data.createdAt),
    updatedAt: serializeDate(data.updatedAt),
  };
}

function validateEvent(body) {
  const required = [
    "title",
    "description",
    "date",
    "time",
    "venue",
    "category",
    "organizer",
    "capacity",
  ];
  const missing = required.filter((field) => !cleanText(body[field]));
  if (missing.length) {
    const error = new Error(`Please complete: ${missing.join(", ")}.`);
    error.status = 400;
    throw error;
  }

  const date = new Date(body.date);
  const capacity = Number(body.capacity);
  if (Number.isNaN(date.getTime())) {
    const error = new Error("Please provide a valid event date.");
    error.status = 400;
    throw error;
  }
  if (!Number.isInteger(capacity) || capacity < 1 || capacity > 100000) {
    const error = new Error(
      "Capacity must be a whole number between 1 and 100,000.",
    );
    error.status = 400;
    throw error;
  }
  if (!allowedCategories.includes(body.category)) {
    const error = new Error("Please select a valid event category.");
    error.status = 400;
    throw error;
  }

  return {
    title: cleanText(body.title),
    description: cleanText(body.description),
    date: Timestamp.fromDate(date),
    time: cleanText(body.time),
    venue: cleanText(body.venue),
    category: body.category,
    organizer: cleanText(body.organizer),
    capacity,
    registeredCount: 0,
  };
}

async function uploadCover(file) {
  if (!file) return null;
  if (!process.env.FIREBASE_STORAGE_BUCKET) {
    const error = new Error("Firebase Storage bucket is not configured.");
    error.status = 500;
    throw error;
  }

  const extension = file.originalname.split(".").pop()?.toLowerCase() || "jpg";
  const token = nanoid(24);
  const path = `event-covers/${Date.now()}-${nanoid(8)}.${extension}`;
  const storedFile = bucket.file(path);

  await storedFile.save(file.buffer, {
    resumable: false,
    metadata: {
      contentType: file.mimetype,
      metadata: { firebaseStorageDownloadTokens: token },
    },
  });

  const encodedPath = encodeURIComponent(path);
  return {
    coverPath: path,
    coverUrl: `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodedPath}?alt=media&token=${token}`,
  };
}

router.get("/", async (req, res, next) => {
  try {
    const snapshot = await db.collection("events").orderBy("date", "asc").get();
    res.json(snapshot.docs.map(serializeDocument));
  } catch (error) {
    next(error);
  }
});

router.get("/:eventId", async (req, res, next) => {
  try {
    const document = await db
      .collection("events")
      .doc(req.params.eventId)
      .get();
    if (!document.exists)
      return res.status(404).json({ message: "Event not found." });
    res.json(serializeDocument(document));
  } catch (error) {
    next(error);
  }
});

router.post("/", upload.single("cover"), async (req, res, next) => {
  try {
    const event = validateEvent(req.body);
    const cover = await uploadCover(req.file);
    const reference = await db.collection("events").add({
      ...event,
      ...cover,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    const created = await reference.get();
    res.status(201).json(serializeDocument(created));
  } catch (error) {
    next(error);
  }
});

router.put("/:eventId", upload.single("cover"), async (req, res, next) => {
  try {
    const reference = db.collection("events").doc(req.params.eventId);
    const document = await reference.get();
    if (!document.exists)
      return res.status(404).json({ message: "Event not found." });

    const event = validateEvent(req.body);
    const registeredCount = document.data().registeredCount || 0;
    if (event.capacity < registeredCount) {
      return res.status(400).json({
        message: `Capacity cannot be lower than the ${registeredCount} current registration${registeredCount === 1 ? "" : "s"}.`,
      });
    }
    const cover = await uploadCover(req.file);
    const previousCoverPath = document.data().coverPath;
    await reference.update({
      ...event,
      registeredCount,
      ...(cover || {}),
      updatedAt: FieldValue.serverTimestamp(),
    });

    if (cover && previousCoverPath)
      await bucket.file(previousCoverPath).delete({ ignoreNotFound: true });

    const updated = await reference.get();
    res.json(serializeDocument(updated));
  } catch (error) {
    next(error);
  }
});

router.delete("/:eventId", async (req, res, next) => {
  try {
    const reference = db.collection("events").doc(req.params.eventId);
    const document = await reference.get();
    if (!document.exists)
      return res.status(404).json({ message: "Event not found." });

    const registrations = await db
      .collection("registrations")
      .where("eventId", "==", req.params.eventId)
      .get();
    const batch = db.batch();
    registrations.docs.forEach((registration) =>
      batch.delete(registration.ref),
    );
    batch.delete(reference);
    await batch.commit();

    const { coverPath } = document.data();
    if (coverPath)
      await bucket.file(coverPath).delete({ ignoreNotFound: true });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.get("/:eventId/registrations", async (req, res, next) => {
  try {
    const event = await db.collection("events").doc(req.params.eventId).get();
    if (!event.exists)
      return res.status(404).json({ message: "Event not found." });

    const snapshot = await db
      .collection("registrations")
      .where("eventId", "==", req.params.eventId)
      .get();
    const registrations = snapshot.docs
      .map(serializeDocument)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(registrations);
  } catch (error) {
    next(error);
  }
});

router.post("/:eventId/registrations", async (req, res, next) => {
  try {
    const required = ["fullName", "email", "phone"];
    const missing = required.filter((field) => !cleanText(req.body[field]));
    if (missing.length) {
      return res
        .status(400)
        .json({ message: `Please complete: ${missing.join(", ")}.` });
    }

    const email = cleanText(req.body.email).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res
        .status(400)
        .json({ message: "Please enter a valid email address." });
    }

    const eventReference = db.collection("events").doc(req.params.eventId);
    const duplicate = await db
      .collection("registrations")
      .where("eventId", "==", req.params.eventId)
      .where("email", "==", email)
      .limit(1)
      .get();
    if (!duplicate.empty) {
      return res
        .status(409)
        .json({ message: "This email is already registered for the event." });
    }

    const registrationCode = `EV-${nanoid(8).toUpperCase()}`;
    const registrationReference = db.collection("registrations").doc();
    await db.runTransaction(async (transaction) => {
      const event = await transaction.get(eventReference);
      if (!event.exists) {
        const error = new Error("Event not found.");
        error.status = 404;
        throw error;
      }

      const data = event.data();
      if ((data.registeredCount || 0) >= data.capacity) {
        const error = new Error("Sorry, this event is already full.");
        error.status = 409;
        throw error;
      }

      transaction.set(registrationReference, {
        eventId: req.params.eventId,
        eventTitle: data.title,
        fullName: cleanText(req.body.fullName),
        email,
        phone: cleanText(req.body.phone),
        organization: cleanText(req.body.organization),
        ticketType: ["General", "Student", "VIP"].includes(req.body.ticketType)
          ? req.body.ticketType
          : "General",
        registrationCode,
        createdAt: FieldValue.serverTimestamp(),
      });
      transaction.update(eventReference, {
        registeredCount: FieldValue.increment(1),
        updatedAt: FieldValue.serverTimestamp(),
      });
    });

    res.status(201).json({
      id: registrationReference.id,
      registrationCode,
      message: "Registration completed successfully.",
    });
  } catch (error) {
    next(error);
  }
});

export default router;
