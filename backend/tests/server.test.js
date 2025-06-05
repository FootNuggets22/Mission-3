import request from "supertest";
import app from "../app.js";

describe("POST api/interview", () => {
  test("should return 200 and a JSON messgage", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty(
      "message",
      "Gemini API is up and running 🚀"
    );
  });
  test("should return the first interview question", async () => {
    const res = await request(app).post("/api/interview").send({
      jobTitle: "Frontend Developer",
      userMessage: "Hi, I'm ready to start the interview.",
      history: [],
    });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("reply");

    const aiReply = res.body.reply.toLowerCase();
    expect(aiReply).toMatch(/tell me|telling me|about yourself/i);
  });
  test("should return 400 error if job title is missing", async () => {
    const res = await request(app).post("/api/interview").send({
      userMessage: "Hello",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/job title is required/i);
  });
  test("should return 400 error if user message is missing during follow-up", async () => {
    const res = await request(app)
      .post("/api/interview")
      .send({
        jobTitle: "Frontend Developer",
        history: [
          {
            role: "assistant",
            content: "What interests you about this role?",
          },
        ],
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/user message is required/i);
  });

  test("should ask for clarification when user sends vague input after first AI question", async () => {
    const res = await request(app)
      .post("/api/interview")
      .send({
        jobTitle: "Frontend Developer",
        history: [
          {
            role: "assistant",
            content: "Tell me about yourself",
          },
        ],
        userMessage: "apple tree",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.reply).toMatch(
      /clarify|elaborate|more about your experience|misunderstanding/i
    );
  });
});
