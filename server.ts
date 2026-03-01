import express from "express";
import { createServer as createViteServer } from "vite";
import db from "./db";
import { randomUUID, randomBytes } from "crypto";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes

  // Create Exam
  app.post("/api/exams", (req, res) => {
    try {
      const { title, duration_minutes, answer_key, password } = req.body;
      const id = randomUUID();
      // Generate a simple 6-char code
      const code = randomBytes(3).toString('hex').toUpperCase();
      const admin_token = randomUUID();

      const stmt = db.prepare(`
        INSERT INTO exams (id, code, admin_token, title, duration_minutes, answer_key, password)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(id, code, admin_token, title, duration_minutes, JSON.stringify(answer_key), password || null);

      res.json({ id, code, admin_token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to create exam" });
    }
  });

  // Teacher Login
  app.post("/api/teacher/login", (req, res) => {
    try {
      const { code, password } = req.body;
      const stmt = db.prepare("SELECT id, admin_token, password FROM exams WHERE code = ?");
      const exam = stmt.get(code.toUpperCase()) as any;

      if (!exam) {
        return res.status(404).json({ error: "Mã phòng không tồn tại" });
      }

      if (exam.password !== password) {
        return res.status(401).json({ error: "Sai mật khẩu" });
      }

      res.json({ id: exam.id, token: exam.admin_token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Get Exam (Public info for student login)
  app.get("/api/exams/code/:code", (req, res) => {
    try {
      const { code } = req.params;
      const stmt = db.prepare("SELECT id, title, duration_minutes FROM exams WHERE code = ?");
      const exam = stmt.get(code);
      if (!exam) return res.status(404).json({ error: "Exam not found" });
      res.json(exam);
    } catch (error) {
      res.status(500).json({ error: "Database error" });
    }
  });

  // Get Exam Details (Admin only)
  app.get("/api/exams/:id/admin", (req, res) => {
    try {
      const { id } = req.params;
      const { token } = req.query;
      
      const stmt = db.prepare("SELECT * FROM exams WHERE id = ?");
      const exam = stmt.get(id) as any;
      
      if (!exam || exam.admin_token !== token) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      exam.answer_key = JSON.parse(exam.answer_key);
      res.json(exam);
    } catch (error) {
      res.status(500).json({ error: "Database error" });
    }
  });

  // Update Exam (Answer Key)
  app.put("/api/exams/:id", (req, res) => {
    try {
      const { id } = req.params;
      const { token } = req.query;
      const { answer_key, title, duration_minutes } = req.body;

      const stmt = db.prepare("SELECT admin_token FROM exams WHERE id = ?");
      const exam = stmt.get(id) as any;
      
      if (!exam || exam.admin_token !== token) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const updateStmt = db.prepare(`
        UPDATE exams 
        SET answer_key = ?, title = ?, duration_minutes = ?
        WHERE id = ?
      `);
      updateStmt.run(JSON.stringify(answer_key), title, duration_minutes, id);

      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to update exam" });
    }
  });

  // Start Exam (Student)
  app.post("/api/submissions/start", (req, res) => {
    try {
      const { exam_id, student_name } = req.body;
      
      // Check if student already started? 
      // For simplicity, we allow same name to restart if they haven't submitted, 
      // or we just create a new submission. Let's create new for now, or check existing.
      // To prevent cheating by refreshing, we should check if there's an active submission.
      
      const checkStmt = db.prepare("SELECT id, start_time, submit_time FROM submissions WHERE exam_id = ? AND student_name = ?");
      const existing = checkStmt.get(exam_id, student_name) as any;

      if (existing) {
        if (existing.submit_time) {
           return res.status(400).json({ error: "You have already submitted this exam." });
        }
        return res.json({ id: existing.id, start_time: existing.start_time });
      }

      const id = randomUUID();
      const start_time = new Date().toISOString();
      
      const stmt = db.prepare(`
        INSERT INTO submissions (id, exam_id, student_name, start_time)
        VALUES (?, ?, ?, ?)
      `);
      stmt.run(id, exam_id, student_name, start_time);
      
      res.json({ id, start_time });
    } catch (error) {
      res.status(500).json({ error: "Failed to start exam" });
    }
  });

  // Submit Exam
  app.post("/api/submissions/:id/submit", (req, res) => {
    try {
      const { id } = req.params;
      const { answers } = req.body; // Student answers
      
      const subStmt = db.prepare("SELECT * FROM submissions WHERE id = ?");
      const submission = subStmt.get(id) as any;
      if (!submission) return res.status(404).json({ error: "Submission not found" });
      if (submission.submit_time) return res.status(400).json({ error: "Already submitted" });

      const examStmt = db.prepare("SELECT * FROM exams WHERE id = ?");
      const exam = examStmt.get(submission.exam_id) as any;
      const key = JSON.parse(exam.answer_key);

      // Calculate Score
      let totalScore = 0;
      const details = {
        part1: { score: 0, total: 4.5, correct: 0 },
        part2: { score: 0, total: 4.0, correct: 0 },
        part3: { score: 0, total: 1.5, correct: 0 }
      };

      // Part 1: 18 Qs, 0.25 each
      for (let i = 1; i <= 18; i++) {
        const qKey = `p1_q${i}`;
        const correct = key[qKey];
        const answer = answers[qKey];
        if (correct !== undefined && answer === correct) {
          totalScore += 0.25;
          details.part1.score += 0.25;
          details.part1.correct++;
        }
      }

      // Part 2: 4 Qs (19-22), 4 sub-parts each. 
      // Scoring: 1 correct -> 0.1, 2 -> 0.25, 3 -> 0.5, 4 -> 1.0
      for (let i = 19; i <= 22; i++) {
        let subCorrect = 0;
        ['a', 'b', 'c', 'd'].forEach(sub => {
          const qKey = `p2_q${i}_${sub}`;
          const correctVal = key[qKey]; 
          const answerVal = answers[qKey]; 
          if (correctVal !== undefined && correctVal === answerVal) {
            subCorrect++;
          }
        });

        let qScore = 0;
        if (subCorrect === 1) qScore = 0.1;
        else if (subCorrect === 2) qScore = 0.25;
        else if (subCorrect === 3) qScore = 0.5;
        else if (subCorrect === 4) qScore = 1.0;
        
        totalScore += qScore;
        details.part2.score += qScore;
        if (subCorrect === 4) details.part2.correct++; 
      }

      // Part 3: 6 Qs (23-28), 0.25 each. Short answer.
      for (let i = 23; i <= 28; i++) {
        const qKey = `p3_q${i}`;
        const correct = key[qKey]; 
        const answer = answers[qKey];
        
        if (correct !== undefined && answer && String(correct).trim().toLowerCase() === String(answer).trim().toLowerCase()) {
          totalScore += 0.25;
          details.part3.score += 0.25;
          details.part3.correct++;
        }
      }

      // Round to 2 decimal places
      totalScore = Math.round(totalScore * 100) / 100;

      const submit_time = new Date().toISOString();
      const updateStmt = db.prepare(`
        UPDATE submissions 
        SET submit_time = ?, answers = ?, score = ?, score_details = ?
        WHERE id = ?
      `);
      updateStmt.run(submit_time, JSON.stringify(answers), totalScore, JSON.stringify(details), id);

      res.json({ score: totalScore, details });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to submit" });
    }
  });

  // Get Submissions (Admin)
  app.get("/api/exams/:id/submissions", (req, res) => {
    try {
      const { id } = req.params;
      const { token } = req.query;
      
      // Verify token first
      const examStmt = db.prepare("SELECT admin_token FROM exams WHERE id = ?");
      const exam = examStmt.get(id) as any;
      if (!exam || exam.admin_token !== token) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const stmt = db.prepare("SELECT * FROM submissions WHERE exam_id = ? ORDER BY score DESC");
      const submissions = stmt.all(id);
      
      // Parse JSON fields
      const parsed = submissions.map((s: any) => ({
        ...s,
        answers: JSON.parse(s.answers),
        score_details: JSON.parse(s.score_details)
      }));

      res.json(parsed);
    } catch (error) {
      res.status(500).json({ error: "Database error" });
    }
  });


  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
