import { describe, test, expect, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../src/app";
import { AssetModel } from "../src/models/asset";
import { AssetType } from "../src/models/asset";
import { response } from "express";

beforeEach(async () => {
  await AssetModel.deleteMany({});
});

// post
describe("Post", async () => {
  test("Create one asset", async () => {
    const response = await request(app)
      .post("/assets")
      .send({
        name: "Javi sword",
        description: "A finely crafted silver sword used to hunt monsters.",
        material: "Gold",
        weight: 10,
        crown_value: 1500,
        type: "weapon",
        amount: 1
      })
      .expect(201);
    expect(response.body).toMatchObject({
      name: "Javi sword",
      description: "A finely crafted silver sword used to hunt monsters.",
      material: "Gold",
      weight: 10,
      crown_value: 1500,
      type: "weapon",
      amount: 1
    });
  });

  test("Add one asset", async () => {
    // Create the initial asset
    await request(app)
      .post("/assets")
      .send({
        name: "Javi sword",
        description: "A finely crafted silver sword used to hunt monsters.",
        material: "Gold",
        weight: 10,
        crown_value: 1500,
        type: "weapon",
        amount: 1
      })
      .expect(201);

    // Add to the existing asset
    const response = await request(app)
      .post("/assets")
      .send({
        name: "Javi sword",
        description: "A finely crafted silver sword used to hunt monsters.",
        material: "Gold",
        weight: 10,
        crown_value: 1500,
        type: "weapon",
        amount: 1
      })
      .expect(200); // Expect 200 since it's an update
    expect(response.body).toMatchObject({
      name: "Javi sword",
      description: "A finely crafted silver sword used to hunt monsters.",
      material: "Gold",
      weight: 10,
      crown_value: 1500,
      type: "weapon",
      amount: 2 // Amount should now be incremented to 2
    });
  });

  // Añadir un mal tipo de asset
  test("Fail to create asset with invalid type", async () => {
    await request(app)
      .post("/assets")
      .send({
        name: "Invalid asset",
        description: "This asset has an invalid type.",
        material: "Wood",
        weight: 5,
        crown_value: 500,
        type: "invalid_type", // Invalid type
        amount: 1
      })
      .expect(500); // Expect 400 for bad request
  });

  test("Fail to create an asset with wrong regular expresion", async () => {
    await request(app)
    .post("/assets")
    .send({
      name: "Inid -%asset255151515",
      description: "This asset has an invalid type.",
      material: "Wood",
      weight: 5,
      crown_value: 500,
      type: "invalid_type", // Invalid type
      amount: 1
    })
    .expect(500); // Expect 400 for bad request
  });
});

//Get
describe("Get with id", async () => {
  test("Get one asset with id", async () => {
    const req = await request(app)
      .post("/assets")
      .send({
        name: "Javi sword",
        description: "A finely crafted silver sword used to hunt monsters.",
        material: "Gold",
        weight: 10,
        crown_value: 1500,
        type: "weapon",
        amount: 1
      })
      .expect(201);
    const response = await request(app)
      .get(`/assets/${req.body._id}`)
      .expect(201)

    expect(response.body).toMatchObject({
      name: "Javi sword",
      description: "A finely crafted silver sword used to hunt monsters.",
      material: "Gold",
      weight: 10,
      crown_value: 1500,
      type: "weapon",
      amount: 1
    })
  })

  test("Bad id", async () => {
    await request(app)
      .get("/assets/000000000000000000000000")
      .expect(404);
  })
})

describe("Get with filters", async () => {
  test("Filter by name", async () => {
    await request(app)
      .post("/assets")
      .send({
        name: "Javi sword",
        description: "A finely crafted silver sword used to hunt monsters.",
        material: "Gold",
        weight: 10,
        crown_value: 1500,
        type: "weapon",
        amount: 1
      })
      .expect(201);

    const response = await request(app)
      .get("/assets?name=Javi sword")
      .expect(200);

    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toMatchObject({
      name: "Javi sword",
      description: "A finely crafted silver sword used to hunt monsters.",
      material: "Gold",
      weight: 10,
      crown_value: 1500,
      type: "weapon",
      amount: 1
    });
  });

  test("Filter by material and weight", async () => {
    await request(app)
      .post("/assets")
      .send({
        name: "Javi sword",
        description: "A finely crafted silver sword used to hunt monsters.",
        material: "Gold",
        weight: 10,
        crown_value: 1500,
        type: "weapon",
        amount: 1
      })
      .expect(201);

    await request(app)
      .post("/assets")
      .send({
        name: "Wooden shield",
        description: "A sturdy wooden shield.",
        material: "Wood",
        weight: 15,
        crown_value: 500,
        type: "armor",
        amount: 1
      })
      .expect(201);

    const response = await request(app)
      .get("/assets?material=Gold&weight=10")
      .expect(200);

    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toMatchObject({
      name: "Javi sword",
      material: "Gold",
      weight: 10
    });
  });

  test("Filter with no matching results", async () => {
    await request(app)
      .post("/assets")
      .send({
        name: "Javi sword",
        description: "A finely crafted silver sword used to hunt monsters.",
        material: "Gold",
        weight: 10,
        crown_value: 1500,
        type: "weapon",
        amount: 1
      })
      .expect(201);

    const response = await request(app)
      .get("/assets?material=Silver")
      .expect(200);

    expect(response.body).toHaveLength(0);
  });

  test("Filter by crown_value and amount", async () => {
    await request(app)
      .post("/assets")
      .send({
        name: "Golden ring",
        description: "A precious golden ring.",
        material: "Gold",
        weight: 1,
        crown_value: 5000,
        type: "armor",
        amount: 3
      })
      .expect(201);

    const response = await request(app)
      .get("/assets?crown_value=5000&amount=3")
      .expect(200);

    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toMatchObject({
      name: "Golden ring",
      crown_value: 5000,
      amount: 3
    });
  });
});

// Delete by ID
describe("Delete by ID", async () => {
  test("Delete an existing asset by ID", async () => {
    const asset = await request(app)
      .post("/assets")
      .send({
        name: "Javi sword",
        description: "A finely crafted silver sword used to hunt monsters.",
        material: "Gold",
        weight: 10,
        crown_value: 1500,
        type: "weapon",
        amount: 1
      })
      .expect(201);

    const response = await request(app)
      .delete(`/assets/${asset.body._id}`)
      .expect(200);

    expect(response.body).toMatchObject({
      name: "Javi sword",
      description: "A finely crafted silver sword used to hunt monsters.",
      material: "Gold",
      weight: 10,
      crown_value: 1500,
      type: "weapon",
      amount: 1
    });
  });

  test("Fail to delete an asset with invalid ID", async () => {
    await request(app)
      .delete("/assets/000000000000000000000000")
      .expect(400);
  });
});

// Delete with filters
describe("Delete with filters", async () => {
  test("Delete an asset by filter", async () => {
    await request(app)
      .post("/assets")
      .send({
        name: "Golden ring",
        description: "A precious golden ring.",
        material: "Gold",
        weight: 1,
        crown_value: 5000,
        type: "armor",
        amount: 3
      })
      .expect(201);

    const response = await request(app)
      .delete("/assets?name=Golden ring")
      .expect(200);

    expect(response.body).toMatchObject({
      name: "Golden ring",
      description: "A precious golden ring.",
      material: "Gold",
      weight: 1,
      crown_value: 5000,
      type: "armor",
      amount: 3
    });
  });

  test("Fail to delete an asset with non-matching filter", async () => {
    await request(app)
      .post("/assets")
      .send({
        name: "Golden ring",
        description: "A precious golden ring.",
        material: "Gold",
        weight: 1,
        crown_value: 5000,
        type: "armor",
        amount: 3
      })
      .expect(201);

    await request(app)
      .delete("/assets?name=Nonexistent")
      .expect(404);
  });
});

// Patch with filters
describe("Patch with filters", async () => {
  test("Update an asset by filter", async () => {
    await request(app)
      .post("/assets")
      .send({
        name: "Golden ring",
        description: "A precious golden ring.",
        material: "Gold",
        weight: 1,
        crown_value: 5000,
        type: "armor",
        amount: 3
      })
      .expect(201);

    const response = await request(app)
      .patch("/assets?name=Golden ring")
      .send({
        description: "An updated description for the golden ring.",
        crown_value: 6000
      })
      .expect(200);

    expect(response.body).toMatchObject({
      name: "Golden ring",
      description: "An updated description for the golden ring.",
      material: "Gold",
      weight: 1,
      crown_value: 6000,
      type: "armor",
      amount: 3
    });
  });

  test("Fail to update an asset with invalid field", async () => {
    await request(app)
      .post("/assets")
      .send({
        name: "Golden ring",
        description: "A precious golden ring.",
        material: "Gold",
        weight: 1,
        crown_value: 5000,
        type: "armor",
        amount: 3
      })
      .expect(201);

    await request(app)
      .patch("/assets?name=Golden ring")
      .send({
        invalidField: "Invalid value"
      })
      .expect(400);
  });

  test("Fail to update an asset with non-matching filter", async () => {
    await request(app)
      .post("/assets")
      .send({
        name: "Golden ring",
        description: "A precious golden ring.",
        material: "Gold",
        weight: 1,
        crown_value: 5000,
        type: "armor",
        amount: 3
      })
      .expect(201);

    await request(app)
      .patch("/assets?name=Nonexistent")
      .send({
        description: "This update should fail."
      })
      .expect(404);
  });
});

// Patch by ID
describe("Patch by ID", async () => {
  test("Update an existing asset by ID", async () => {
    const asset = await request(app)
      .post("/assets")
      .send({
        name: "Golden ring",
        description: "A precious golden ring.",
        material: "Gold",
        weight: 1,
        crown_value: 5000,
        type: "armor",
        amount: 3
      })
      .expect(201);

    const response = await request(app)
      .patch(`/assets/${asset.body._id}`)
      .send({
        description: "An updated description for the golden ring.",
        crown_value: 6000
      })
      .expect(200);

    expect(response.body).toMatchObject({
      name: "Golden ring",
      description: "An updated description for the golden ring.",
      material: "Gold",
      weight: 1,
      crown_value: 6000,
      type: "armor",
      amount: 3
    });
  });

  test("Fail to update an asset with invalid ID", async () => {
    await request(app)
      .patch("/assets/000000000000000000000000")
      .send({
        description: "This update should fail."
      })
      .expect(404);
  });

  test("Fail to update an asset with invalid field by ID", async () => {
    const asset = await request(app)
      .post("/assets")
      .send({
        name: "Golden ring",
        description: "A precious golden ring.",
        material: "Gold",
        weight: 1,
        crown_value: 5000,
        type: "armor",
        amount: 3
      })
      .expect(201);

    await request(app)
      .patch(`/assets/${asset.body._id}`)
      .send({
        invalidField: "Invalid value"
      })
      .expect(400);
  });
});
