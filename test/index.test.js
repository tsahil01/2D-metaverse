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

  
});
