import { describe, test, expect, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../src/app";
import { TraderModel } from "../src/models/traders";
import { TraderTypes } from "../src/models/traders";

beforeEach(async () => {
  await TraderModel.deleteMany({});
});

describe("POST /traders", () => {
  test("should create a new trader", async () => {
    const response = await request(app)
      .post("/traders")
      .send({
        name: "John Doe",
        type: TraderTypes.Alchemist,
        location: "New York",
      })
      .expect(201);

    expect(response.body).toMatchObject({
      name: "John Doe",
      type: TraderTypes.Alchemist,
      location: "New York",
    });
  });

  test("should not create trader with invalid data", async () => {
    await request(app)
      .post("/traders")
      .send({
        name: "john doe", // Invalid name (should start with a capital letter)
        type: "Trader",
        location: "New York",
      })
      .expect(500);
  });

  test("should not create trader with invalid type", async () => {
    await request(app)
      .post("/traders")
      .send({
        name: "John Doe",
        type: "InvalidType", // Invalid type
        location: "New York",
      })
      .expect(500);

  });

  test("should not create trader without required fields", async () => {
    await request(app)
      .post("/traders")
      .send({
        // Missing name
        type: TraderTypes.Generaltrader,
        location: "New York",
      })
      .expect(500);

  });

  test("should not create trader with invalid location", async () => {
    await request(app)
      .post("/traders")
      .send({
        name: "John Doe",
        type: TraderTypes.Herbalist,
        location: "", // Invalid location
      })
      .expect(500);
  });

})

//############################################################


describe("DELETE /traders/:id", () => {
  test("should delete a trader by id", async () => {
    const createResponse = await request(app)
      .post("/traders")
      .send({
        name: "Trader To Delete",
        type: TraderTypes.Alchemist,
        location: "Kaer Morhen",
      })
      .expect(201);

    const traderId = createResponse.body._id;
    // console.log("Trader ID:", traderId);
    await request(app)
      .delete(`/traders/${traderId}`)
      .expect(200);
  });

  test("should return 404 if trader does not exist", async () => {
    await request(app)
      .delete("/traders/000000000000000000000000") // Non-existent ID
      .expect(404);
  });
});

// #############################################################

describe("DELETE /traders", () => {
  test("should delete a trader by query string", async () => {
    await request(app)
      .post("/traders")
      .send({
        name: "Trader To Delete",
        type: TraderTypes.Alchemist,
        location: "Kaer Morhen",
      })
      .expect(201);

    await request(app)
      .delete("/traders")
      .query({ name: "Trader To Delete" })
      .expect(200);
  });

  test("should return 404 if trader does not exist by query string", async () => {
    await request(app)
      .delete("/traders")
      .query({ name: "Non-existent Trader" })
      .expect(404);
  });

  test("should return 400 for invalid query string", async () => {
    await request(app)
      .delete("/traders")
      .query({ invalidField: "Invalid Query" }) // Invalid query field
      .expect(400);
  });
});


// #############################################################

describe("PATCH /traders", () => {
  test("should update a trader's details using query string", async () => {
    await request(app)
      .post("/traders")
      .send({
        name: "Trader Query Update",
        type: TraderTypes.Alchemist,
        location: "Kaer Morhen",
      })
      .expect(201);

    const response = await request(app)
      .patch("/traders")
      .query({ name: "Trader Query Update" })
      .send({
        location: "Vizima",
      })
      .expect(200);

    expect(response.body).toMatchObject({
      name: "Trader Query Update",
      type: TraderTypes.Alchemist,
      location: "Vizima",
    });
  });

  test("should return 404 if trader does not exist using query string", async () => {
    await request(app)
      .patch("/traders")
      .query({ name: "Non-existent Trader" })
      .send({
        location: "Nowhere",
      })
      .expect(404);
  });

  test("should return 500 for invalid update data using query string", async () => {
    await request(app)
      .patch("/traders")
      .query({ name: "Trader Invalid Query Update" })
      .send({
        type: "InvalidType", // Invalid type
      })
      .expect(500);

    
  });

  test("should not update trader with extra unexpected fields using query string", async () => {
    await request(app)
      .patch("/traders")
      .query({ name: "Trader Extra Query Fields" })
      .send({
        extraField: "unexpected", // Extra field
      })
      .expect(400);
  });
});

// #############################################################

describe("PATCH /traders/:id", () => {
  test("should update a trader's details", async () => {
    const req = await request(app)
      .post("/traders")
      .send({
        name: "Trader To Update",
        type: TraderTypes.Alchemist,
        location: "Kaer Trolde",
      })
      .expect(201);

    const response = await request(app)
      .patch(`/traders/${req.body._id}`)
      .send({
        name: "Updated Trader",
        location: "Oxenfurt",
      })
      .expect(200);

    expect(response.body).toMatchObject({
      name: "Updated Trader",
      type: TraderTypes.Alchemist,
      location: "Oxenfurt",
    });
  });

  test("should return 404 if trader does not exist", async () => {
    await request(app)
      .patch("/traders/000000000000000000000000") // Non-existent ID
      .send({
        name: "Non-existent Trader",
      })
      .expect(404);
  });

  test("should return 500 for invalid id type", async () => {
    const response = await request(app)
      .patch("/traders/invalid_id") // Invalid ID type
      .send({
        name: "Invalid ID Trader",
      })
      .expect(500);
  });

  test("should return 500 for invalid update data", async () => {
    const response = await request(app)
      .patch("/traders/30")
      .send({
        type: "InvalidType", // Invalid type
      })
      .expect(500);
  });

  test("should not update trader with extra unexpected fields", async () => {
    const response = await request(app)
      .patch("/traders/40")
      .send({
        extraField: "unexpected", // Extra field
      })
      .expect(400);
  });
});


// #############################################################

describe("GET /traders", () => {
  test("should retrieve all traders", async () => {
    await request(app)
      .post("/traders")
      .send({
        name: "Trader One",
        type: TraderTypes.Alchemist,
        location: "Novigrad",
      })
      .expect(201);

    await request(app)
      .post("/traders")
      .send({
        name: "Trader Two",
        type: TraderTypes.Blacksmith,
        location: "Oxenfurt",
      })
      .expect(201);

    const response = await request(app)
      .get("/traders")
      .expect(200);

    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "Trader One",
          type: TraderTypes.Alchemist,
          location: "Novigrad",
        }),
        expect.objectContaining({
          name: "Trader Two",
          type: TraderTypes.Blacksmith,
          location: "Oxenfurt",
        }),
      ])
    );
  });
});

// #############################################################

describe("GET /traders/:id", () => {
  test("should retrieve a trader by id", async () => {
    const req = await request(app)
      .post("/traders")
      .send({
        name: "Trader Specific",
        type: TraderTypes.Herbalist,
        location: "White Orchard",
      })
      .expect(201);

    const response = await request(app)
      .get(`/traders/${req.body._id}`)
      .expect(200);

    expect(response.body).toMatchObject({
      name: "Trader Specific",
      type: TraderTypes.Herbalist,
      location: "White Orchard",
    });
  });

  test("should return 404 if trader does not exist", async () => {
    const response = await request(app)
      .get("/traders/000000000000000000000000") // Non-existent ID
      .expect(404);
  });

  test("should return 500 for invalid id type", async () => {
    const response = await request(app)
      .get("/traders/invalid_id") // Invalid ID type
      .expect(500);
  });
});