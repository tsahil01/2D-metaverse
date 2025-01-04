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

describe("User Metadeta endpoint", async () => {
  let token = "";
  let avatarId = "";

  beforeAll(async () => {
    const username = "user" + Math.random();
    const password = "password";
    const type = "admin";

    // signup
    await axios.post(`${backendUrl}/api/v1/signup`, {
      username,
      password,
      type,
    });

    const res = await axios.post(`${backendUrl}/api/v1/signin`, {
      username,
      password,
    });

    token = res.data.token;

    const avatarRes = await axios.post(`${backendUrl}/api/v1/admin/avatar`, {
      imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
      name: "Timmy",
    }, { headers: { Authorization: `Bearer ${token}`,}
    });
    avatarId = avatarRes.data.avatarId;

  });

  test("User cant update their metadata with wrong avatar id", async () => {
    const avatarId = "123";
    const res = await axios.post(`${backendUrl}/api/v1/user/metadata`, {
      avatarId,
    },
    {
      headers: { Authorization: `Bearer ${token}`, },
    });
    expect(res.status).toBe(400);
  });

  test("User can update their metadata", async () => {
    expect(avatarId).not.toBe("");
    const res = await axios.post(
      `${backendUrl}/api/v1/user/metadata`, {
        avatarId,
      },
      {
        headers: { Authorization: `Bearer ${token}`, },
      }
    );
    expect(res.status).toBe(200);
  });

  test("User cant update their metadata if token is not send to server (unauth)", async () => {
    expect(avatarId).not.toBe("");
    const res = await axios.post(
      `${backendUrl}/api/v1/user/metadata`, {
        avatarId,
      }
    );
    expect(res.status).toBe(403);
  });
});

describe("User avatar information", async () => {
    let token = "";
    let avatarId = "";
    let userId = "";

    beforeAll(async () => {
        const username = "user" + Math.random();
        const password = "password";

        await axios.post(`${backendUrl}/api/v1/signup`, {
            username,
            password,
            type: "user",
        });

        const res = await axios.post(`${backendUrl}/api/v1/signin`, {
            username,
            password,
        });

        token = res.data.token;
        userId = res.data.userId;
    })

    test("get back avatar info for user", async () => {
        const avatarRes = await axios.get(`${backendUrl} /api/v1/user/metadata/bulk?ids=[${userId}]`, {
            headers: { Authorization: `Bearer ${token}` },
        })
        expect(avatarRes.data.avatars.length).toBe(1);
        expect(avatarRes.data.avatars[0].userId).toBe(userId);
        
        avatarId = avatarRes.data[0].avatarId;
    });

    test("get all avaible avatar that user has created", async () => {
        const avatarRes = await axios.get(`${backendUrl}/api/v1/avatars`, {
            headers: { Authorization: `Bearer ${token}` },
        })
        expect(avatarRes.data.avatars.length).not.toBe(0);
        const currentAvatar = avatarRes.data.avatars.find(x => x.avatarId === avatarId);
        expect(currentAvatar).tobeDefined();
    });
});
