import { describe, test, expect, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../src/app";
import { AssetModel } from "../src/models/asset";
import { AssetType } from "../src/models/asset";
import { response } from "express";
import { Transaction } from "../src/models/transaction";

beforeEach(async () => {
  await Transaction.deleteMany({})
});