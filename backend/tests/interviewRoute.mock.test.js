import request from "supertest";
import app from "../app.js";
import axios from "axios";

jest.mock("axios");

describe("POST /api/interview (mocked)", () => {
  test("returns mocked Gemini response", async () => {
    axios.post.mockResolvedValue({
      data: {
        candidates: [
          {
            content: {
              parts: [{ text: "Mocked: Tell me about yourself." }],
            },
          },
        ],
      },
    });

    const response = await request(app)
      .post("/api/interview")
      .send({
        jobTitle: "Junior Nurse",
        userMessage: "Hi, I'm ready to start the interview.",
        history: [],
      });
    //   console.log("response.body keys:", Object.keys(response.body));
      console.log("Mocked response:", response.body);
    expect(response.statusCode).toBe(200);
    expect(response.body.reply).toMatch(/Mocked/i);
  });

});
