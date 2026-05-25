import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Elevate request limit to support large HTML games upload/paste
  app.use(express.json({ limit: '100mb' }));
  app.use(express.urlencoded({ limit: '100mb', extended: true }));

  // Ensure directories exist
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const DEFAULT_GAMES = [
    {
      "id": "builtin-cookie-clicker",
      "title": "Cookie Clicker",
      "description": "The legendary clicking game. Click the giant cookie, hire grandma baking empires, and purchase endless sweet upgrades!",
      "category": "Arcade",
      "instructions": "Click the giant cookie on the left as fast as you can. Use your cookies to purchase grandmas, farms, and factories on the right side of the screen to automate your baking!",
      "iframeUrl": "https://cookieclickers.io/the-game/",
      "isCustom": false,
      "hasLocalHtml": false,
      "createdAt": "2026-05-25T12:55:00.000Z"
    },
    {
      "id": "builtin-doom",
      "title": "Doom (MS-DOS)",
      "description": "The legendary 1993 demon-slaying shooter running directly inside a vintage DOSBox console wrapper.",
      "category": "Retro",
      "instructions": "Click inside the console frame to capture your cursor. Use your Arrow keys to move, Control to fire weapons, Alt to strafe, and Space to open doors.",
      "iframeUrl": "https://classicreload.com/dosbox-java-applet-doom-classic.html",
      "isCustom": false,
      "hasLocalHtml": false,
      "createdAt": "2026-05-25T12:50:00.000Z"
    },
    {
      "id": "builtin-2048",
      "title": "2048",
      "description": "The addictive sliding tile puzzle game. Join the numbers and get to the 2048 tile!",
      "category": "Puzzle",
      "instructions": "Use your Arrow keys or swipe gestures to move the tiles. When two tiles with the same number touch, they merge into one!",
      "iframeUrl": "https://play2048.co/",
      "isCustom": false,
      "hasLocalHtml": false,
      "createdAt": "2026-05-25T12:00:00.000Z"
    },
    {
      "id": "builtin-pacman",
      "title": "Retro Pac-Man Cabinet",
      "description": "Original arcade cabinet implementation of the legendary pellet-munching maze game.",
      "category": "Arcade",
      "instructions": "Click inside the arcade frame to click Start, then use your Arrow Keys to guide Pac-Man away from the colorful ghosts.",
      "iframeUrl": "https://archive.org/embed/arcade_pacman",
      "isCustom": false,
      "hasLocalHtml": false,
      "createdAt": "2026-05-25T12:01:00.000Z"
    },
    {
      "id": "builtin-space-invaders",
      "title": "Space Invaders",
      "description": "The classic fixed shooter vintage game. Defend Earth from rows of invading alien forces.",
      "category": "Arcade",
      "instructions": "Use Left and Right Arrow keys or cursor drag to steer. Press Spacebar to fire your lasers.",
      "iframeUrl": "https://freeinvaders.org/",
      "isCustom": false,
      "hasLocalHtml": false,
      "createdAt": "2026-05-25T12:02:00.000Z"
    },
    {
      "id": "builtin-v8-linux",
      "title": "Sandbox Linux Console",
      "description": "Complete terminal environment running a virtualized x86 emulator with live networking inside the browser.",
      "category": "Sandbox",
      "instructions": "Wait for the boot sequence to complete, then type standard Linux CLI shell inputs (such as cat, ls, top, or cal) to execute.",
      "iframeUrl": "https://bellard.org/jslinux/",
      "isCustom": false,
      "hasLocalHtml": false,
      "createdAt": "2026-05-25T12:03:00.000Z"
    }
  ];

  const gamesFilePath = path.join(process.cwd(), 'src', 'games.json');
  let initializeWithDefaults = true;
  if (fs.existsSync(gamesFilePath)) {
    try {
      const existingData = fs.readFileSync(gamesFilePath, 'utf-8').trim();
      const parsed = JSON.parse(existingData);
      if (Array.isArray(parsed) && parsed.length > 0) {
        initializeWithDefaults = false;
      }
    } catch (_) {}
  }

  if (initializeWithDefaults) {
    try {
      fs.writeFileSync(gamesFilePath, JSON.stringify(DEFAULT_GAMES, null, 2), 'utf-8');
    } catch (err) {
      console.warn("Could not write initial games.json file. Running with in-memory fallback list.", err);
    }
  }

  // Serve static uploads folder immediately under /uploads/
  app.use('/uploads', express.static(uploadsDir));

  // GET /api/games — Get all registered games from the permanent registry
  app.get('/api/games', (req, res) => {
    try {
      if (fs.existsSync(gamesFilePath)) {
        const data = fs.readFileSync(gamesFilePath, 'utf-8');
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return res.json(parsed);
        }
      }
      res.json(DEFAULT_GAMES);
    } catch (err) {
      console.error('Error reading games.json, returning default in-memory list:', err);
      res.json(DEFAULT_GAMES);
    }
  });

  // POST /api/games — Add a game to the permanent registry (URLs or Local HTML files)
  app.post('/api/games', (req, res) => {
    try {
      const { title, description, category, instructions, iframeUrl, htmlContent } = req.body;
      
      if (!title || !category || (!iframeUrl && !htmlContent)) {
        return res.status(400).json({ error: 'Title, category, and source (URL or HTML) are required.' });
      }

      const gameId = `game-${Date.now()}`;
      let finalIframeUrl = iframeUrl;

      // If local HTML upload or paste is provided
      if (htmlContent) {
        const fileName = `${gameId}.html`;
        const filePath = path.join(uploadsDir, fileName);
        fs.writeFileSync(filePath, htmlContent, 'utf-8');
        finalIframeUrl = `/uploads/${fileName}`;
      }

      const newGame = {
        id: gameId,
        title,
        description,
        category,
        instructions: instructions || '',
        iframeUrl: finalIframeUrl,
        isCustom: true,
        hasLocalHtml: !!htmlContent,
        createdAt: new Date().toISOString()
      };

      let games = [];
      try {
        if (fs.existsSync(gamesFilePath)) {
          const originalData = fs.readFileSync(gamesFilePath, 'utf-8');
          games = JSON.parse(originalData);
        } else {
          games = [...DEFAULT_GAMES];
        }
      } catch (_) {
        games = [...DEFAULT_GAMES];
      }
      
      games.unshift(newGame);
      
      try {
        fs.writeFileSync(gamesFilePath, JSON.stringify(games, null, 2), 'utf-8');
      } catch (err) {
        console.warn("Could not save new game to games.json file", err);
      }

      res.status(201).json(newGame);
    } catch (err) {
      console.error('Error adding game:', err);
      res.status(500).json({ error: 'Failed to write game data' });
    }
  });

  // DELETE /api/games/:id — Delete a game from the permanent registry
  app.delete('/api/games/:id', (req, res) => {
    try {
      const { id } = req.params;
      
      let games = [];
      try {
        if (fs.existsSync(gamesFilePath)) {
          const originalData = fs.readFileSync(gamesFilePath, 'utf-8');
          games = JSON.parse(originalData);
        } else {
          games = [...DEFAULT_GAMES];
        }
      } catch (_) {
        games = [...DEFAULT_GAMES];
      }

      const gameToDelete = games.find((g: any) => g.id === id);
      if (gameToDelete && gameToDelete.hasLocalHtml) {
        // Clean up HTML file if it's stored locally
        const fileName = `${id}.html`;
        const filePath = path.join(uploadsDir, fileName);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      games = games.filter((g: any) => g.id !== id);
      
      try {
        fs.writeFileSync(gamesFilePath, JSON.stringify(games, null, 2), 'utf-8');
      } catch (err) {
        console.warn("Could not write deleted registry state to games.json file", err);
      }

      res.json({ success: true, message: 'Game deleted successfully' });
    } catch (err) {
      console.error('Error deleting game:', err);
      res.status(500).json({ error: 'Failed to unregister game' });
    }
  });

  // Vite middleware for development vs static client serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
