const axios = require("axios");

const backendUrl = "http://localhost:3000";

describe("Authentication", () => {
  test("User be able to sign up", async () => {
    const username = "user" + Math.random();
    const password = "password";
    const type = "user";

    const res = await axios.post(`${backendUrl}/api/v1/signup`, {
      username,
      password,
      type,
    });
    expect(res.status).toBe(201);

    const sendAgainRes = await axios.post(`${backendUrl}/api/v1/signup`, {
      username,
      password,
      type,
    });
    expect(sendAgainRes.status).toBe(400);
  });

  test("Username with empty string should not be allowed", async () => {
    const username = "";
    const password = "password";
    const type = "user";

    const res = await axios.post(`${backendUrl}/api/v1/signup`, {
      username,
      password,
      type,
    });
    expect(res.status).toBe(400);
  });

  test("Signin is good if user exists", async () => {
    const username = "user" + Math.random();
    const password = "12344232";
    const type = "user";

    await axios.post(`${backendUrl}/api/v1/signup`, {
      username,
      password,
      type,
    });

    const res = await axios.post(`${backendUrl}/api/v1/signin`, {
      username,
      password,
    });

    expect(res.status).toBe(200);
    expect(res.data).toHaveProperty("token");
  });

  test("Signin is fails if username and password is incorrect", async () => {
    const username = "user" + Math.random();
    const password = "12344232";

    const res = await axios.post(`${backendUrl}/api/v1/signin`, {
      username: "wrong" + username,
      password,
    });

    expect(res.status).toBe(403);
    expect(res.data).toHaveProperty("message");
  });

});
