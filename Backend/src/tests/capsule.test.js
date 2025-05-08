require("dotenv").config();
const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../src/app");
const { sequelize } = require("../src/config/db");
const User = require("../src/models/User");
const Capsule = require("../src/models/Capsule");

// Test user data
const testUser = {
  username: "capsuleuser",
  email: "capsule@example.com",
  password: "password123",
};

// Test capsule data
const testCapsule = {
  message: "Hello from the past!",
  unlock_at: new Date(Date.now() + 86400000).toISOString(), // 1 day in the future
};

let authToken;
let userId;
let capsuleId;
let unlockCode;

// Helper function to create JWT token for tests
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1h" });
};

// Clear database and create tables before tests
beforeAll(async () => {
  await sequelize.sync({ force: true });

  // Create a test user
  const user = await User.create(testUser);
  userId = user.id;
  authToken = createToken(userId);
});

// Clear all data after tests
afterAll(async () => {
  await sequelize.close();
});

describe("Capsule API", () => {
  // Test capsule creation
  describe("POST /capsules", () => {
    it("should create a new capsule", async () => {
      const res = await request(app)
        .post("/capsules")
        .set("Authorization", `Bearer ${authToken}`)
        .send(testCapsule);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("capsule");
      expect(res.body.capsule).toHaveProperty("id");
      expect(res.body.capsule).toHaveProperty("unlock_code");

      // Save for later tests
      capsuleId = res.body.capsule.id;
      unlockCode = res.body.capsule.unlock_code;
    });

    it("should reject capsule creation without auth token", async () => {
      const res = await request(app).post("/capsules").send(testCapsule);

      expect(res.statusCode).toBe(401);
    });

    it("should reject capsule with unlock date in the past", async () => {
      const res = await request(app)
        .post("/capsules")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          message: "Past capsule",
          unlock_at: new Date(Date.now() - 86400000).toISOString(), // 1 day in the past
        });

      expect(res.statusCode).toBe(400);
    });
  });

  // Test listing capsules
  describe("GET /capsules", () => {
    it("should list user capsules with pagination", async () => {
      const res = await request(app)
        .get("/capsules")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("capsules");
      expect(res.body).toHaveProperty("pagination");
      expect(Array.isArray(res.body.capsules)).toBe(true);
      expect(res.body.capsules.length).toBeGreaterThan(0);
    });

    it("should reject listing without auth token", async () => {
      const res = await request(app).get("/capsules");
      expect(res.statusCode).toBe(401);
    });
  });

  // Test getting a specific capsule
  describe("GET /capsules/:id", () => {
    it("should deny access to locked capsule", async () => {
      const res = await request(app)
        .get(`/capsules/${capsuleId}?code=${unlockCode}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toBe(403); // Not unlockable yet
    });

    it("should reject with invalid unlock code", async () => {
      const res = await request(app)
        .get(`/capsules/${capsuleId}?code=wrongcode`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toBe(401);
    });
  });

  // Test updating a capsule
  describe("PUT /capsules/:id", () => {
    it("should update a capsule with valid unlock code", async () => {
      const res = await request(app)
        .put(`/capsules/${capsuleId}?code=${unlockCode}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          message: "Updated message",
          unlock_at: new Date(Date.now() + 172800000).toISOString(), // 2 days in the future
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty(
        "message",
        "Capsule updated successfully"
      );
    });

    it("should reject update with invalid unlock code", async () => {
      const res = await request(app)
        .put(`/capsules/${capsuleId}?code=wrongcode`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          message: "This update should fail",
        });

      expect(res.statusCode).toBe(401);
    });
  });

  // Test an unlocked capsule (we'll simulate this by manipulating the database)
  describe("GET /capsules/:id (unlocked)", () => {
    beforeAll(async () => {
      // Manually set the unlock date to the past for testing
      const capsule = await Capsule.findByPk(capsuleId);
      await capsule.update({
        unlock_at: new Date(Date.now() - 3600000), // 1 hour in the past
      });
    });

    it("should successfully retrieve an unlocked capsule", async () => {
      const res = await request(app)
        .get(`/capsules/${capsuleId}?code=${unlockCode}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("message");
      expect(res.body).toHaveProperty("id", capsuleId);
    });

    it("should prevent updates to already unlocked capsule", async () => {
      const res = await request(app)
        .put(`/capsules/${capsuleId}?code=${unlockCode}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          message: "Cannot update unlocked capsule",
        });

      expect(res.statusCode).toBe(403);
    });

    it("should prevent deletion of already unlocked capsule", async () => {
      const res = await request(app)
        .delete(`/capsules/${capsuleId}?code=${unlockCode}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toBe(403);
    });
  });

  // Test for expired capsules
  describe("Capsule expiration", () => {
    let expiredCapsuleId;
    let expiredUnlockCode;

    beforeAll(async () => {
      // Create a capsule that's already expired
      const capsule = await Capsule.create({
        message: "This is an expired capsule",
        unlock_at: new Date(Date.now() - 31 * 86400000), // 31 days in the past
        unlock_code: "expiredcode123", // Will be hashed by the model hook
        userId: userId,
        is_expired: true,
      });

      expiredCapsuleId = capsule.id;
      expiredUnlockCode = "expiredcode123";
    });

    it("should return 410 Gone for expired capsules", async () => {
      const res = await request(app)
        .get(`/capsules/${expiredCapsuleId}?code=${expiredUnlockCode}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toBe(410);
    });
  });
});
