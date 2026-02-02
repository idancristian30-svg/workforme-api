const express = require("express");
const router = express.Router();
const Job = require("../models/job");
const auth = require("../middleware/auth");

// GET ALL JOBS (PUBLIC)
router.get("/", async (req, res) => {
  const jobs = await Job.find().populate("createdBy", "email");
  res.json(jobs);
});

// SEED JOBS (PROTECTED)
router.post("/seed", auth, async (req, res) => {
  await Job.deleteMany();

  const jobs = await Job.insertMany([
    {
      title: "Electrician (1 zi)",
      company: "BuildFix",
      location: "București",
      pay: "600 lei/zi",
      description: "Montaj prize + verificări",
      createdBy: req.user.userId,
    },
    {
      title: "Montaj rigips",
      company: "InteriorPro",
      location: "Timișoara",
      pay: "400 lei/zi",
      description: "Pereți despărțitori + glet",
      createdBy: req.user.userId,
    },
  ]);

  res.json({ count: jobs.length });
});

// APPLY
router.post("/:id/apply", auth, async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) return res.status(404).json({ message: "Job not found" });

  const already = job.applicants.find(
    (a) => a.userId.toString() === req.user.userId
  );

  if (already) {
    return res.status(400).json({ message: "Already applied" });
  }

  job.applicants.push({
    userId: req.user.userId,
    appliedAt: new Date(),
  });

  await job.save();
  res.json({ message: "Applied successfully" });
});

// MY APPLICATIONS
router.get("/my-applications", auth, async (req, res) => {
  const jobs = await Job.find({
    "applicants.userId": req.user.userId,
  });

  res.json(jobs);
});

module.exports = router;
