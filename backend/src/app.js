import 'dotenv/config';
import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import cors from 'cors';
import fs from 'fs';
import yaml from 'js-yaml';
import swaggerUi from 'swagger-ui-express';
import { Server } from 'socket.io';

import apiRouter from './routes/api.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connexion MongoDB
mongoose.connect(process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/tamago')
  .then(async () => {
    console.log('Connected to MongoDB');
  })
  .catch(err => console.error("MongoDB connection error:", err));

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, { /* options */ });

// CORS (optionnel si front et back même domaine sur Render)
app.use(cors({
  origin: process.env.CORS_ORIGIN || true,
  credentials: true
}));

// Swagger (optionnel)
if (fs.existsSync('./openapi.yml')) {
  const openApiDocument = yaml.load(fs.readFileSync('./openapi.yml', 'utf8'));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));
}

app.use(express.json());
app.use('/api', apiRouter);

// Servir le frontend (build Vite)
app.use(express.static(path.join(__dirname, '../dist')));

// Fallback SPA (toutes les routes non-API renvoient index.html)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

// Port Render
const port = process.env.PORT || 8989;

// Lancer le serveur HTTP (et WebSocket si besoin)
if (!process.env.JEST_WORKER_ID) {
  httpServer.listen(port, () => console.log(`HTTP server listening on ${port}`));
  // wsServer.start({ server: httpServer }); // décommente si tu as un wsServer
}

io.on('connection', (socket) => {
  // Gérer la connexion WebSocket
});
export default app;
