import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 3000;

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

interface ClubData {
  updated_at: string;
  members: any[];
  posts: any[];
}

interface MembersData {
  updated_at?: string;
  members: any[];
}

const DATA_FILE = path.resolve(process.cwd(), 'src/data/club_db.json');
const MEMBERS_FILE = path.resolve(process.cwd(), 'src/data/members_db.json');

// Helper to safely read JSON file
function readJsonFile<T>(filePath: string, fallback: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
  }
  return fallback;
}

// Helper to safely write JSON file
function writeJsonFile<T>(filePath: string, data: T): boolean {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
    return false;
  }
}

// 1. Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', serverTime: new Date().toISOString() });
});

// 2. Comprehensive Sync endpoint: Members + Posts combined
app.get('/api/sync', (req: Request, res: Response) => {
  const db = readJsonFile<ClubData>(DATA_FILE, {
    updated_at: new Date().toISOString(),
    members: [],
    posts: [],
  });
  res.json(db);
});

app.post('/api/sync', (req: Request, res: Response) => {
  const { members, posts } = req.body;
  const currentDb = readJsonFile<ClubData>(DATA_FILE, {
    updated_at: new Date().toISOString(),
    members: [],
    posts: [],
  });
  
  const updatedDb: ClubData = {
    updated_at: new Date().toISOString(),
    members: Array.isArray(members) ? members : currentDb.members,
    posts: Array.isArray(posts) ? posts : currentDb.posts,
  };

  writeJsonFile(DATA_FILE, updatedDb);
  
  if (Array.isArray(members)) {
    writeJsonFile(MEMBERS_FILE, { updated_at: updatedDb.updated_at, members });
  }

  res.json({
    success: true,
    membersCount: updatedDb.members.length,
    postsCount: updatedDb.posts.length,
    updated_at: updatedDb.updated_at,
  });
});

// 3. Members DB endpoints (read/write)
app.get('/api/members', (req: Request, res: Response) => {
  const clubDb = readJsonFile<Partial<ClubData>>(DATA_FILE, {});
  if (clubDb.members && Array.isArray(clubDb.members)) {
    res.json({ members: clubDb.members, updated_at: clubDb.updated_at });
    return;
  }
  const data = readJsonFile<MembersData>(MEMBERS_FILE, { members: [] });
  res.json(data);
});

app.post('/api/members', (req: Request, res: Response) => {
  const { members } = req.body;
  if (!Array.isArray(members)) {
    res.status(400).json({ error: 'members must be an array' });
    return;
  }
  const payload = {
    updated_at: new Date().toISOString(),
    members,
  };
  writeJsonFile(MEMBERS_FILE, payload);

  const clubDb = readJsonFile<ClubData>(DATA_FILE, {
    updated_at: payload.updated_at,
    members: [],
    posts: [],
  });
  clubDb.members = members;
  clubDb.updated_at = payload.updated_at;
  writeJsonFile(DATA_FILE, clubDb);

  res.json({ success: true, count: members.length });
});

app.post('/api/members/item', (req: Request, res: Response) => {
  const member = req.body;
  if (!member || !member.id) {
    res.status(400).json({ error: 'member with id is required' });
    return;
  }
  const clubDb = readJsonFile<ClubData>(DATA_FILE, {
    updated_at: new Date().toISOString(),
    members: [],
    posts: [],
  });

  const existingIdx = clubDb.members.findIndex((m) => m.id === member.id);
  if (existingIdx >= 0) {
    clubDb.members[existingIdx] = member;
  } else {
    clubDb.members.push(member);
  }
  clubDb.updated_at = new Date().toISOString();
  writeJsonFile(DATA_FILE, clubDb);

  const membersData = readJsonFile<MembersData>(MEMBERS_FILE, { members: [] });
  const mIdx = (membersData.members || []).findIndex((m: any) => m.id === member.id);
  if (mIdx >= 0) {
    membersData.members[mIdx] = member;
  } else {
    membersData.members = [...(membersData.members || []), member];
  }
  membersData.updated_at = clubDb.updated_at;
  writeJsonFile(MEMBERS_FILE, membersData);

  res.json({ success: true, member });
});

app.delete('/api/members/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const clubDb = readJsonFile<ClubData>(DATA_FILE, {
    updated_at: new Date().toISOString(),
    members: [],
    posts: [],
  });
  clubDb.members = (clubDb.members || []).filter((m) => m.id !== id);
  clubDb.updated_at = new Date().toISOString();
  writeJsonFile(DATA_FILE, clubDb);

  const membersData = readJsonFile<MembersData>(MEMBERS_FILE, { members: [] });
  membersData.members = (membersData.members || []).filter((m: any) => m.id !== id);
  membersData.updated_at = clubDb.updated_at;
  writeJsonFile(MEMBERS_FILE, membersData);

  res.json({ success: true });
});

// 4. Posts DB endpoints (read/write & delete)
app.get('/api/posts', (req: Request, res: Response) => {
  const clubDb = readJsonFile<ClubData>(DATA_FILE, {
    updated_at: new Date().toISOString(),
    members: [],
    posts: [],
  });
  res.json({ posts: clubDb.posts || [], updated_at: clubDb.updated_at });
});

app.post('/api/posts', (req: Request, res: Response) => {
  const post = req.body;
  if (!post || !post.id) {
    res.status(400).json({ error: 'post with id is required' });
    return;
  }
  const clubDb = readJsonFile<ClubData>(DATA_FILE, {
    updated_at: new Date().toISOString(),
    members: [],
    posts: [],
  });

  const existingIdx = clubDb.posts.findIndex((p) => p.id === post.id);
  if (existingIdx >= 0) {
    clubDb.posts[existingIdx] = post;
  } else {
    clubDb.posts.unshift(post);
  }
  clubDb.updated_at = new Date().toISOString();
  writeJsonFile(DATA_FILE, clubDb);

  res.json({ success: true, post, totalPosts: clubDb.posts.length });
});

app.delete('/api/posts/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const clubDb = readJsonFile<ClubData>(DATA_FILE, {
    updated_at: new Date().toISOString(),
    members: [],
    posts: [],
  });
  clubDb.posts = clubDb.posts.filter((p) => p.id !== id);
  clubDb.updated_at = new Date().toISOString();
  writeJsonFile(DATA_FILE, clubDb);
  res.json({ success: true });
});

// 5. Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`MAKS Squash Server running at http://0.0.0.0:${port}`);
  });
}

startServer();
