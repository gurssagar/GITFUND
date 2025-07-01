import { createServer } from "http";
import express from "express";
import request from "supertest";
import { GET, POST } from "../src/app/api/assignedIssue/route";
import { db } from "../src/db/testDb";

const app = express();
app.use(express.json());

// Mock NextResponse
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({
      json: () => data,
      status: options?.status || 200,
    })),
  },
}));

// Mock database
jest.doMock("../src/db/index", () => ({
  db: {
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockResolvedValue({}),
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    execute: jest.fn().mockResolvedValue([{ id: 1, projectName: "GitFund" }]),
  },
}));

const { db } = require("../src/db/index");

describe("Assign API", () => {
  let server: any;

  beforeAll(() => {
    app.get("/api/assignedIssue", async (req, res) => {
      const response = await GET();
      res.status(response.status).json(await response.json());
    });

    app.post("/api/assignedIssue", async (req, res) => {
      const mockRequest = new Request("http://localhost/api/assignedIssue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body),
      });
      const response = await POST(mockRequest);
      res.status(response.status).json(await response.json());
    });

    server = createServer(app);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/assignedIssue", () => {
    it("returns assigned issues", async () => {
      const res = await request(server).get("/api/assignedIssue");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("assignedIssues");
      expect(Array.isArray(res.body.assignedIssues)).toBe(true);
    });

    it("handles database errors", async () => {
      db.execute.mockRejectedValueOnce(new Error("DB error"));
      const res = await request(server).get("/api/assignedIssue");
      expect(res.status).toBe(500);
      expect(res.body.error).toContain("Failed to fetch assigned issues");
    });
  });

  describe("POST /api/assignedIssue", () => {
    const validData = {
      projectName: "GitFund",
      Contributor_id: "EMP123",
      issue: "Fix dark mode bug",
      image_url: "https://example.com/image.png",
      name: "Lovepreet",
      description: "Detailed bug info",
    };

    it("works with valid data", async () => {
      const res = await request(server)
        .post("/api/assignedIssue")
        .send(validData);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("fails with missing required fields", async () => {
      const res = await request(server).post("/api/assignedIssue").send({
        Contributor_id: "EMP123",
        issue: "Fix bug",
        name: "Lovepreet",
      });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("handles database errors", async () => {
      db.insert.mockRejectedValueOnce(new Error("DB error"));
      const res = await request(server)
        .post("/api/assignedIssue")
        .send(validData);
      expect(res.status).toBe(500);
      expect(res.body.error).toContain("Failed to assign issue");
    });
  });
});
