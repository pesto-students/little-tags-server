const request = require("supertest");

const app = require("../app");
const Admin = require("../models/Admin");

beforeEach(async () => {
  //   console.log("clear test users");
  await Admin.deleteMany({ email: "test@test.com" });
});

test("Should respond", async () => {
  await request(app).get("/").expect(200);
});

describe("Signup API", () => {
  test("Should sign up for a user", async () => {
    await request(app)
      .post("/api/auth/v1/signup")
      .send({
        name: "Test user",
        email: "test@test.com",
        password: "test1234",
      })
      .expect(201);
  });

  test("Should not signup with duplicate email", async () => {
    await request(app)
      .post("/api/auth/v1/signup")
      .send({
        name: "Test user",
        email: "test2@test.com",
        password: "test1234",
      })
      .expect(400);
  });

  test("Should not signup with invalid email", async () => {
    await request(app)
      .post("/api/auth/v1/signup")
      .send({
        name: "Test user",
        email: "test3@test",
        password: "test1234",
      })
      .expect(400);
  });

  test("Should not signup with invalid password", async () => {
    await request(app)
      .post("/api/auth/v1/signup")
      .send({
        name: "Test user",
        email: "test3@test",
        password: "1234",
      })
      .expect(400);
  });
});

describe("Login API", () => {
  test("Should login a user", async () => {
    await request(app)
      .post("/api/auth/v1/login")
      .send({
        email: "test2@test.com",
        password: "test1234",
      })
      .expect(201);
  });

  test("Should not login with wrong email", async () => {
    await request(app)
      .post("/api/auth/v1/login")
      .send({
        email: "test2@test",
        password: "test1234",
      })
      .expect(400);
  });

  test("Should not login with wrong password", async () => {
    await request(app)
      .post("/api/auth/v1/login")
      .send({
        email: "test2@test",
        password: "test123",
      })
      .expect(400);
  });
});
