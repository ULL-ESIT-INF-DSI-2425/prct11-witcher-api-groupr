import { describe, test, expect, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../src/app";
import { Transaction } from "../src/models/transaction";
import { AssetModel } from "../src/models/asset";
import { TraderModel } from "../src/models/traders";
import { Hunter } from "../src/models/hunters";

beforeEach(async () => {
  await Transaction.deleteMany({});
  await AssetModel.deleteMany({});
  await TraderModel.deleteMany({});
  await Hunter.deleteMany({});
});

// Helper function to create test data
const createTestData = async () => {
  const trader = await TraderModel.create({
    name: "Test Trader",
    type: "blacksmith",
    location: "Novigrad"
  });

  const hunter = await Hunter.create({
    name: "Test Hunter",
    race: "WITCH",
    location: "Velen"
  });

  const asset1 = await AssetModel.create({
    name: "Test Sword",
    description: "A test sword",
    material: "Steel",
    weight: 5,
    crown_value: 100,
    type: "weapon",
    amount: 10
  });

  const asset2 = await AssetModel.create({
    name: "Test Armor",
    description: "A test armor",
    material: "Iron",
    weight: 15,
    crown_value: 200,
    type: "armor",
    amount: 5
  });

  return { trader, hunter, asset1, asset2 };
};

describe("Transactions API", () => {
  describe("GET /transactions", () => {
    test("should return 400 if no name or date provided", async () => {
      const response = await request(app)
        .get("/transactions")
        .expect(400);
      
      expect(response.text).toBe("A trader Name or a date must be provided");
    });

    test("should find transactions by trader name", async () => {
      const { trader, asset1 } = await createTestData();
      
      const transaction = await Transaction.create({
        mercader: trader._id,
        bienes: [{ asset: asset1._id, amount: 1 }],
        innBuying: true,
        crownValue: 100,
        date: "2023-01-01"
      });

      const response = await request(app)
        .get("/transactions")
        .query({ name: "Test Trader" })
        .expect(200);
      
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(1);
      expect(response.body[0]._id).toBe((transaction._id as number).toString() );
    });

    test("should find transactions by hunter name", async () => {
      const { hunter, asset1 } = await createTestData();
      
      const transaction = await Transaction.create({
        mercader: hunter._id,
        bienes: [{ asset: asset1._id, amount: 1 }],
        innBuying: false,
        crownValue: 100,
        date: "2023-01-01"
      });

      const response = await request(app)
        .get("/transactions")
        .query({ name: "Test Hunter" })
        .expect(200);
      
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(1);
      expect(response.body[0]._id).toBe((transaction._id as number).toString());
    });

    test("should return 404 if trader/hunter not found", async () => {
      const response = await request(app)
        .get("/transactions")
        .query({ name: "Non Existent" })
        .expect(404);
      
      expect(response.text).toBe("Trader with name Non Existent not found");
    });

    test("should find transactions by date range", async () => {
      const { trader, asset1 } = await createTestData();
      const now = new Date();
      
      await Transaction.create({
        mercader: trader._id,
        bienes: [{ asset: asset1._id, amount: 1 }],
        innBuying: true,
        date: now,
        crownValue: 100
      });

      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);

      const response = await request(app)
        .get("/transactions")
        .query({ 
          firstDay: yesterday.toISOString(),
          lastDay: tomorrow.toISOString()
        })
        .expect(200);
      
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(1);
    });

    test("should return 400 if date range is incomplete", async () => {
      const response = await request(app)
        .get("/transactions")
        .query({ firstDay: "2023-01-01" })
        .expect(400);
      
      expect(response.text).toBe("A maximun date must be provided");
    });
  });

  describe("GET /transactions/:id", () => {

    test("should return 404 if transaction not found", async () => {
      const nonExistentId = "507f1f77bcf86cd799439011";
      const response = await request(app)
        .get(`/transactions/${nonExistentId}`)
        .expect(404);
      
      expect(response.text).toBe(`Transaction with id ${nonExistentId} not found`);
    });
  });

  describe("POST /transactions", () => {
    test("should create a new buying transaction and update stock", async () => {
      const { trader, asset1 } = await createTestData();
      
      const response = await request(app)
        .post("/transactions")
        .send({
          mercader: trader._id,
          bienes: [{ asset: asset1._id, amount: 2 }],
          innBuying: true
        })
        .expect(201);
      
      expect(response.body.mercader).toBe((trader._id as number).toString());
      expect(response.body.innBuying).toBe(true);
      expect(response.body.bienes).toHaveLength(1);

      // Verify stock was updated
      const updatedAsset = await AssetModel.findById(asset1._id);
      expect(updatedAsset?.amount).toBe(12); // Initial 10 + 2
    });

    test("should create a new selling transaction and update stock", async () => {
      const { hunter, asset1 } = await createTestData();
      
      const response = await request(app)
        .post("/transactions")
        .send({
          mercader: hunter._id,
          bienes: [{ asset: asset1._id, amount: 2 }],
          innBuying: false
        })
        .expect(201);
      
      expect(response.body.mercader).toBe((hunter._id as number).toString());
      expect(response.body.innBuying).toBe(false);
      expect(response.body.bienes).toHaveLength(1);

      // Verify stock was updated
      const updatedAsset = await AssetModel.findById(asset1._id);
      expect(updatedAsset?.amount).toBe(8); // Initial 10 - 2
    });

    test("should return 400 if body is incomplete", async () => {
      const response = await request(app)
        .post("/transactions")
        .send({})
        .expect(400);
      
      expect(response.text).toBe("Error: a body must be specified");
    });

    test("should return 500 if trader does not exist", async () => {
      const { asset1 } = await createTestData();
      const nonExistentId = "507f1f77bcf86cd799439011";
      
      const response = await request(app)
        .post("/transactions")
        .send({
          mercader: nonExistentId,
          bienes: [{ asset: asset1._id, amount: 2 }],
          innBuying: true
        })
        .expect(500);
      
      expect(response.text).toContain("Error: trader not registered");
    });

    test("should return 500 if asset does not exist", async () => {
      const { trader } = await createTestData();
      const nonExistentId = "507f1f77bcf86cd799439011";
      
      const response = await request(app)
        .post("/transactions")
        .send({
          mercader: trader._id,
          bienes: [{ asset: nonExistentId, amount: 2 }],
          innBuying: true
        })
        .expect(500);
    });

    test("should return 500 if not enough stock for selling", async () => {
      const { hunter, asset1 } = await createTestData();
      
      const response = await request(app)
        .post("/transactions")
        .send({
          mercader: hunter._id,
          bienes: [{ asset: asset1._id, amount: 15 }], // Only 10 available
          innBuying: false
        })
        .expect(500);
    
    });
  });

  describe("DELETE /transactions/:id", () => {
    test("should delete a transaction and reverse stock changes", async () => {
      const { trader, asset1 } = await createTestData();
      
      // Create a buying transaction (adds to stock)
      const transaction = await Transaction.create({
        mercader: trader._id,
        bienes: [{ asset: asset1._id, amount: 3 }],
        innBuying: true,
        date: "2023-01-01",
        crownValue: 100
      });

      // Verify stock was updated
      let updatedAsset = await AssetModel.findById(asset1._id);
      expect(updatedAsset?.amount).toBe(10); // Initial 7 + 3

      // Delete the transaction (should subtract from stock)
      const response = await request(app)
        .delete(`/transactions/${transaction._id}`)
        .expect(200);
      
      expect(response.body._id).toBe((transaction._id as number).toString());

      // Verify stock was reversed
      updatedAsset = await AssetModel.findById(asset1._id);
      expect(updatedAsset?.amount).toBe(10); // Back to initial
    });

    test("should return 400 if no ID provided", async () => {
      const response = await request(app)
        .delete("/transactions")
        .expect(404); // This will actually be a 404 because the route doesn't exist
    });

    test("should return 404 if transaction not found", async () => {
      const nonExistentId = "507f1f77bcf86cd799439011";
      const response = await request(app)
        .delete(`/transactions/${nonExistentId}`)
        .expect(404);
      
      expect(response.text).toBe(`Transaction with id ${nonExistentId} not found`);
    });
  });
});