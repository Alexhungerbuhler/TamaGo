# TamaGo

A modern Tamagotchi-style virtual pet management application with real-time interactions, built with Vue.js and Express.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Requirements](#requirements)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Features](#features)
- [API Resources](#api-resources)
- [Project Structure](#project-structure)
- [WebSocket Support](#websocket-support)
- [Technologies](#technologies)
- [Documentation](#documentation)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Requirements

- [Node.js](https://nodejs.org) 25.x or higher
- [MongoDB](https://www.mongodb.com) 8.x
- [npm](https://www.npmjs.com) 10.x

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

### Start Backend

```bash
cd backend
npm start
```

The API will be available at [http://localhost:3000](http://localhost:3000).

### Start Frontend

```bash
cd frontend
npm run dev
```

The application will be available at [http://localhost:5173](http://localhost:5173).

### Other Scripts

**Backend:**
```bash
# Run backend tests
npm test

# Check MongoDB indexes
npm run check-indexes

# Create MongoDB indexes
npm run create-indexes
```

**Frontend:**
```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Configuration

### Backend Configuration

Create a `.env` file in the `backend/` directory:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/tamago
JWT_SECRET=your-secret-key-change-this-in-production
NODE_ENV=development
UPLOAD_DIR=uploads
```

### Frontend Configuration

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_WS_URL=http://localhost:3000
```

### Environment Variables

**Backend:**

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `MONGODB_URI` | MongoDB connection URL | `mongodb://localhost:27017/tamago` |
| `JWT_SECRET` | Secret key for JWT tokens | (required) |
| `NODE_ENV` | Environment mode | `development` |
| `UPLOAD_DIR` | Directory for uploaded images | `uploads` |

**Frontend:**

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API URL | `http://localhost:3000/api` |
| `VITE_WS_URL` | WebSocket server URL | `http://localhost:3000` |

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

### Authentication

- **Register** - `POST /api/auth/register`
  - Create a new user account
  - Required fields: username, email, password

- **Login** - `POST /api/auth/login`
  - Authenticate and receive JWT token
  - Required fields: email, password

### Pets (Tamagotchis)

- **List Pets** - `GET /api/pets`
  - Browse pets with filtering and pagination
  - Query params: `species`, `inclination`, `page`, `limit`

- **Create Pet** - `POST /api/pets` (authenticated)
  - Create a new Tamagotchi
  - Required fields: name, species, inclination

- **Get Pet Details** - `GET /api/pets/:id`
  - Retrieve detailed information about a specific pet

- **Update Pet** - `PATCH /api/pets/:id` (authenticated)
  - Update pet information (name, species, inclination)
  - Owner only

- **Delete Pet** - `DELETE /api/pets/:id` (authenticated)
  - Remove a pet permanently
  - Owner only

### Pet Actions

- **Feed** - `POST /api/pets/:id/feed` (authenticated)
- **Play** - `POST /api/pets/:id/play` (authenticated)
- **Toilet** - `POST /api/pets/:id/toilet` (authenticated)
- **Sleep** - `POST /api/pets/:id/sleep` (authenticated)

### Pet Images

- **Upload Image** - `POST /api/pets/:id/image` (authenticated)
  - Upload a pet image
  - Owner only

- **Delete Image** - `DELETE /api/pets/:id/image` (authenticated)
  - Remove pet image
  - Owner only

### Statistics

- **Global Stats** - `GET /api/stats`
  - Retrieve global statistics (total users, pets, average stats)

### World

- **World Data** - `GET /api/world`
  - Get geolocation data for pets (in development)

## WebSocket Support

This application uses [Socket.io](https://socket.io/) for real-time communication.

### Supported Events

**Server → Client:**
- `petStatsUpdated` - Pet statistics have changed
- `notification` - New notification for the user
- `petCreated` - New pet created
- `petDeleted` - Pet removed

**Client → Server:**
- `authenticate` - Authenticate WebSocket connection with JWT

Real-time updates are displayed in the NotificationsPanel component.

## Documentation

Additional documentation available in the repository:

- [Installation Guide](INSTALLATION_COMPLETE.md)
- [Store & Auth Guide](GUIDE_STORE_AUTH.md)
- [API Testing Guide](GUIDE_TEST_API.md)
- [Router Guards Guide](ROUTER_GUARDS_TEST.md)
- [WebSocket Guide](WEBSOCKET_GUIDE.md)
- [Validation Guide](VALIDATION_GUIDE.md)
- [Service API Setup](SERVICE_API_SETUP.md)

---

**Project:** TamaGo - Virtual Pet Management System  
**Course:** ArchiOWeb - HESSO  
**Year:** 2026
