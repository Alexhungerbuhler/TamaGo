import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import app from "../src/app.js";
import User from "../src/models/User.js";
import Tamagotchi from "../src/models/Tamagotchi.js";

let testUser;
let authToken;
let testPetId;

// Connexion à la base de données de test
beforeAll(async () => {
  const testDbUrl = process.env.TEST_DATABASE_URL || "mongodb://localhost/tama-go-test";
  await mongoose.connect(testDbUrl);
  
  // Nettoyer la base de données
  await User.deleteMany({});
  await Tamagotchi.deleteMany({});
});

afterAll(async () => {
  // Nettoyer et fermer la connexion
  await User.deleteMany({});
  await Tamagotchi.deleteMany({});
  await mongoose.connection.close();
});

describe("Authentication Endpoints", () => {
  it("should register a new user", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        name: "testuser",
        password: "testpassword123",
      })
      .expect(201);

    expect(response.body).toHaveProperty("_id");
    expect(response.body.name).toBe("testuser");
    expect(response.body).not.toHaveProperty("passwordHash");
    
    testUser = response.body;
  });

  it("should not register a user with duplicate name", async () => {
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "testuser",
        password: "anotherpassword",
      })
      .expect(409);
  });

  it("should login with correct credentials", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        name: "testuser",
        password: "testpassword123",
      })
      .expect(200);

    expect(response.body).toHaveProperty("token");
    expect(response.body).toHaveProperty("user");
    expect(response.body.user.name).toBe("testuser");
    
    authToken = response.body.token;
  });

  it("should not login with incorrect password", async () => {
    await request(app)
      .post("/api/auth/login")
      .send({
        name: "testuser",
        password: "wrongpassword",
      })
      .expect(401);
  });
});

describe("Pet Endpoints", () => {
  it("should create a new pet (authenticated)", async () => {
    const response = await request(app)
      .post("/api/pets")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: "TestPet",
        lat: 46.781,
        lng: 6.641,
      })
      .expect(201);

    expect(response.body).toHaveProperty("_id");
    expect(response.body.name).toBe("TestPet");
    expect(response.body.owner).toBe(testUser._id);
    
    testPetId = response.body._id;
  });

  it("should not create a pet without authentication", async () => {
    await request(app)
      .post("/api/pets")
      .send({
        name: "UnauthorizedPet",
      })
      .expect(401);
  });

  it("should list pets with pagination", async () => {
    // Créer quelques pets supplémentaires
    await request(app)
      .post("/api/pets")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ name: "Pet2", lat: 46.5, lng: 6.5 });
    
    await request(app)
      .post("/api/pets")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ name: "Pet3", lat: 46.6, lng: 6.6 });

    const response = await request(app)
      .get("/api/pets?page=1&limit=2")
      .expect(200);

    expect(response.body).toHaveProperty("data");
    expect(response.body).toHaveProperty("pagination");
    expect(response.body.pagination.page).toBe(1);
    expect(response.body.pagination.limit).toBe(2);
    expect(response.body.data.length).toBeLessThanOrEqual(2);
  });

  it("should filter pets by minLevel", async () => {
    const response = await request(app)
      .get("/api/pets?minLevel=1")
      .expect(200);

    expect(response.body.data).toBeInstanceOf(Array);
    response.body.data.forEach((pet) => {
      expect(pet.level).toBeGreaterThanOrEqual(1);
    });
  });

  it("should get a specific pet by ID", async () => {
    const response = await request(app)
      .get(`/api/pets/${testPetId}`)
      .expect(200);

    expect(response.body._id).toBe(testPetId);
    expect(response.body.name).toBe("TestPet");
  });

  it("should feed a pet (authenticated)", async () => {
    const response = await request(app)
      .post(`/api/pets/${testPetId}/eat`)
      .set("Authorization", `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.hunger).toBeGreaterThanOrEqual(100);
  });

  it("should not feed a pet without authentication", async () => {
    await request(app)
      .post(`/api/pets/${testPetId}/eat`)
      .expect(401);
  });

  it("should not allow non-owner to feed pet", async () => {
    // Créer un autre utilisateur
    const otherUserRes = await request(app)
      .post("/api/auth/register")
      .send({ name: "otheruser", password: "password123" });
    
    const otherLoginRes = await request(app)
      .post("/api/auth/login")
      .send({ name: "otheruser", password: "password123" });
    
    const otherToken = otherLoginRes.body.token;

    await request(app)
      .post(`/api/pets/${testPetId}/eat`)
      .set("Authorization", `Bearer ${otherToken}`)
      .expect(403);
  });

  it("should delete a pet (authenticated owner)", async () => {
    await request(app)
      .delete(`/api/pets/${testPetId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .expect(204);
  });
});

describe("Statistics Endpoints", () => {
  it("should get global statistics", async () => {
    const response = await request(app)
      .get("/api/stats")
      .expect(200);

    expect(response.body).toHaveProperty("summary");
    expect(response.body).toHaveProperty("averageStats");
    expect(response.body.summary).toHaveProperty("totalPets");
    expect(response.body.summary).toHaveProperty("totalUsers");
  });

  it("should get user statistics (authenticated)", async () => {
    const response = await request(app)
      .get(`/api/stats/users/${testUser._id}`)
      .set("Authorization", `Bearer ${authToken}`)
      .expect(200);

    expect(response.body).toHaveProperty("userId");
    expect(response.body).toHaveProperty("stats");
    expect(response.body.stats).toHaveProperty("totalPets");
  });

  it("should not get other user statistics", async () => {
    // Créer un fake userId
    const fakeUserId = new mongoose.Types.ObjectId();
    
    await request(app)
      .get(`/api/stats/users/${fakeUserId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .expect(403);
  });
});
