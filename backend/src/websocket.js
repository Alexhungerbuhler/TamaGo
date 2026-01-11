import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import * as config from '../config.js';
import User from './models/User.js';
import Tamagotchi from './models/Tamagotchi.js';
import { executeTick } from './api/tick.js';

let io;

// Map pour stocker les utilisateurs connectés
const connectedUsers = new Map();

export function initializeWebSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Middleware d'authentification
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, config.secretKey);
      const user = await User.findById(decoded.sub).exec();
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      socket.userName = user.name;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.userName} (${socket.userId})`);
    
    // Stocker l'utilisateur connecté
    connectedUsers.set(socket.userId, {
      socketId: socket.id,
      userId: socket.userId,
      userName: socket.userName,
      connectedAt: new Date(),
      location: null
    });

    // Envoyer la liste des utilisateurs déjà connectés au nouveau client
    const existingUsers = Array.from(connectedUsers.values())
      .filter(u => u.userId !== socket.userId) // Exclure l'utilisateur qui vient de se connecter
      .map(u => ({
        userId: u.userId,
        userName: u.userName,
        location: u.location
      }));

    socket.emit('users:existing', { users: existingUsers });

    // Notifier tous les clients qu'un utilisateur est en ligne
    io.emit('user:online', {
      userId: socket.userId,
      userName: socket.userName
    });

    // Rejoindre une room personnelle
    socket.join(`user:${socket.userId}`);

    // === ÉVÉNEMENTS ===

    // 1. Rejoindre une zone géographique
    socket.on('location:join', async (data) => {
      try {
        const { latitude, longitude, radius = 1000 } = data;
        console.log(`📍 location:join reçu - lat: ${latitude}, lng: ${longitude}, radius: ${radius}`);
        
        // Vérifier tous les pets dans la DB
        const allPets = await Tamagotchi.find({}).populate('owner', 'name').exec();
        console.log(`📊 Total de pets en DB: ${allPets.length}`);
        allPets.forEach(pet => {
          console.log(`   - ${pet.name} - location: [${pet.location?.coordinates}]`);
        });
        
        const roomName = `geo:${Math.floor(latitude)}:${Math.floor(longitude)}`;
        
        socket.join(roomName);
        socket.currentRoom = roomName;
        
        // Stocker la location de l'utilisateur
        connectedUsers.set(socket.userId, {
          ...connectedUsers.get(socket.userId),
          location: {
            type: 'Point',
            coordinates: [longitude, latitude]
          }
        });
        
        // Récupérer les pets à proximité
        const nearbyPets = await Tamagotchi.find({
          location: {
            $near: {
              $geometry: {
                type: 'Point',
                coordinates: [longitude, latitude]
              },
              $maxDistance: radius
            }
          }
        }).populate('owner', 'name').exec();

        console.log(`✅ Pets trouvés à proximité: ${nearbyPets.length}`);
        nearbyPets.forEach(pet => {
          console.log(`   - ${pet.name} à [${pet.location?.coordinates}]`);
        });

        socket.emit('location:nearby-pets', { pets: nearbyPets });

        // Broadcaster la location de l'utilisateur à TOUT LE MONDE
        io.emit('user:location', {
          userId: socket.userId,
          userName: socket.userName,
          location: {
            type: 'Point',
            coordinates: [longitude, latitude]
          }
        });
      } catch (err) {
        console.error('❌ Erreur location:join:', err);
        socket.emit('error', { message: 'Failed to join location' });
      }
    });

    // 2. Quitter une zone géographique
    socket.on('location:leave', () => {
      if (socket.currentRoom) {
        socket.leave(socket.currentRoom);
        socket.currentRoom = null;
      }
    });

    // 3. Mise à jour de position
    socket.on('location:update', async (data) => {
      try {
        const { petId, latitude, longitude } = data;
        
        const pet = await Tamagotchi.findOne({
          _id: petId,
          owner: socket.userId
        }).exec();

        if (!pet) {
          return socket.emit('error', { message: 'Pet not found or unauthorized' });
        }

        pet.location = {
          type: 'Point',
          coordinates: [longitude, latitude]
        };
        await pet.save();

        // Notifier la room géographique
        if (socket.currentRoom) {
          io.to(socket.currentRoom).emit('pet:moved', {
            petId: pet._id,
            name: pet.name,
            location: { latitude, longitude }
          });
        }
      } catch (err) {
        socket.emit('error', { message: 'Failed to update location' });
      }
    });

    // 4. Notification de pet en mauvais état
    /* socket.on('pet:check-health', async () => {
      try {
        const pets = await Tamagotchi.find({ owner: socket.userId }).exec();
        
        for (const pet of pets) {
          if (pet.health < 30 || pet.hunger > 70 || pet.happiness < 30) {
            socket.emit('pet:alert', {
              petId: pet._id,
              name: pet.name,
              type: pet.health < 30 ? 'health' : pet.hunger > 70 ? 'hunger' : 'happiness',
              message: `${pet.name} needs attention!`,
              stats: {
                health: pet.health,
                hunger: pet.hunger,
                happiness: pet.happiness
              }
            });
          }
        }
      } catch (err) {
        socket.emit('error', { message: 'Failed to check pet health' });
      }
    });
 */
    // 5. Déconnexion
    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.userName}`);
      
      connectedUsers.delete(socket.userId);
      
      // Notifier tous les clients qu'un utilisateur est hors ligne
      io.emit('user:offline', {
        userId: socket.userId,
        userName: socket.userName
      });
    });
  });

  // Système de tick automatique - diminue les stats toutes les 5 minutes
  setInterval(async () => {
    try {
      console.log('🕒 Executing automatic tick (every 5 minutes)...');
      await executeTick();
      console.log('✅ Automatic tick completed');
    } catch (err) {
      console.error('❌ Error during automatic tick:', err);
    }
  }, 300000); // Toutes les 5 minutes (300 secondes)

  return io;
}

// Fonction helper pour émettre des événements depuis l'API REST
export function emitToUser(userId, event, data) {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
}

export function emitToAll(event, data) {
  if (io) {
    io.emit(event, data);
  }
}

export function getOnlineUsers() {
  return Array.from(connectedUsers.values());
}

export { io };
