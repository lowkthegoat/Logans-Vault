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

  const gamesFilePath = path.join(process.cwd(), 'src', 'games.json');
  if (!fs.existsSync(gamesFilePath)) {
    fs.writeFileSync(gamesFilePath, JSON.stringify([], null, 2), 'utf-8');
  }

  // Serve static uploads folder immediately under /uploads/
  app.use('/uploads', express.static(uploadsDir));

  // GET /api/games — Get all registered games from the permanent registry
  app.get('/api/games', (req, res) => {
    try {
      const data = fs.readFileSync(gamesFilePath, 'utf-8');
      res.json(JSON.parse(data));
    } catch (err) {
      console.error('Error reading games.json:', err);
      res.status(500).json({ error: 'Failed to read games' });
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

      const originalData = fs.readFileSync(gamesFilePath, 'utf-8');
      const games = JSON.parse(originalData);
      
      games.unshift(newGame);
      fs.writeFileSync(gamesFilePath, JSON.stringify(games, null, 2), 'utf-8');

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
      const originalData = fs.readFileSync(gamesFilePath, 'utf-8');
      let games = JSON.parse(originalData);

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
      fs.writeFileSync(gamesFilePath, JSON.stringify(games, null, 2), 'utf-8');

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
