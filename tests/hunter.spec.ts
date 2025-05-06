import { describe, test, expect, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../src/app";
import { Hunter } from "../src/models/hunters";
import { Race } from "../src/models/hunters";

beforeEach(async () => {
  await Hunter.deleteMany({});
});

describe("POST /hunters", () => {
  test("should create a new hunter", async () => {
    const response = await request(app)
      .post("/hunters")
      .send({
        name: "Geralt of Rivia",
        race: Race.WITCH,
        location: "Kaer Morhen",
      })
      .expect(201);

    expect(response.body).toMatchObject({
      name: "Geralt of Rivia",
      race: Race.WITCH,
      location: "Kaer Morhen",
    });
  });

  test("should not create hunter with invalid data", async () => {
    await request(app)
      .post("/hunters")
      .send({
        name: "geralt", // Invalid name
        race: "Hunter",
        location: "Kaer Morhen",
      })
      .expect(500);
  });

  test("should not create hunter with invalid race", async () => {
    await request(app)
      .post("/hunters")
      .send({
        name: "Geralt of Rivia",
        race: "InvalidRace",
        location: "Kaer Morhen",
      })
      .expect(500);
  });

  test("should not create hunter without required fields", async () => {
    await request(app)
      .post("/hunters")
      .send({
        race: Race.BANDIT,
        location: "Kaer Morhen",
      })
      .expect(500);
  });

  test("should not create hunter with invalid location", async () => {
    await request(app)
      .post("/hunters")
      .send({
        name: "Geralt of Rivia",
        race: Race.MERCENARY,
        location: "",
      })
      .expect(500);
  });
});

describe("DELETE /hunters/:id", () => {
  test("should delete a hunter by id", async () => {
    const createResponse = await request(app)
      .post("/hunters")
      .send({
        name: "Hunter To Delete",
        race: Race.KNIGHT,
        location: "Kaedwen",
      })
      .expect(201);

    const hunterId = createResponse.body._id;
    await request(app)
      .delete(`/hunters/${hunterId}`)
      .expect(200);
  });

  test("should return 404 if hunter does not exist", async () => {
    await request(app)
      .delete("/hunters/000000000000000000000000")
      .expect(404);
  });
});

describe("DELETE /hunters", () => {
  test("should delete a hunter by query string", async () => {
    await request(app)
      .post("/hunters")
      .send({
        name: "Hunter To Delete",
        race: Race.BANDIT,
        location: "Kaedwen",
      })
      .expect(201);

    await request(app)
      .delete("/hunters")
      .query({ name: "Hunter To Delete" })
      .expect(200);
  });

  test("should return 404 if hunter does not exist by query string", async () => {
    await request(app)
      .delete("/hunters")
      .query({ name: "Non-existent Hunter" })
      .expect(404);
  });

  test("should return 400 for invalid query string", async () => {
    await request(app)
      .delete("/hunters")
      .query({ invalidField: "Invalid Query" })
      .expect(400);
  });
});

describe("PATCH /hunters", () => {
  test("should update a hunter's details using query string", async () => {
    await request(app)
      .post("/hunters")
      .send({
        name: "Hunter Query Update",
        race: Race.WITCH,
        location: "Kaedwen",
      })
      .expect(201);

    const response = await request(app)
      .patch("/hunters")
      .query({ name: "Hunter Query Update" })
      .send({
        location: "Temeria",
      })
      .expect(200);

    expect(response.body).toMatchObject({
      name: "Hunter Query Update",
      race: Race.WITCH,
      location: "Temeria",
    });
  });

  test("should return 404 if hunter does not exist using query string", async () => {
    await request(app)
      .patch("/hunters")
      .query({ name: "Non-existent Hunter" })
      .send({
        location: "Nowhere",
      })
      .expect(404);
  });

  test("should return 500 for invalid update data using query string", async () => {
    await request(app)
      .patch("/hunters")
      .query({ name: "Hunter Invalid Query Update" })
      .send({
        race: "InvalidRace",
      })
      .expect(500);
  });

  test("should not update hunter with extra unexpected fields using query string", async () => {
    await request(app)
      .patch("/hunters")
      .query({ name: "Hunter Extra Query Fields" })
      .send({
        extraField: "unexpected",
      })
      .expect(400);
  });
});

describe("PATCH /hunters/:id", () => {
  test("should update a hunter's details", async () => {
    const req = await request(app)
      .post("/hunters")
      .send({
        name: "Hunter To Update",
        race: Race.MERCENARY,
        location: "Toussaint",
      })
      .expect(201);

    const response = await request(app)
      .patch(`/hunters/${req.body._id}`)
      .send({
        name: "Updated Hunter",
        location: "Cintra",
      })
      .expect(200);

    expect(response.body).toMatchObject({
      name: "Updated Hunter",
      race: Race.MERCENARY,
      location: "Cintra",
    });
  });

  test("should return 404 if hunter does not exist", async () => {
    await request(app)
      .patch("/hunters/000000000000000000000000")
      .send({ name: "Non-existent Hunter" })
      .expect(404);
  });

  test("should return 500 for invalid id type", async () => {
    await request(app)
      .patch("/hunters/invalid_id")
      .send({ name: "Invalid ID Hunter" })
      .expect(500);
  });

  test("should return 500 for invalid update data", async () => {
    await request(app)
      .patch("/hunters/30")
      .send({ race: "InvalidRace" })
      .expect(500);
  });

  test("should not update hunter with extra unexpected fields", async () => {
    await request(app)
      .patch("/hunters/40")
      .send({ extraField: "unexpected" })
      .expect(400);
  });
});

describe("GET /hunters", () => {
  test("should retrieve all hunters", async () => {
    await request(app)
      .post("/hunters")
      .send({
        name: "Hunter One",
        race: Race.WITCH,
        location: "Novigrad",
      })
      .expect(201);

    await request(app)
      .post("/hunters")
      .send({
        name: "Hunter Two",
        race: Race.BANDIT,
        location: "Oxenfurt",
      })
      .expect(201);

    const response = await request(app)
      .get("/hunters")
      .expect(200);

    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "Hunter One",
          race: Race.WITCH,
          location: "Novigrad",
        }),
        expect.objectContaining({
          name: "Hunter Two",
          race: Race.BANDIT,
          location: "Oxenfurt",
        }),
      ])
    );
  });
});

describe("GET /hunters/:id", () => {
  test("should retrieve a hunter by id", async () => {
    const req = await request(app)
      .post("/hunters")
      .send({
        name: "Hunter Specific",
        race: Race.KNIGHT,
        location: "White Orchard",
      })
      .expect(201);

    const response = await request(app)
      .get(`/hunters/${req.body._id}`)
      .expect(200);

    expect(response.body).toMatchObject({
      name: "Hunter Specific",
      race: Race.KNIGHT,
      location: "White Orchard",
    });
  });

  test("should return 404 if hunter does not exist", async () => {
    await request(app)
      .get("/hunters/000000000000000000000000")
      .expect(404);
  });

  test("should return 500 for invalid id type", async () => {
    await request(app)
      .get("/hunters/invalid_id")
      .expect(500);
  });
});
