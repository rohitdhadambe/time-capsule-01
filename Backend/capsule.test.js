require("dotenv").config();
const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("./src/app");
const { sequelize } = require("./src/config/db");
const User = require("./src/models/User");
const Capsule = require("./src/models/Capsule");

jest.setTimeout(20000); // prevent timeout for DB operations

const testUser = {
  username: "capsuleuser",
  email: "capsule@example.com",
  password: "password123",
};

const testCapsule = {
  message: "Hello from the past!",
  unlock_at: new Date(Date.now() + 86400000).toISOString(), // +1 day
};

let authToken, userId, capsuleId, unlockCode;

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1h" });
};

beforeAll(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });

    const user = await User.create(testUser);
    userId = user.id;
    authToken = createToken(userId);
  } catch (err) {
    console.error("❌ Setup error:", err);
    throw err;
  }
});

afterAll(async () => {
  try {
    await sequelize.close();
  } catch (err) {
    console.error("❌ Teardown error:", err);
  }
});

describe("Capsule API", () => {
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

      capsuleId = res.body.capsule.id;
      unlockCode = res.body.capsule.unlock_code;
    });

    it("should reject capsule creation without auth", async () => {
      const res = await request(app).post("/capsules").send(testCapsule);
      expect(res.statusCode).toBe(401);
    });

    it("should reject capsule with past unlock date", async () => {
      const res = await request(app)
        .post("/capsules")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          message: "Too late!",
          unlock_at: new Date(Date.now() - 86400000).toISOString(), // -1 day
        });

      expect(res.statusCode).toBe(400);
    });
  });

  describe("GET /capsules", () => {
    it("should list user capsules", async () => {
      const res = await request(app)
        .get("/capsules")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("capsules");
      expect(Array.isArray(res.body.capsules)).toBe(true);
    });

    it("should reject listing without auth", async () => {
      const res = await request(app).get("/capsules");
      expect(res.statusCode).toBe(401);
    });
  });

  describe("GET /capsules/:id", () => {
    it("should deny access to locked capsule", async () => {
      const res = await request(app)
        .get(`/capsules/${capsuleId}?code=${unlockCode}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toBe(403);
    });

    it("should reject with invalid unlock code", async () => {
      const res = await request(app)
        .get(`/capsules/${capsuleId}?code=wrongcode`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toBe(403);
    });
  });

  describe("PUT /capsules/:id", () => {
    it("should update capsule with correct code", async () => {
      const res = await request(app)
        .put(`/capsules/${capsuleId}?code=${unlockCode}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          message: "Updated message",
          unlock_at: new Date(Date.now() + 172800000).toISOString(), // +2 days
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("message", "Capsule updated successfully");
    });

    it("should reject update with wrong code", async () => {
      const res = await request(app)
        .put(`/capsules/${capsuleId}?code=wrongcode`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ message: "Fail update" });

      expect(res.statusCode).toBe(401);
    });
  });

  describe("GET /capsules/:id (unlocked)", () => {
    beforeAll(async () => {
      const capsule = await Capsule.findByPk(capsuleId);
      if (capsule) {
        await capsule.update({
          unlock_at: new Date(Date.now() - 3600000), // -1 hour
        });
      } else {
        throw new Error("Capsule not found for unlocking");
      }
    });

    it("should retrieve an unlocked capsule", async () => {
      const res = await request(app)
        .get(`/capsules/${capsuleId}?code=${unlockCode}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("message");
    });

    it("should prevent updates to unlocked capsule", async () => {
      const res = await request(app)
        .put(`/capsules/${capsuleId}?code=${unlockCode}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ message: "Update attempt" });

      expect(res.statusCode).toBe(403);
    });

    it("should prevent deletion of unlocked capsule", async () => {
      const res = await request(app)
        .delete(`/capsules/${capsuleId}?code=${unlockCode}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toBe(403);
    });
  });

  describe("Capsule expiration", () => {
    let expiredCapsuleId;
    let expiredUnlockCode = "expiredcode123";

    beforeAll(async () => {
      const capsule = await Capsule.create({
        message: "Old message",
        unlock_at: new Date(Date.now() - 31 * 86400000), // -31 days
        unlock_code: expiredUnlockCode,
        userId,
        is_expired: true,
      });
      expiredCapsuleId = capsule.id;
    });

    it("should return 410 Gone for expired capsules", async () => {
      const res = await request(app)
        .get(`/capsules/${expiredCapsuleId}?code=${expiredUnlockCode}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toBe(410);
    });
  });
});
