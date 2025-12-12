const express = require("express");
const { v4: uuidv4 } = require("uuid");

const Note = require("./model");
const { log, errLog } = require("./utils");

const router = express.Router();

// Request logging middleware: prints a blank line then timestamped method+path
router.use((req, res, next) => {
  console.log(""); // Blank line for readability
  log(`${req.method} ${req.originalUrl}`);
  next();
});

// List all notes
/**
 * @openapi
 * /api/list:
 *   get:
 *     tags:
 *       - Notes
 *     summary: List all notes
 *     responses:
 *       200:
 *         description: Array of notes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   text:
 *                     type: string
 *                   color:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 */
router.get("/list", async (req, res) => {
  try {
    const notes = await Note.find().sort({ createdAt: -1 }).lean();
    log(`Returning ${notes.length} notes`);
    res.json(notes);
  } catch (err) {
    errLog("Error listing notes:", err);
    res.status(500).json({ error: "failed to list notes" });
  }
});

/**
 * @openapi
 * /api/create:
 *   post:
 *     tags:
 *       - Notes
 *     summary: Create a new note
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *               color:
 *                 type: string
 *     responses:
 *       201:
 *         description: Note created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 text:
 *                   type: string
 *                 color:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 */
router.post("/create", async (req, res) => {
  const { text, color } = req.body;
  if (!text) return res.status(400).json({ error: "text is required" });
  try {
    const note = new Note({ uuid: uuidv4(), text, color: color || "", nrOfEdits: 0 });
    note.save().then(() => log("Note created:", note.uuid));
    res.status(201).json(note);
  } catch (err) {
    errLog("Error creating note:", err);
    res.status(500).json({ error: "failed to create note" });
  }
});

/**
 * @openapi
 * /api/update/{id}:
 *   put:
 *     tags:
 *       - Notes
 *     summary: Update a note
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *               color:
 *                 type: string
 *     responses:
 *       200:
 *         description: Note updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 text:
 *                   type: string
 *                 color:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 */
router.put("/update/:id", async (req, res) => {
  const { id } = req.params;
  const { text, color } = req.body;
  try {
    const note = await Note.findOneAndUpdate(
      { uuid: id },
      { text, color, updatedAt: new Date(), $inc: { nrOfEdits: 1 } },
      { new: true }
    );
    if (!note) return res.status(404).json({ error: "note not found" });
    log("Note updated:", note.uuid);
    res.json(note);
  } catch (err) {
    errLog("Error updating note:", err);
    res.status(500).json({ error: "failed to update note" });
  }
});

/**
 * @openapi
 * /api/delete/{id}:
 *   delete:
 *     tags:
 *       - Notes
 *     summary: Delete a note
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Note deleted
 */
router.delete("/delete/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await Note.findOneAndDelete({ uuid: id });
    if (!result) return res.status(404).json({ error: "note not found" });
    log("Note deleted:", id);
    res.json({ ok: true });
  } catch (err) {
    errLog("Error deleting note:", err);
    res.status(500).json({ error: "failed to delete note" });
  }
});

module.exports = router;
