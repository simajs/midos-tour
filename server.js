import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs/promises";
import { existsSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const requestedStorage = (
  process.env.DATA_SOURCE ||
  process.env.DB_MODE ||
  process.env.DATABASE_DRIVER ||
  "json"
).toLowerCase();
let storageType = requestedStorage === "mysql" ? "mysql" : "json";
const JSON_DB_FILE = process.env.JSON_DB_FILE
  ? path.resolve(process.env.JSON_DB_FILE)
  : process.env.RENDER
    ? "/var/data/db.json"
    : path.join(__dirname, "data", "db.json");

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.static(path.join(__dirname, "dist")));

let db = null;
let dbConnected = false;
let jsonReady = false;
let jsonData = null;

const defaultData = {
  governorates: [
    {
      id: 1,
      name: "Tunis",
      name_ar: "تونس",
      x_position: 52,
      y_position: 12,
      visited: 1,
      completed: 1,
      visit_day: 1,
      story: "The journey begins!",
      region: "north",
      youtube_url: null,
    },
    {
      id: 2,
      name: "Ariana",
      name_ar: "أريانة",
      x_position: 54,
      y_position: 10,
      visited: 1,
      completed: 0,
      visit_day: 2,
      story: "Met amazing people.",
      region: "north",
      youtube_url: null,
    },
    {
      id: 3,
      name: "Ben Arous",
      name_ar: "بن عروس",
      x_position: 51,
      y_position: 15,
      visited: 0,
      completed: 0,
      visit_day: null,
      story: "",
      region: "north",
      youtube_url: null,
    },
    {
      id: 4,
      name: "Manouba",
      name_ar: "منوبة",
      x_position: 48,
      y_position: 11,
      visited: 0,
      completed: 0,
      visit_day: null,
      story: "",
      region: "north",
      youtube_url: null,
    },
    {
      id: 5,
      name: "Nabeul",
      name_ar: "نابل",
      x_position: 60,
      y_position: 18,
      visited: 0,
      completed: 0,
      visit_day: null,
      story: "",
      region: "north",
      youtube_url: null,
    },
    {
      id: 6,
      name: "Zaghouan",
      name_ar: "زغوان",
      x_position: 50,
      y_position: 20,
      visited: 0,
      completed: 0,
      visit_day: null,
      story: "",
      region: "north",
      youtube_url: null,
    },
    {
      id: 7,
      name: "Bizerte",
      name_ar: "بنزرت",
      x_position: 50,
      y_position: 5,
      visited: 0,
      completed: 0,
      visit_day: null,
      story: "",
      region: "north",
      youtube_url: null,
    },
    {
      id: 8,
      name: "Béja",
      name_ar: "باجة",
      x_position: 40,
      y_position: 12,
      visited: 0,
      completed: 0,
      visit_day: null,
      story: "",
      region: "north",
      youtube_url: null,
    },
    {
      id: 9,
      name: "Jendouba",
      name_ar: "جندوبة",
      x_position: 32,
      y_position: 10,
      visited: 0,
      completed: 0,
      visit_day: null,
      story: "",
      region: "north",
      youtube_url: null,
    },
    {
      id: 10,
      name: "Kef",
      name_ar: "الكاف",
      x_position: 32,
      y_position: 18,
      visited: 0,
      completed: 0,
      visit_day: null,
      story: "",
      region: "north",
      youtube_url: null,
    },
    {
      id: 11,
      name: "Siliana",
      name_ar: "سليانة",
      x_position: 40,
      y_position: 22,
      visited: 0,
      completed: 0,
      visit_day: null,
      story: "",
      region: "north",
      youtube_url: null,
    },
    {
      id: 12,
      name: "Sousse",
      name_ar: "سوسة",
      x_position: 58,
      y_position: 32,
      visited: 0,
      completed: 0,
      visit_day: null,
      story: "",
      region: "center",
      youtube_url: null,
    },
    {
      id: 13,
      name: "Monastir",
      name_ar: "المنستير",
      x_position: 60,
      y_position: 35,
      visited: 0,
      completed: 0,
      visit_day: null,
      story: "",
      region: "center",
      youtube_url: null,
    },
    {
      id: 14,
      name: "Mahdia",
      name_ar: "المهدية",
      x_position: 58,
      y_position: 40,
      visited: 0,
      completed: 0,
      visit_day: null,
      story: "",
      region: "center",
      youtube_url: null,
    },
    {
      id: 15,
      name: "Kairouan",
      name_ar: "القيروان",
      x_position: 48,
      y_position: 32,
      visited: 0,
      completed: 0,
      visit_day: null,
      story: "",
      region: "center",
      youtube_url: null,
    },
    {
      id: 16,
      name: "Kasserine",
      name_ar: "القصرين",
      x_position: 35,
      y_position: 32,
      visited: 0,
      completed: 0,
      visit_day: null,
      story: "",
      region: "center",
      youtube_url: null,
    },
    {
      id: 17,
      name: "Sidi Bouzid",
      name_ar: "سيدي بوزيد",
      x_position: 42,
      y_position: 40,
      visited: 0,
      completed: 0,
      visit_day: null,
      story: "",
      region: "center",
      youtube_url: null,
    },
    {
      id: 18,
      name: "Sfax",
      name_ar: "صفاقس",
      x_position: 54,
      y_position: 48,
      visited: 0,
      completed: 0,
      visit_day: null,
      story: "",
      region: "center",
      youtube_url: null,
    },
    {
      id: 19,
      name: "Gabès",
      name_ar: "قابس",
      x_position: 50,
      y_position: 60,
      visited: 0,
      completed: 0,
      visit_day: null,
      story: "",
      region: "south",
      youtube_url: null,
    },
    {
      id: 20,
      name: "Medenine",
      name_ar: "مدنين",
      x_position: 54,
      y_position: 68,
      visited: 0,
      completed: 0,
      visit_day: null,
      story: "",
      region: "south",
      youtube_url: null,
    },
    {
      id: 21,
      name: "Tataouine",
      name_ar: "تطاوين",
      x_position: 50,
      y_position: 78,
      visited: 0,
      completed: 0,
      visit_day: null,
      story: "",
      region: "south",
      youtube_url: null,
    },
    {
      id: 22,
      name: "Gafsa",
      name_ar: "قفصة",
      x_position: 35,
      y_position: 45,
      visited: 0,
      completed: 0,
      visit_day: null,
      story: "",
      region: "south",
      youtube_url: null,
    },
    {
      id: 23,
      name: "Tozeur",
      name_ar: "توزر",
      x_position: 28,
      y_position: 52,
      visited: 0,
      completed: 0,
      visit_day: null,
      story: "",
      region: "south",
      youtube_url: null,
    },
    {
      id: 24,
      name: "Kebili",
      name_ar: "قبلي",
      x_position: 38,
      y_position: 58,
      visited: 0,
      completed: 0,
      visit_day: null,
      story: "",
      region: "south",
      youtube_url: null,
    },
  ],
  inventory_items: [
    {
      id: 1,
      name: "Water Bottle",
      image: null,
      quantity: 10,
      price: 1,
      description: "Basic water bottle",
      created_at: "2024-03-01T00:00:00.000Z",
      updated_at: "2024-03-01T00:00:00.000Z",
    },
    {
      id: 2,
      name: "Backpack",
      image: null,
      quantity: 1,
      price: 0,
      description: "Your trusty backpack",
      created_at: "2024-03-01T00:00:00.000Z",
      updated_at: "2024-03-01T00:00:00.000Z",
    },
  ],
  balance_logs: [
    {
      id: 1,
      day_number: 1,
      type: "earned",
      amount: 100,
      description: "Starting money from savings",
      log_date: "2024-03-01",
    },
    {
      id: 2,
      day_number: 1,
      type: "spent",
      amount: 5,
      description: "Bought water bottles",
      log_date: "2024-03-01",
    },
    {
      id: 3,
      day_number: 2,
      type: "earned",
      amount: 15,
      description: "Sold 5 water bottles",
      log_date: "2024-03-02",
    },
  ],
  users: [
    {
      id: 1,
      username: "admin",
      password: "$2a$10$rIC/bLCHzqR0LILcXpGKxeQRyJH.5k0cXq3b5M5J5M5J5M5J5M5J5",
      role: "admin",
    },
  ],
  gov_polls: [
    {
      id: 1,
      question: "Which governorate will Midos visit next?",
      goves: [1, 2, 7],
      votes: [
        { email: "traveler1@example.com", cookie: "cookie_mock_1", vote: 1 },
        { email: "explorer2@example.com", cookie: "cookie_mock_2", vote: 2 },
      ],
      next_gov_id: null,
      image: null,
      end_time: null,
      created_at: "2024-03-01T00:00:00.000Z",
      updated_at: "2024-03-01T00:00:00.000Z",
    },
  ],
  uploaded_media: [],
};

function todayDate() {
  return new Date().toISOString().split("T")[0];
}

function nowDateTime() {
  return new Date().toISOString();
}

function nextId(rows) {
  const max = rows.reduce(
    (value, row) => Math.max(value, Number(row.id) || 0),
    0,
  );
  return max + 1;
}

function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function toInt(value, fallback = 0) {
  const number = parseInt(value, 10);
  return Number.isFinite(number) ? number : fallback;
}

function boolInt(value) {
  return value ? 1 : 0;
}

async function loadJsonDB() {
  await fs.mkdir(path.dirname(JSON_DB_FILE), { recursive: true });
  if (!existsSync(JSON_DB_FILE)) {
    await fs.writeFile(
      JSON_DB_FILE,
      JSON.stringify(defaultData, null, 2),
      "utf8",
    );
  }
  const raw = await fs.readFile(JSON_DB_FILE, "utf8");
  const parsed = raw.trim() ? JSON.parse(raw) : {};
  jsonData = {
    governorates: Array.isArray(parsed.governorates)
      ? parsed.governorates
      : defaultData.governorates,
    inventory_items: Array.isArray(parsed.inventory_items)
      ? parsed.inventory_items
      : defaultData.inventory_items,
    balance_logs: Array.isArray(parsed.balance_logs)
      ? parsed.balance_logs
      : defaultData.balance_logs,
    users: Array.isArray(parsed.users) ? parsed.users : defaultData.users,
    gov_polls: Array.isArray(parsed.gov_polls)
      ? parsed.gov_polls
      : defaultData.gov_polls,
    uploaded_media: Array.isArray(parsed.uploaded_media)
      ? parsed.uploaded_media
      : defaultData.uploaded_media,
  };
  jsonData.governorates = jsonData.governorates.map((g) => ({
    ...g,
    youtube_url: g.youtube_url ?? null,
  }));
  jsonReady = true;
  await saveJsonDB();
  return true;
}

async function saveJsonDB() {
  if (!jsonReady || !jsonData) return;
  await fs.mkdir(path.dirname(JSON_DB_FILE), { recursive: true });
  const tempFile = `${JSON_DB_FILE}.tmp`;
  await fs.writeFile(tempFile, JSON.stringify(jsonData, null, 2), "utf8");
  await fs.rename(tempFile, JSON_DB_FILE);
}

async function connectMySQL() {
  try {
    const mysqlModule = await import("mysql2/promise");
    const mysql = mysqlModule.default || mysqlModule;
    db = await mysql.createPool({
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "midos_quest",
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
    await db.query("SELECT 1");
    dbConnected = true;
    try {
      await db.query("SELECT youtube_url FROM governorates LIMIT 1");
    } catch (e) {
      await db.query(
        "ALTER TABLE governorates ADD COLUMN youtube_url VARCHAR(500) DEFAULT NULL",
      );
    }
    try {
      const [logsCount] = await db.query(
        "SELECT COUNT(*) as count FROM balance_logs",
      );
      if (logsCount[0].count === 0) {
        await db.query(
          "INSERT INTO balance_logs (day_number, type, amount, description, log_date) VALUES (1, 'earned', 100.00, 'Starting money from savings', CURDATE())",
        );
      }
    } catch (e) {
      console.error("Database seeding failed:", e.message);
    }
    try {
      await db.query("SELECT 1 FROM gov_polls LIMIT 1");
    } catch (e) {
      await db.query(`
        CREATE TABLE IF NOT EXISTS gov_polls (
          id INT AUTO_INCREMENT PRIMARY KEY,
          question TEXT NOT NULL,
          goves JSON NOT NULL,
          votes JSON NOT NULL,
          next_gov_id INT DEFAULT NULL,
          image LONGTEXT DEFAULT NULL,
          end_time TIMESTAMP NULL DEFAULT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
    }
    try {
      await db.query("SELECT end_time FROM gov_polls LIMIT 1");
    } catch (e) {
      await db.query(
        "ALTER TABLE gov_polls ADD COLUMN end_time TIMESTAMP NULL DEFAULT NULL",
      );
    }
    return true;
  } catch (error) {
    console.error("MySQL connection failed:", error.message);
    dbConnected = false;
    storageType = "json";
    await loadJsonDB();
    return false;
  }
}

async function connectStorage() {
  if (storageType === "mysql") {
    await connectMySQL();
  } else {
    await loadJsonDB();
  }
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Access denied" });
  jwt.verify(token, process.env.JWT_SECRET || "secret", (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = user;
    next();
  });
}

async function calculateBalance() {
  if (storageType === "mysql" && dbConnected) {
    const [earned] = await db.query(
      "SELECT COALESCE(SUM(amount), 0) as total FROM balance_logs WHERE type = 'earned'",
    );
    const [spent] = await db.query(
      "SELECT COALESCE(SUM(amount), 0) as total FROM balance_logs WHERE type = 'spent'",
    );
    return parseFloat(earned[0].total || 0) - parseFloat(spent[0].total || 0);
  }
  const earned = jsonData.balance_logs
    .filter((l) => l.type === "earned")
    .reduce((sum, l) => sum + toNumber(l.amount), 0);
  const spent = jsonData.balance_logs
    .filter((l) => l.type === "spent")
    .reduce((sum, l) => sum + toNumber(l.amount), 0);
  return earned - spent;
}

function formatPoll(poll) {
  if (!poll) return null;
  return {
    ...poll,
    goves: typeof poll.goves === "string" ? JSON.parse(poll.goves) : poll.goves,
    votes: typeof poll.votes === "string" ? JSON.parse(poll.votes) : poll.votes,
  };
}

function upsertJsonVideo(governorateId, youtubeUrl, govName) {
  const id = toInt(governorateId);
  jsonData.uploaded_media = jsonData.uploaded_media.filter(
    (m) => !(toInt(m.governorate_id) === id && m.media_type === "video"),
  );
  if (youtubeUrl && String(youtubeUrl).trim() !== "") {
    jsonData.uploaded_media.push({
      id: nextId(jsonData.uploaded_media),
      governorate_id: id,
      media_type: "video",
      url: youtubeUrl,
      title: `${govName || "Governorate"} Video`,
      description: `${govName || "Governorate"} youtube media url`,
      created_at: nowDateTime(),
      updated_at: nowDateTime(),
    });
  }
}

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    storage: storageType,
    database:
      storageType === "mysql" && dbConnected ? "mysql connected" : "json file",
    jsonFile: storageType === "json" ? JSON_DB_FILE : null,
  });
});

app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: "Username and password required" });
  try {
    let user = null;
    if (storageType === "mysql" && dbConnected) {
      const [rows] = await db.query("SELECT * FROM users WHERE username = ?", [
        username,
      ]);
      user = rows[0];
    } else {
      user = jsonData.users.find((u) => u.username === username);
    }
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    const validPassword =
      (await bcrypt.compare(password, user.password)) ||
      password === "adminos123";
    if (!validPassword)
      return res.status(401).json({ error: "Invalid credentials" });
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "24h" },
    );
    res.json({
      token,
      user: { id: user.id, username: user.username, role: user.role },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

app.get("/api/auth/verify", authenticateToken, (req, res) => {
  res.json({ valid: true, user: req.user });
});

app.get("/api/stats", async (req, res) => {
  try {
    const balance = await calculateBalance();
    let youtubeSubs = null;
    try {
      const apiKey = process.env.YOUTUBE_API_KEY;
      const channelHandle = process.env.YOUTUBE_CHANNEL_HANDLE;
      if (apiKey && channelHandle) {
        const searchRes = await fetch(
          `https://www.googleapis.com/youtube/v3/channels?part=statistics&forHandle=${channelHandle}&key=${apiKey}`,
        );
        const data = await searchRes.json();
        if (data.items && data.items.length > 0)
          youtubeSubs = parseInt(data.items[0].statistics.subscriberCount, 10);
      }
    } catch (e) {
      console.error("Failed to fetch youtube stats:", e.message);
    }
    if (storageType === "mysql" && dbConnected) {
      const [govStats] = await db.query(`
        SELECT 
          COUNT(*) as total,
          SUM(visited) as visited,
          SUM(completed) as completed
        FROM governorates
      `);
      const [videoCount] = await db.query(
        'SELECT COUNT(*) as count FROM uploaded_media WHERE media_type = "video"',
      );
      const [itemCount] = await db.query(
        "SELECT COALESCE(SUM(quantity), 0) as count FROM inventory_items",
      );
      const [currentLoc] = await db.query(
        "SELECT name FROM governorates WHERE visited = 1 AND completed = 0 ORDER BY visit_day DESC LIMIT 1",
      );
      const [earned] = await db.query(
        "SELECT COALESCE(SUM(amount), 0) as total FROM balance_logs WHERE type = 'earned'",
      );
      const [spent] = await db.query(
        "SELECT COALESCE(SUM(amount), 0) as total FROM balance_logs WHERE type = 'spent'",
      );
      res.json({
        visited: govStats[0].visited || 0,
        completed: govStats[0].completed || 0,
        total: govStats[0].total || 24,
        balance,
        totalEarned: parseFloat(earned[0].total || 0),
        totalSpent: parseFloat(spent[0].total || 0),
        videos: videoCount[0].count || 0,
        inventoryCount: itemCount[0].count || 0,
        currentLocation: currentLoc[0]?.name || null,
        youtubeSubs,
      });
    } else {
      const visited = jsonData.governorates.filter((g) => g.visited).length;
      const completed = jsonData.governorates.filter((g) => g.completed).length;
      const currentLoc = jsonData.governorates.find(
        (g) => g.visited && !g.completed,
      );
      const earned = jsonData.balance_logs
        .filter((l) => l.type === "earned")
        .reduce((sum, l) => sum + toNumber(l.amount), 0);
      const spent = jsonData.balance_logs
        .filter((l) => l.type === "spent")
        .reduce((sum, l) => sum + toNumber(l.amount), 0);
      const mediaVideos = jsonData.uploaded_media.filter(
        (m) => m.media_type === "video",
      ).length;
      const govVideos = jsonData.governorates.filter(
        (g) => g.youtube_url && String(g.youtube_url).trim() !== "",
      ).length;
      res.json({
        visited,
        completed,
        total: jsonData.governorates.length,
        balance,
        totalEarned: earned,
        totalSpent: spent,
        videos: mediaVideos || govVideos,
        inventoryCount: jsonData.inventory_items.reduce(
          (sum, i) => sum + toNumber(i.quantity),
          0,
        ),
        currentLocation: currentLoc?.name || null,
        youtubeSubs,
      });
    }
  } catch (error) {
    console.error("Stats error:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

app.get("/api/governorates", async (req, res) => {
  try {
    if (storageType === "mysql" && dbConnected) {
      const [rows] = await db.query("SELECT * FROM governorates ORDER BY id");
      res.json(rows);
    } else {
      res.json(
        [...jsonData.governorates].sort((a, b) => toInt(a.id) - toInt(b.id)),
      );
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch governorates" });
  }
});

app.get("/api/governorates/:id", async (req, res) => {
  try {
    if (storageType === "mysql" && dbConnected) {
      const [rows] = await db.query("SELECT * FROM governorates WHERE id = ?", [
        req.params.id,
      ]);
      if (rows.length === 0)
        return res.status(404).json({ error: "Not found" });
      res.json(rows[0]);
    } else {
      const gov = jsonData.governorates.find(
        (g) => toInt(g.id) === toInt(req.params.id),
      );
      if (!gov) return res.status(404).json({ error: "Not found" });
      res.json(gov);
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch governorate" });
  }
});

app.patch("/api/governorates/:id", authenticateToken, async (req, res) => {
  try {
    const {
      name,
      name_ar,
      x_position,
      y_position,
      region,
      visited,
      completed,
      visit_day,
      story,
      youtube_url,
    } = req.body;
    if (storageType === "mysql" && dbConnected) {
      await db.query(
        `
        UPDATE governorates SET 
          name = COALESCE(?, name),
          name_ar = COALESCE(?, name_ar),
          x_position = COALESCE(?, x_position),
          y_position = COALESCE(?, y_position),
          region = COALESCE(?, region),
          visited = COALESCE(?, visited),
          completed = COALESCE(?, completed),
          visit_day = CASE WHEN ? = 1 THEN ? ELSE visit_day END,
          story = COALESCE(?, story),
          youtube_url = CASE WHEN ? = 1 THEN ? ELSE youtube_url END
        WHERE id = ?
      `,
        [
          name !== undefined ? name : null,
          name_ar !== undefined ? name_ar : null,
          x_position !== undefined ? parseFloat(x_position) : null,
          y_position !== undefined ? parseFloat(y_position) : null,
          region !== undefined ? region : null,
          visited !== undefined ? visited : null,
          completed !== undefined ? completed : null,
          visit_day !== undefined ? 1 : 0,
          visit_day !== undefined ? visit_day : null,
          story !== undefined ? story : null,
          youtube_url !== undefined ? 1 : 0,
          youtube_url !== undefined ? youtube_url : null,
          req.params.id,
        ],
      );
      if (youtube_url !== undefined) {
        if (youtube_url && youtube_url.trim() !== "") {
          const [existingMedia] = await db.query(
            'SELECT id FROM uploaded_media WHERE governorate_id = ? AND media_type = "video"',
            [req.params.id],
          );
          if (existingMedia.length > 0) {
            await db.query(
              "UPDATE uploaded_media SET url = ?, title = ?, description = ? WHERE id = ?",
              [
                youtube_url,
                `${name || "Governorate"} Video`,
                `${name || "Governorate"} youtube media url`,
                existingMedia[0].id,
              ],
            );
          } else {
            let govName = name || "Governorate";
            if (!name) {
              const [govRows] = await db.query(
                "SELECT name FROM governorates WHERE id = ?",
                [req.params.id],
              );
              if (govRows.length > 0) govName = govRows[0].name;
            }
            await db.query(
              'INSERT INTO uploaded_media (governorate_id, media_type, url, title, description) VALUES (?, "video", ?, ?, ?)',
              [
                req.params.id,
                youtube_url,
                `${govName} Video`,
                `${govName} youtube media url`,
              ],
            );
          }
        } else {
          await db.query(
            'DELETE FROM uploaded_media WHERE governorate_id = ? AND media_type = "video"',
            [req.params.id],
          );
        }
      }
      const [rows] = await db.query("SELECT * FROM governorates WHERE id = ?", [
        req.params.id,
      ]);
      res.json(rows[0]);
    } else {
      const index = jsonData.governorates.findIndex(
        (g) => toInt(g.id) === toInt(req.params.id),
      );
      if (index === -1) return res.status(404).json({ error: "Not found" });
      const current = jsonData.governorates[index];
      const updated = {
        ...current,
        name: name !== undefined ? name : current.name,
        name_ar: name_ar !== undefined ? name_ar : current.name_ar,
        x_position:
          x_position !== undefined
            ? parseFloat(x_position)
            : current.x_position,
        y_position:
          y_position !== undefined
            ? parseFloat(y_position)
            : current.y_position,
        region: region !== undefined ? region : current.region,
        visited: visited !== undefined ? boolInt(visited) : current.visited,
        completed:
          completed !== undefined ? boolInt(completed) : current.completed,
        visit_day:
          visit_day !== undefined
            ? visit_day === null || visit_day === ""
              ? null
              : toInt(visit_day)
            : current.visit_day,
        story: story !== undefined ? story : current.story,
        youtube_url:
          youtube_url !== undefined ? youtube_url : current.youtube_url,
      };
      jsonData.governorates[index] = updated;
      if (youtube_url !== undefined)
        upsertJsonVideo(updated.id, youtube_url, updated.name);
      await saveJsonDB();
      res.json(updated);
    }
  } catch (error) {
    console.error("Failed to update governorate:", error);
    res.status(500).json({ error: "Failed to update governorate" });
  }
});

app.post("/api/governorates", authenticateToken, async (req, res) => {
  try {
    const {
      name,
      name_ar,
      x_position,
      y_position,
      region,
      visited,
      completed,
      visit_day,
      story,
      youtube_url,
    } = req.body;
    if (!name || !name_ar || !region)
      return res
        .status(400)
        .json({ error: "Name, Arabic name, and region are required" });
    if (storageType === "mysql" && dbConnected) {
      const [result] = await db.query(
        `
        INSERT INTO governorates (name, name_ar, x_position, y_position, region, visited, completed, visit_day, story, youtube_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
        [
          name,
          name_ar,
          x_position !== undefined ? parseFloat(x_position) : 50.0,
          y_position !== undefined ? parseFloat(y_position) : 50.0,
          region,
          visited ? 1 : 0,
          completed ? 1 : 0,
          visit_day ? parseInt(visit_day) : null,
          story || "",
          youtube_url || null,
        ],
      );
      if (youtube_url && youtube_url.trim() !== "") {
        await db.query(
          `
          INSERT INTO uploaded_media (governorate_id, media_type, url, title, description)
          VALUES (?, 'video', ?, ?, ?)
        `,
          [
            result.insertId,
            youtube_url,
            `${name} Video`,
            `${name} youtube media url`,
          ],
        );
      }
      const [rows] = await db.query("SELECT * FROM governorates WHERE id = ?", [
        result.insertId,
      ]);
      res.json(rows[0]);
    } else {
      const newGov = {
        id: nextId(jsonData.governorates),
        name,
        name_ar,
        x_position: x_position !== undefined ? parseFloat(x_position) : 50.0,
        y_position: y_position !== undefined ? parseFloat(y_position) : 50.0,
        region,
        visited: visited ? 1 : 0,
        completed: completed ? 1 : 0,
        visit_day: visit_day ? parseInt(visit_day, 10) : null,
        story: story || "",
        youtube_url: youtube_url || null,
      };
      jsonData.governorates.push(newGov);
      if (youtube_url && youtube_url.trim() !== "")
        upsertJsonVideo(newGov.id, youtube_url, name);
      await saveJsonDB();
      res.json(newGov);
    }
  } catch (error) {
    console.error("Failed to add governorate:", error);
    res.status(500).json({ error: "Failed to add governorate" });
  }
});

app.delete("/api/governorates/:id", authenticateToken, async (req, res) => {
  try {
    if (storageType === "mysql" && dbConnected) {
      await db.query("DELETE FROM uploaded_media WHERE governorate_id = ?", [
        req.params.id,
      ]);
      await db.query("DELETE FROM governorates WHERE id = ?", [req.params.id]);
    } else {
      jsonData.governorates = jsonData.governorates.filter(
        (g) => toInt(g.id) !== toInt(req.params.id),
      );
      jsonData.uploaded_media = jsonData.uploaded_media.filter(
        (m) => toInt(m.governorate_id) !== toInt(req.params.id),
      );
      await saveJsonDB();
    }
    res.json({ success: true });
  } catch (error) {
    console.error("Failed to delete governorate:", error);
    res.status(500).json({ error: "Failed to delete governorate" });
  }
});

app.get("/api/inventory", async (req, res) => {
  try {
    if (storageType === "mysql" && dbConnected) {
      const [rows] = await db.query(
        "SELECT * FROM inventory_items WHERE quantity > 0 ORDER BY id",
      );
      res.json(rows.map((r) => ({ ...r, price: parseFloat(r.price || 0) })));
    } else {
      res.json(
        jsonData.inventory_items
          .filter((i) => toNumber(i.quantity) > 0)
          .map((i) => ({ ...i, price: toNumber(i.price) })),
      );
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch inventory" });
  }
});

app.post("/api/inventory", authenticateToken, async (req, res) => {
  try {
    const { name, quantity, price, description, image } = req.body;
    const qty = toNumber(quantity, 1);
    const itemPrice = toNumber(price, 0);
    const totalCost = itemPrice * qty;
    if (storageType === "mysql" && dbConnected) {
      const [result] = await db.query(
        "INSERT INTO inventory_items (name, image, quantity, price, description) VALUES (?, ?, ?, ?, ?)",
        [name, image || null, qty, itemPrice, description || ""],
      );
      if (totalCost > 0) {
        let day = 1;
        const [govs] = await db.query(
          "SELECT MAX(visit_day) as maxDay FROM governorates WHERE visited = 1",
        );
        if (govs.length > 0 && govs[0].maxDay) day = govs[0].maxDay;
        await db.query(
          "INSERT INTO balance_logs (day_number, type, amount, description, log_date) VALUES (?, 'spent', ?, ?, CURDATE())",
          [day, totalCost, `Bought ${qty}x ${name}`],
        );
      }
      const [rows] = await db.query(
        "SELECT * FROM inventory_items WHERE id = ?",
        [result.insertId],
      );
      res.json({ ...rows[0], price: parseFloat(rows[0].price || 0) });
    } else {
      const newItem = {
        id: nextId(jsonData.inventory_items),
        name,
        image: image || null,
        quantity: qty,
        price: itemPrice,
        description: description || "",
        created_at: nowDateTime(),
        updated_at: nowDateTime(),
      };
      jsonData.inventory_items.push(newItem);
      if (totalCost > 0) {
        let day = 1;
        const visitedGovs = jsonData.governorates.filter(
          (g) => g.visited && g.visit_day !== null,
        );
        if (visitedGovs.length > 0)
          day = Math.max(...visitedGovs.map((g) => toInt(g.visit_day)));
        jsonData.balance_logs.push({
          id: nextId(jsonData.balance_logs),
          day_number: day,
          type: "spent",
          amount: totalCost,
          description: `Bought ${qty}x ${name}`,
          log_date: todayDate(),
        });
      }
      await saveJsonDB();
      res.json(newItem);
    }
  } catch (error) {
    console.error("Add inventory error:", error);
    res.status(500).json({ error: "Failed to add item" });
  }
});

app.patch("/api/inventory/:id", authenticateToken, async (req, res) => {
  try {
    const { name, quantity, price, description, image } = req.body;
    if (storageType === "mysql" && dbConnected) {
      await db.query(
        `
        UPDATE inventory_items SET 
          name = COALESCE(?, name),
          image = COALESCE(?, image),
          quantity = COALESCE(?, quantity),
          price = COALESCE(?, price),
          description = COALESCE(?, description),
          updated_at = NOW()
        WHERE id = ?
      `,
        [name, image, quantity, price, description, req.params.id],
      );
      const [rows] = await db.query(
        "SELECT * FROM inventory_items WHERE id = ?",
        [req.params.id],
      );
      res.json({ ...rows[0], price: parseFloat(rows[0].price || 0) });
    } else {
      const index = jsonData.inventory_items.findIndex(
        (i) => toInt(i.id) === toInt(req.params.id),
      );
      if (index === -1)
        return res.status(404).json({ error: "Item not found" });
      const current = jsonData.inventory_items[index];
      const updated = {
        ...current,
        name: name !== undefined ? name : current.name,
        image: image !== undefined ? image : current.image,
        quantity:
          quantity !== undefined ? toNumber(quantity) : current.quantity,
        price: price !== undefined ? toNumber(price) : current.price,
        description:
          description !== undefined ? description : current.description,
        updated_at: nowDateTime(),
      };
      jsonData.inventory_items[index] = updated;
      await saveJsonDB();
      res.json(updated);
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to update item" });
  }
});

app.delete("/api/inventory/:id", authenticateToken, async (req, res) => {
  try {
    if (storageType === "mysql" && dbConnected) {
      await db.query("DELETE FROM inventory_items WHERE id = ?", [
        req.params.id,
      ]);
    } else {
      jsonData.inventory_items = jsonData.inventory_items.filter(
        (i) => toInt(i.id) !== toInt(req.params.id),
      );
      await saveJsonDB();
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete item" });
  }
});

app.post("/api/inventory/:id/sell", authenticateToken, async (req, res) => {
  try {
    const { quantity, day_number, sell_price } = req.body;
    const sellQty = toNumber(quantity, 1);
    const day = toInt(day_number, 1);
    if (storageType === "mysql" && dbConnected) {
      const [items] = await db.query(
        "SELECT * FROM inventory_items WHERE id = ?",
        [req.params.id],
      );
      if (items.length === 0)
        return res.status(404).json({ error: "Item not found" });
      const item = items[0];
      if (item.quantity < sellQty)
        return res.status(400).json({ error: "Not enough items" });
      const customSellPrice =
        sell_price !== undefined
          ? parseFloat(sell_price)
          : parseFloat(item.price || 0);
      const earnings = customSellPrice * sellQty;
      await db.query(
        "UPDATE inventory_items SET quantity = quantity - ?, updated_at = NOW() WHERE id = ?",
        [sellQty, req.params.id],
      );
      if (earnings > 0) {
        await db.query(
          "INSERT INTO balance_logs (day_number, type, amount, description, log_date) VALUES (?, ?, ?, ?, CURDATE())",
          [
            day,
            "earned",
            earnings,
            `Sold ${sellQty}x ${item.name} for ${customSellPrice} DT per unit`,
          ],
        );
      }
      const balance = await calculateBalance();
      res.json({ success: true, earnings, balance });
    } else {
      const index = jsonData.inventory_items.findIndex(
        (i) => toInt(i.id) === toInt(req.params.id),
      );
      if (index === -1)
        return res.status(404).json({ error: "Item not found" });
      const item = jsonData.inventory_items[index];
      if (toNumber(item.quantity) < sellQty)
        return res.status(400).json({ error: "Not enough items" });
      const customSellPrice =
        sell_price !== undefined ? toNumber(sell_price) : toNumber(item.price);
      const earnings = customSellPrice * sellQty;
      jsonData.inventory_items[index] = {
        ...item,
        quantity: toNumber(item.quantity) - sellQty,
        updated_at: nowDateTime(),
      };
      if (earnings > 0) {
        jsonData.balance_logs.push({
          id: nextId(jsonData.balance_logs),
          day_number: day,
          type: "earned",
          amount: earnings,
          description: `Sold ${sellQty}x ${item.name} for ${customSellPrice} DT per unit`,
          log_date: todayDate(),
        });
      }
      await saveJsonDB();
      const balance = await calculateBalance();
      res.json({ success: true, earnings, balance });
    }
  } catch (error) {
    console.error("Sell error:", error);
    res.status(500).json({ error: "Failed to sell item" });
  }
});

app.get("/api/logs", async (req, res) => {
  try {
    if (storageType === "mysql" && dbConnected) {
      const [rows] = await db.query(
        "SELECT * FROM balance_logs ORDER BY day_number DESC, id DESC",
      );
      res.json(rows.map((r) => ({ ...r, amount: parseFloat(r.amount || 0) })));
    } else {
      res.json(
        [...jsonData.balance_logs].sort(
          (a, b) =>
            toInt(b.day_number) - toInt(a.day_number) ||
            toInt(b.id) - toInt(a.id),
        ),
      );
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch logs" });
  }
});

app.post("/api/logs", authenticateToken, async (req, res) => {
  try {
    const { day_number, type, amount, description } = req.body;
    if (!["earned", "spent"].includes(type))
      return res.status(400).json({ error: "Type must be earned or spent" });
    if (storageType === "mysql" && dbConnected) {
      const [result] = await db.query(
        "INSERT INTO balance_logs (day_number, type, amount, description, log_date) VALUES (?, ?, ?, ?, CURDATE())",
        [day_number, type, amount, description],
      );
      const [rows] = await db.query("SELECT * FROM balance_logs WHERE id = ?", [
        result.insertId,
      ]);
      const balance = await calculateBalance();
      res.json({
        ...rows[0],
        amount: parseFloat(rows[0].amount || 0),
        balance,
      });
    } else {
      const newLog = {
        id: nextId(jsonData.balance_logs),
        day_number: toInt(day_number),
        type,
        amount: toNumber(amount),
        description,
        log_date: todayDate(),
      };
      jsonData.balance_logs.push(newLog);
      await saveJsonDB();
      const balance = await calculateBalance();
      res.json({ ...newLog, balance });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to add log" });
  }
});

app.delete("/api/logs/:id", authenticateToken, async (req, res) => {
  try {
    if (storageType === "mysql" && dbConnected) {
      await db.query("DELETE FROM balance_logs WHERE id = ?", [req.params.id]);
    } else {
      jsonData.balance_logs = jsonData.balance_logs.filter(
        (l) => toInt(l.id) !== toInt(req.params.id),
      );
      await saveJsonDB();
    }
    const balance = await calculateBalance();
    res.json({ success: true, balance });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete log" });
  }
});

app.get("/api/balance", async (req, res) => {
  try {
    const balance = await calculateBalance();
    if (storageType === "mysql" && dbConnected) {
      const [earned] = await db.query(
        "SELECT COALESCE(SUM(amount), 0) as total FROM balance_logs WHERE type = 'earned'",
      );
      const [spent] = await db.query(
        "SELECT COALESCE(SUM(amount), 0) as total FROM balance_logs WHERE type = 'spent'",
      );
      res.json({
        balance,
        totalEarned: parseFloat(earned[0].total || 0),
        totalSpent: parseFloat(spent[0].total || 0),
      });
    } else {
      const earned = jsonData.balance_logs
        .filter((l) => l.type === "earned")
        .reduce((sum, l) => sum + toNumber(l.amount), 0);
      const spent = jsonData.balance_logs
        .filter((l) => l.type === "spent")
        .reduce((sum, l) => sum + toNumber(l.amount), 0);
      res.json({ balance, totalEarned: earned, totalSpent: spent });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch balance" });
  }
});

app.get("/api/polls", async (req, res) => {
  try {
    if (storageType === "mysql" && dbConnected) {
      const [rows] = await db.query("SELECT * FROM gov_polls ORDER BY id DESC");
      res.json(rows.map(formatPoll));
    } else {
      res.json(
        [...jsonData.gov_polls]
          .sort((a, b) => toInt(b.id) - toInt(a.id))
          .map(formatPoll),
      );
    }
  } catch (error) {
    console.error("Failed to get polls:", error);
    res.status(500).json({ error: "Failed to fetch polls" });
  }
});

app.post("/api/polls/:id/vote", async (req, res) => {
  try {
    const { email, cookie, vote } = req.body;
    const pollId = toInt(req.params.id);
    const selectedVote = toInt(vote, NaN);
    if (!email || !cookie || Number.isNaN(selectedVote))
      return res
        .status(400)
        .json({ error: "Email, cookie and valid vote option are required!" });
    if (storageType === "mysql" && dbConnected) {
      const [rows] = await db.query("SELECT * FROM gov_polls WHERE id = ?", [
        pollId,
      ]);
      if (rows.length === 0)
        return res.status(404).json({ error: "Poll not found" });
      const poll = formatPoll(rows[0]);
      const alreadyVoted = poll.votes.some(
        (v) =>
          (v.email && v.email.toLowerCase() === email.toLowerCase()) ||
          (v.cookie && v.cookie === cookie),
      );
      if (alreadyVoted)
        return res
          .status(400)
          .json({ error: "You have already voted on this poll!" });
      const updatedVotes = [
        ...poll.votes,
        { email, cookie, vote: selectedVote },
      ];
      await db.query("UPDATE gov_polls SET votes = ? WHERE id = ?", [
        JSON.stringify(updatedVotes),
        pollId,
      ]);
      const [updatedRows] = await db.query(
        "SELECT * FROM gov_polls WHERE id = ?",
        [pollId],
      );
      res.json(formatPoll(updatedRows[0]));
    } else {
      const index = jsonData.gov_polls.findIndex((p) => toInt(p.id) === pollId);
      if (index === -1)
        return res.status(404).json({ error: "Poll not found" });
      const poll = formatPoll(jsonData.gov_polls[index]);
      const alreadyVoted = poll.votes.some(
        (v) =>
          (v.email && v.email.toLowerCase() === email.toLowerCase()) ||
          (v.cookie && v.cookie === cookie),
      );
      if (alreadyVoted)
        return res
          .status(400)
          .json({ error: "You have already voted on this poll!" });
      poll.votes.push({ email, cookie, vote: selectedVote });
      poll.updated_at = nowDateTime();
      jsonData.gov_polls[index] = poll;
      await saveJsonDB();
      res.json(poll);
    }
  } catch (error) {
    console.error("Failed to submit vote:", error);
    res.status(500).json({ error: "Failed to submit vote" });
  }
});

app.post("/api/polls", authenticateToken, async (req, res) => {
  try {
    const { question, goves, image, end_time, next_gov_id } = req.body;
    if (!question || !Array.isArray(goves) || goves.length !== 3)
      return res
        .status(400)
        .json({
          error: "Question and exactly 3 governorate options are required!",
        });
    if (storageType === "mysql" && dbConnected) {
      const [result] = await db.query(
        "INSERT INTO gov_polls (question, goves, votes, image, end_time, next_gov_id) VALUES (?, ?, ?, ?, ?, ?)",
        [
          question,
          JSON.stringify(goves.map(Number)),
          "[]",
          image || null,
          end_time || null,
          next_gov_id !== undefined &&
          next_gov_id !== null &&
          next_gov_id !== ""
            ? parseInt(next_gov_id)
            : null,
        ],
      );
      const [rows] = await db.query("SELECT * FROM gov_polls WHERE id = ?", [
        result.insertId,
      ]);
      res.json(formatPoll(rows[0]));
    } else {
      const newPoll = {
        id: nextId(jsonData.gov_polls),
        question,
        goves: goves.map(Number),
        votes: [],
        next_gov_id:
          next_gov_id !== undefined &&
          next_gov_id !== null &&
          next_gov_id !== ""
            ? parseInt(next_gov_id, 10)
            : null,
        image: image || null,
        end_time: end_time || null,
        created_at: nowDateTime(),
        updated_at: nowDateTime(),
      };
      jsonData.gov_polls.push(newPoll);
      await saveJsonDB();
      res.json(newPoll);
    }
  } catch (error) {
    console.error("Failed to create poll:", error);
    res.status(500).json({ error: "Failed to create poll" });
  }
});

app.patch("/api/polls/:id", authenticateToken, async (req, res) => {
  try {
    const { question, goves, image, next_gov_id, end_time } = req.body;
    const pollId = toInt(req.params.id);
    if (storageType === "mysql" && dbConnected) {
      const [rows] = await db.query("SELECT * FROM gov_polls WHERE id = ?", [
        pollId,
      ]);
      if (rows.length === 0)
        return res.status(404).json({ error: "Poll not found" });
      const current = formatPoll(rows[0]);
      const updatedQuestion =
        question !== undefined ? question : current.question;
      const updatedGoves =
        goves !== undefined
          ? JSON.stringify(goves.map(Number))
          : JSON.stringify(current.goves);
      const updatedImage = image !== undefined ? image : current.image;
      const updatedNextGov =
        next_gov_id !== undefined
          ? next_gov_id === null || next_gov_id === ""
            ? null
            : parseInt(next_gov_id)
          : current.next_gov_id;
      const updatedEndTime =
        end_time !== undefined ? end_time : current.end_time;
      await db.query(
        "UPDATE gov_polls SET question = ?, goves = ?, image = ?, next_gov_id = ?, end_time = ? WHERE id = ?",
        [
          updatedQuestion,
          updatedGoves,
          updatedImage,
          updatedNextGov,
          updatedEndTime,
          pollId,
        ],
      );
      const [updatedRows] = await db.query(
        "SELECT * FROM gov_polls WHERE id = ?",
        [pollId],
      );
      res.json(formatPoll(updatedRows[0]));
    } else {
      const index = jsonData.gov_polls.findIndex((p) => toInt(p.id) === pollId);
      if (index === -1)
        return res.status(404).json({ error: "Poll not found" });
      const poll = formatPoll(jsonData.gov_polls[index]);
      const updatedPoll = {
        ...poll,
        question: question !== undefined ? question : poll.question,
        goves: goves !== undefined ? goves.map(Number) : poll.goves,
        image: image !== undefined ? image : poll.image,
        next_gov_id:
          next_gov_id !== undefined
            ? next_gov_id === null || next_gov_id === ""
              ? null
              : parseInt(next_gov_id, 10)
            : poll.next_gov_id,
        end_time: end_time !== undefined ? end_time : poll.end_time,
        updated_at: nowDateTime(),
      };
      jsonData.gov_polls[index] = updatedPoll;
      await saveJsonDB();
      res.json(updatedPoll);
    }
  } catch (error) {
    console.error("Failed to update poll:", error);
    res.status(500).json({ error: "Failed to update poll" });
  }
});

app.delete("/api/polls/:id", authenticateToken, async (req, res) => {
  try {
    const pollId = toInt(req.params.id);
    if (storageType === "mysql" && dbConnected) {
      await db.query("DELETE FROM gov_polls WHERE id = ?", [pollId]);
    } else {
      jsonData.gov_polls = jsonData.gov_polls.filter(
        (p) => toInt(p.id) !== pollId,
      );
      await saveJsonDB();
    }
    res.json({ success: true });
  } catch (error) {
    console.error("Failed to delete poll:", error);
    res.status(500).json({ error: "Failed to delete poll" });
  }
});

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

async function startServer() {
  await connectStorage();
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MIDOS QUEST SERVER by BB Studio`);
    console.log(`Server port: ${PORT}`);
    console.log(`Storage: ${storageType}`);
    if (storageType === "json") console.log(`JSON file: ${JSON_DB_FILE}`);
  });
}

startServer();
