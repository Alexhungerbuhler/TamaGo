# TamaGo

A modern Tamagotchi-style virtual pet management application with real-time interactions, built with Vue.js and Express.

**Project:** TamaGo - Virtual Pet Management System  
**Course:** ArchiOWeb - HESSO  
**Year:** 2026

## Deployment Links

- **Render:** [https://tamago.onrender.com](https://tamago-hgwj.onrender.com)
- **GitHub Repository:** [https://github.com/Alexhungerbuhler/TamaGo](https://github.com/Alexhungerbuhler/TamaGo)

## Table of Contents

- [Requirements](#-requirements)
- [Installation](#-installation)
- [Usage](#-usage)
- [Configuration](#-configuration)
- [Deployment](#-deployment)
- [Features](#-features)
- [API & Documentation](#-api--documentation)
- [Course Requirements](#-course-requirements)
- [Testing](#-testing)
- [WebSocket Support](#-websocket-support)
- [Technologies](#-technologies)
- [Team](#-team)

## Requirements

- **Node.js** ≥ 25.x ([Download](https://nodejs.org))
- **npm** ≥ 10.x (included with Node.js)
- **MongoDB** ≥ 8.x ([Installation Guide](https://docs.mongodb.com/manual/installation/))

## Installation

```bash
# Clone the repository
git clone https://github.com/Alexhungerbuhler/TamaGo.git
cd TamaGo

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

## Usage

### Development

```bash
# Terminal 1 - Backend (API + WebSocket)
cd backend
npm start

# Terminal 2 - Frontend (Vite dev server)
cd frontend
npm run dev
```

**Access the application:**
- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend API: [http://localhost:3000](http://localhost:3000)

### Production

```bash
# Build frontend
cd frontend
npm run build

# Start backend
cd ../backend
npm start
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm start` (backend) | Start the backend server |
| `npm test` (backend) | Run automated tests |
| `npm run dev` (frontend) | Start Vite dev server |
| `npm run build` (frontend) | Build for production |
| `npm run preview` (frontend) | Preview production build |

## Configuration

Create `.env` files in both `backend/` and `frontend/` directories:

**Backend (.env):**

```env
BACKEND_PORT=3000
MONGODB_URI=mongodb://localhost:27017/tamago
JWT_SECRET=your-secret-key-change-this-in-production
NODE_ENV=development
UPLOAD_DIR=uploads
```

**Frontend (.env):**

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_WS_URL=http://localhost:3000
```

<details>
<summary><strong>Environment Variables Reference</strong></summary>

**Backend Variables:**

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port | `3000` | No |
| `MONGODB_URI` | MongoDB connection URL | `mongodb://localhost:27017/tamago` | ✅ |
| `JWT_SECRET` | Secret key for JWT tokens | - | ✅ |
| `NODE_ENV` | Environment mode | `development` | No |
| `UPLOAD_DIR` | Directory for uploaded images | `uploads` | No |

**Frontend Variables:**

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_API_BASE_URL` | Backend API URL | `http://localhost:3000/api` | ✅ |
| `VITE_WS_URL` | WebSocket server URL | `http://localhost:3000` | ✅ |

</details>

## Deployment

### Deployment (Render)

1. Push your code to GitHub
2. Create a new Web Service on [Render](https://render.com)
3. Connect your GitHub repository
4. Configure the service:
   - **Build Command:** `cd frontend && npm install && npm run build && cd ../backend && npm install`
   - **Start Command:** `node backend/src/app.js`
5. Add environment variables: `BACKEND_PORT, DATABASE_URL, SECRET_KEY, VITE_API_BASE_URL, VITE_WS_HOST, VITE_WS_PORT`
   
## Features

- **User Authentication** - Register, login with JWT
- **Pet Management** - Create, read, update, delete Tamagotchis
- **Real-time Stats** - Health, happiness, hunger, weight tracking
- **Interactive Actions** - Feed, play, toilet, sleep
- **Image Upload** - Upload and manage pet images
- **Real-time Notifications** - WebSocket-powered live updates
- **Geolocation** - Map view with pet locations (in development)
- **Modern UI** - Gradient design with Vue.js 3
- **Form Validation** - Zod schemas with VeeValidate

## API Resources

This API allows you to work with the following resources:

| Resource | Description | Endpoints |
|----------|-------------|-----------|
| **Auth** | User registration and authentication | `POST /api/auth/register`, `POST /api/auth/login` |
| **Pets** | Tamagotchi management (CRUD) | `GET /api/pets`, `GET /api/pets/:id`, `POST /api/pets`, `PATCH /api/pets/:id`, `DELETE /api/pets/:id` |
| **Actions** | Pet interactions (feed, play, toilet, sleep) | `POST /api/pets/:id/feed`, `POST /api/pets/:id/play`, `POST /api/pets/:id/toilet`, `POST /api/pets/:id/sleep` |
| **Images** | Upload and manage pet images | `POST /api/pets/:id/image`, `DELETE /api/pets/:id/image` |
| **Stats** | Global statistics (aggregation pipeline) | `GET /api/stats` |
| **World** | Geolocation data for pets | `GET /api/world` |

### Key API Features

- **Authentication:** JWT-based authentication for secure access
- **Authorization:** Owner-only operations (update, delete, actions, images)
- **Pagination:** `GET /api/pets` supports `page` and `limit` query parameters
- **Filtering:** Filter pets by `species` and `inclination`
- **Validation:** Comprehensive input validation with appropriate error responses
- **Geolocation:** Pets store location as GeoJSON Point coordinates

## Course Requirements

This project REST API requirements:

| Requirement | Implementation |
|-------------|----------------|
| **User Management** | Registration and JWT-based authentication |
| **Linked Resources** | Pets (linked to Users), Statistics (aggregated from Pets/Users) |
| **Pagination** | `GET /api/pets` with `page` and `limit` parameters |
| **Filtering** | `GET /api/pets` with `species` and `inclination` filters |
| **Aggregation** | `GET /api/stats` uses MongoDB aggregation pipeline |
| **Geolocation** | Pets store GeoJSON Point coordinates |
| **Images** | Upload/delete pet images via multipart/form-data |
| **Authorization** | Owner-only operations (JWT + ownership validation) |
| **Real-time** | WebSocket notifications via Socket.io |
| **Tests** | 10+ automated tests covering 4+ REST operations |
| **Deployment** | Backend on Render, source on GitHub |

## Testing

```bash
cd backend
npm test
```

The test suite includes **10+ reproducible tests** covering:
- User registration and authentication
- Pet CRUD operations
- Authorization (owner-only operations)
- Pagination and filtering
- Input validation

## WebSocket Support

This application uses [Socket.io](https://socket.io/) for real-time communication.

**Supported Events:**

- **Server → Client:** `petStatsUpdated`, `notification`, `petCreated`, `petDeleted`
- **Client → Server:** `authenticate` (JWT authentication)

Real-time updates are displayed in the NotificationsPanel component.

## Technologies

### Backend
- **Express.js** - Web framework
- **MongoDB** + **Mongoose** - Database and ODM
- **JWT** - Authentication
- **Socket.io** - Real-time WebSocket communication
- **Multer** - File upload handling
- **bcrypt** - Password hashing

### Frontend
- **Vue.js 3** - JavaScript framework
- **Vue Router** - Client-side routing
- **Pinia** - State management
- **Vite** - Build tool
- **Zod** + **VeeValidate** - Form validation

## Team

Projet réalisé dans le cadre des cours **ArchiOWeb** et **DevMob** à la HEIG-VD.

**Développement:**
- Joshua
- Cédric
- Alexandre

