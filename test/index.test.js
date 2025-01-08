const axios = require("axios");

const backendUrl = "http://localhost:3000";
const wsServerUrl = "ws://localhost:3001";

async function singup(username, password, type) {
  return await fetch(`${backendUrl}/api/v1/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      password,
      type,
    }),
  });
}

async function signin(username, password) {
  return await fetch(`${backendUrl}/api/v1/signin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      password,
    }),
  });
}

describe("Authentication", () => {
  test("User be able to sign up", async () => {
    const username = "user" + Math.random();
    const password = "password";
    const type = "user";

    const res = await singup(username, password, type);

    expect(res.status).toBe(200);

    const sendAgainRes = await singup(username, password, type);

    expect(sendAgainRes.status).toBe(400);
  });

  test("Username with empty string should not be allowed", async () => {
    const username = "";
    const password = "password";
    const type = "user";

    const res = await singup(username, password, type);
    expect(res.status).toBe(400);
  });

  test("Signin is good if user exists", async () => {
    const username = "user" + Math.random();
    const password = "12344232";
    const type = "user";

    await singup(username, password, type);
    const res = await signin(username, password);

    const data = await res.json();
    await console.log("data", data);

    expect(res.status).toBe(200);
    expect(data).toHaveProperty("token");
  });

  test("Signin is fails if username and password is incorrect", async () => {
    const username = "user" + Math.random();
    const password = "12344232";

    const res = await signin(username, password);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data).toHaveProperty("msg");
  });
});

describe("User Metadeta endpoint", () => {
  let token = "";
  let avatarId = "";

  beforeAll(async () => {
    const username = "user" + Math.random();
    const password = "password";
    const type = "admin";

    // signup
    singup(username, password, type);

    const res = await signin(username, password);
    const data = await res.json();
    token = data.token;

    const avatarRes = await axios.post(
      `${backendUrl}/api/v1/admin/avatar`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
        name: "Timmy",
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    avatarId = avatarRes.data.avatarId;
  });

  test("User cant update their metadata with wrong avatar id", async () => {
    const avatarId = "123";
    const res = await axios.post(
      `${backendUrl}/api/v1/user/metadata`,
      {
        avatarId,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    expect(res.status).toBe(400);
  });

  test("User can update their metadata", async () => {
    expect(avatarId).not.toBe("");
    const res = await fetch(`${backendUrl}/api/v1/user/metadata`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        avatarId,
      }),
    });
    expect(res.status).toBe(200);
  });

  test("User cant update their metadata if token is not send to server (unauth)", async () => {
    expect(avatarId).not.toBe("");
    const res = await fetch(`${backendUrl}/api/v1/user/metadata`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        avatarId,
      }),
    });

    expect(res.status).toBe(403);
  });
});

describe("User avatar information", () => {
  let token = "";
  let avatarId = "";
  let userId = "";

  beforeAll(async () => {
    const username = "user" + Math.random();
    const password = "password";

    await singup(username, password, "user");

    const res = await signin(username, password);
    const data = await res.json();

    token = data.token;
    userId = data.userId;
  });

  test("get back avatar info for user", async () => {
    const avatarRes = await fetch(
      `${backendUrl}/api/v1/user/metadata/bulk?ids=[${userId}]`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data = await avatarRes.json();

    expect(data.avatars.length).toBe(1);
    expect(data.avatars[0].userId).toBe(userId);
    avatarId = data[0].avatarId;
  });

  test("get all avaible avatar that user has created", async () => {
    const avatarRes = await fetch(`${backendUrl}/api/v1/avatars`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await avatarRes.json();
    expect(data.avatars.length).not.toBe(0);
    const currentAvatar = data.avatars.find((x) => x.avatarId === avatarId);
    expect(currentAvatar).tobeDefined();
  });
});

describe("Space Manegement", () => {
  let mapId;
  let element1Id;
  let element2Id;
  let adminId;
  let adminToken;
  let userId;
  let userToken;

  beforeAll(async () => {
    const adminUsername = "user" + Math.random();
    const adminPassword = "password";
    const type = "admin";

    const signupRes = await singup(adminUsername, adminPassword, type);
    const data = await signupRes.json();
    adminId = data.userId;

    const res = await signin(adminUsername, adminPassword);
    const resData = await res.json();
    adminToken = resData.token;

    // create element
    const element1Res = await axios.post(
      `${backendUrl}/api/v1/admin/element`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 1,
        height: 1,
        static: true, // weather or not the user can sit on top of this element (is it considered as a collission or not)
      },
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );
    element1Id = element1Res.data.id;

    const element2Res = await axios.post(
      `${backendUrl}/api/v1/admin/element`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 1,
        height: 1,
        static: true, // weather or not the user can sit on top of this element (is it considered as a collission or not)
      },
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );
    element2Id = element2Res.data.id;

    // create map
    const createMapRes = await axios.post(
      `${backendUrl}/api/v1/admin/map`,
      {
        thumbnail: "https://thumbnail.com/a.png",
        dimensions: "100x200",
        name: "100 person interview room",
        defaultElements: [
          {
            elementId: element1Id,
            x: 20,
            y: 20,
          },
          {
            elementId: element2Id,
            x: 18,
            y: 20,
          },
        ],
      },
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );
    mapId = createMapRes.data.mapId;

    // create user
    const username = "user" + Math.random();
    const userpassword = "password";

    const userSignup = await singup(username, userpassword, "user");
    const userSignupData = await userSignup.json();
    userId = userSignupData.userId;

    const userRes = await signin(username, userpassword);
    const userResData = await userRes.json();
    userToken = userResData.token;
  });

  test("user should create space", async () => {
    const name = "space" + Math.random();
    const dimension = "100x100";

    const res = await fetch(`${backendUrl}/api/v1/space`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        name,
        dimension,
        mapId,
      }),
    });

    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data).toHaveProperty("spaceId");
  });

  test("user should create space without mapId (empty space)", async () => {
    const name = "space" + Math.random();
    const dimension = "100x100";

    const res = await fetch(`${backendUrl}/api/v1/space`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        name,
        dimension,
      }),
    });

    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data).toHaveProperty("spaceId");
  });

  test("user is not able to create space without mapId and dimentions", async () => {
    const name = "space" + Math.random();
    const res = await fetch(`${backendUrl}/api/v1/space`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        name,
      }),
    });

    expect(res.status).not.toBe(201);
  });

  test("user is not able to delete a space with incorrect spaceId", async () => {
    const name = "space" + Math.random();

    const res = await fetch(`${backendUrl}/api/v1/space/randomInvalidId`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
    });

    expect(res.status).toBe(400);
  });

  test("user is able to delete a space with correct spaceId", async () => {
    const name = "space" + Math.random();
    const dimension = "100x100";
    const createSpaceRes = await fetch(`${backendUrl}/api/v1/space`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        name,
        dimension,
        mapId,
      }),
    });

    const createSpaceData = await createSpaceRes.json();
    const spaceId = createSpaceData.spaceId;

    const res = await fetch(`${backendUrl}/api/v1/space/${spaceId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
    });
    expect(res.status).toBe(200);
  });

  test("user should not be able to delete a space with incorrect token", async () => {
    const name = "space" + Math.random();
    const dimension = "100x100";

    const createSpaceRes = await fetch(`${backendUrl}/api/v1/space`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        name,
        dimension,
        mapId,
      }),
    });

    const createSpaceData = await createSpaceRes.json();
    const spaceId = createSpaceData.spaceId;

    const res = await fetch(`${backendUrl}/api/v1/space/${spaceId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
    });
    expect(res.status).not.toBe(200);
  });

  test("admin has no spaces", async () => {
    const res = await fetch(`${backendUrl}/api/v1/space/all`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
    });
    const data = await res.json();
    expect(data.spaces.length).toBe(0);
  });

  test("get all spaces of a user", async () => {
    const name = "space" + Math.random();
    const dimension = "100x100";

    await fetch(`${backendUrl}/api/v1/space`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        name,
        dimension,
        mapId,
      }),
    });

    const res = await fetch(`${backendUrl}/api/v1/space/all`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
    });

    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.spaces.length).not.toBe(0);
  });
});

// change to fetch in below tests

describe("Arena endpoint", () => {
  let mapId;
  let element1Id;
  let element2Id;
  let adminId;
  let adminToken;
  let userId;
  let userToken;
  let spaceId;

  beforeAll(async () => {
    const adminUsername = "user" + Math.random();
    const adminPassword = "password";
    const type = "admin";

    const signup = await axios.post(`${backendUrl}/api/v1/signup`, {
      adminUsername,
      adminPassword,
      type: "admin",
    });
    adminId = signup.data.userId;

    const res = await axios.post(`${backendUrl}/api/v1/signin`, {
      adminUsername,
      adminPassword,
    });
    adminToken = res.data.token;

    // create element
    const element1Res = await axios.post(
      `${backendUrl}/api/v1/admin/element`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 1,
        height: 1,
        static: true,
      },
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );
    element1Id = element1Res.data.id;

    const element2Res = await axios.post(
      `${backendUrl}/api/v1/admin/element`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 1,
        height: 1,
        static: true,
      },
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );
    element2Id = element2Res.data.id;

    // create map
    const createMapRes = await axios.post(
      `${backendUrl}/api/v1/admin/map`,
      {
        thumbnail: "https://thumbnail.com/a.png",
        dimensions: "100x200",
        name: "new map" + Math.random(),
        defaultElements: [
          {
            elementId: element1Id,
            x: 20,
            y: 20,
          },
          {
            elementId: element2Id,
            x: 18,
            y: 20,
          },
        ],
      },
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );
    mapId = createMapRes.data.mapId;

    // create user
    const username = "user" + Math.random();
    const userpassword = "password";

    const userSignup = await axios.post(`${backendUrl}/api/v1/signup`, {
      username: username,
      password: userpassword,
      type: "user",
    });
    userId = userSignup.data.userId;

    const userRes = await axios.post(`${backendUrl}/api/v1/signin`, {
      username,
      password: userpassword,
    });
    userToken = userRes.data.token;

    const name = "space" + Math.random();
    const dimension = "100x100";

    const createSpace = await axios.post(
      `${backendUrl}/api/v1/space`,
      {
        name,
        dimension,
        mapId,
      },
      { headers: { Authorization: `Bearer ${userToken}` } }
    );
    spaceId = createSpace.data.spaceId;
  });

  test("sending wrong spaceid for the user", async () => {
    const res = await axios.get(`${backendUrl}/api/v1/space/wrongSpaceId`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    expect(res.status).toBe(400);
  });

  test("get space of the user for arena", async () => {
    const res = await axios.get(`${backendUrl}/api/v1/space/${spaceId}`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    expect(res.status).toBe(200);
    expect(res.data).toHaveProperty("dimensions");
    expect(res.data).toHaveProperty("elements");
    expect(res.data.elements).length.toBe(2);
  });

  test("add element to the space", async () => {
    const res = await axios.post(
      `${backendUrl}/api/v1/space/element`,
      {
        elementId: element1Id,
        spaceId,
        x: 11,
        y: 13,
      },
      {
        headers: { Authorization: `Bearer ${userToken}` },
      }
    );

    const newRes = await axios.get(`${backendUrl}/api/v1/space/${spaceId}`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });

    expect(res.status).toBe(200);
    expect(newRes.data.elements).length.toBe(3);
  });

  test("add element fails for non existing x and y", async () => {
    const res = await axios.post(
      `${backendUrl}/api/v1/space/element`,
      {
        elementId: element1Id,
        spaceId,
        x: 11000,
        y: 1300000,
      },
      {
        headers: { Authorization: `Bearer ${userToken}` },
      }
    );

    expect(res.status).toBe(400);
  });

  test("cannot add element to the space if error element id", async () => {
    const res = await axios.post(
      `${backendUrl}/api/v1/space/${spaceId}/element`,
      {
        elementId: "wrongElementId",
        x: 10,
        y: 10,
      },
      {
        headers: { Authorization: `Bearer ${userToken}` },
      }
    );
    expect(res.status).toBe(400);
  });

  test("delete the element from the arena", async () => {
    const res = await axios.delete(
      `${backendUrl}/api/v1/space/element`,
      {
        spaceId,
        element1Id,
      },
      { headers: { Authorization: `Bearer ${userToken}` } }
    );

    expect(res.status).toBe(200);
    expect(res.data.elements).length.toBe(2);
  });

  test("see all available elements", async () => {
    const res = await axios.get(`${backendUrl}/api/v1/elements`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    expect(res.status).toBe(200);
    expect(res.data.elements.length).not.toBe(0);
  });
});

describe("Admin endpoints", () => {
  let adminId;
  let adminToken;
  let userId;
  let userToken;

  beforeAll(async () => {
    const adminUsername = "admin" + Math.random();
    const adminPassword = "password";
    const type = "admin";

    const adminSignup = await axios.post(`${backendUrl}/api/v1/signup`, {
      adminUsername,
      adminPassword,
      type,
    });
    adminId = adminSignup.data.userId;

    const adminLogin = await axios.post(`${backendUrl}/api/v1/signin`, {
      adminUsername,
      adminPassword,
    });
    adminToken = adminLogin.data.token;

    const username = "user" + Math.random();
    const password = "password";

    const userSignup = await axios.post(`${backendUrl}/api/v1/signup`, {
      username,
      password,
      type: "user",
    });
    userId = userSignup.data.userId;

    const userLogin = await axios.post(`${backendUrl}/api/v1/signin`, {
      username,
      password,
    });
    userToken = userLogin.data.token;
  });

  test("user cannot create elements", async () => {
    const res = await axios.post(
      `${backendUrl}/api/v1/admin/element`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 1,
        height: 1,
        static: true,
      },
      { headers: { Authorization: `Bearer ${userToken}` } }
    );

    expect(res.status).toBe(403);
  });

  test("only admin creates element", async () => {
    const elementsRes = await axios.get(`${backendUrl}/api/v1/elements`, {
      headers: { Authorization: `Bearer ${adminToken}` }, // Sahil - I think this should be adminToken
    });
    const initialElementCount = elementsRes.data.elements.length;

    const res = await axios.post(
      `${backendUrl}/api/v1/admin/element`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 1,
        height: 1,
        static: true,
      },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    expect(res.status).toBe(201);
    expect(res.data).toHaveProperty("id");

    const newCountRes = await axios.get(`${backendUrl}/api/v1/elements`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(newCountRes.data.elements.length).toBe(initialElementCount + 1);
  });

  test("user cannot update the elements imgUrl", async () => {
    const createEleRes = await axios.post(
      `${backendUrl}/api/v1/admin/element`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 1,
        height: 1,
        static: true,
      },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    const elementId = createEleRes.data.id;

    const res = await axios.put(
      `${backendUrl}/api/v1/admin/element/${elementId}`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
      },
      { headers: { Authorization: `Bearer ${userToken}` } }
    );
    expect(res.status).toBe(400);
  });

  test("only admin update the elements imgUrl", async () => {
    const createEleRes = await axios.post(
      `${backendUrl}/api/v1/admin/element`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 1,
        height: 1,
        static: true,
      },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    const elementId = createEleRes.data.id;

    const res = await axios.put(
      `${backendUrl}/api/v1/admin/element/${elementId}`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
      },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    expect(res.status).toBe(200);
  });

  test("only admin can create avatars", async () => {
    const res = await axios.post(
      `${backendUrl}/api/v1/admin/avatar`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
        name: "Timmy",
      },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );

    expect(res.status).toBe(201);
    expect(res.data).toHaveProperty("avatarId");
  });

  test("user cannot create avatars", async () => {
    const res = await axios.post(
      `${backendUrl}/api/v1/admin/avatar`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
        name: "Timmy",
      },
      { headers: { Authorization: `Bearer ${userToken}` } }
    );

    expect(res.status).toBe(201);
    expect(res.data).toHaveProperty("avatarId");
  });

  test("only admin can create maps", async () => {
    // create element
    const element1 = await axios.post(
      `${backendUrl}/api/v1/admin/element`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 1,
        height: 1,
        static: true,
      },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    const element1Id = element1.data.id;

    const element2 = await axios.post(
      `${backendUrl}/api/v1/admin/element`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 1,
        height: 1,
        static: true,
      },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    const element2Id = element2.data.id;

    const res = await axios.post(
      `${backendUrl}/api/v1/admin/map`,
      {
        thumbnail: "https://thumbnail.com/a.png",
        dimensions: "100x200",
        name: "new map" + Math.random(),
        defaultElements: [
          {
            elementId: element1Id,
            x: 20,
            y: 20,
          },
          {
            elementId: element2Id,
            x: 18,
            y: 20,
          },
        ],
      },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );

    expect(res.status).toBe(201);
    expect(res.data).toHaveProperty("id");
  });

  test("user cannot create maps", async () => {
    // create element
    const element1 = await axios.post(
      `${backendUrl}/api/v1/admin/element`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 1,
        height: 1,
        static: true,
      },
      { headers: { Authorization: `Bearer ${userToken}` } }
    );
    const element1Id = element1.data.id;

    const element2 = await axios.post(
      `${backendUrl}/api/v1/admin/element`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 1,
        height: 1,
        static: true,
      },
      { headers: { Authorization: `Bearer ${userToken}` } }
    );
    const element2Id = element2.data.id;

    const res = await axios.post(
      `${backendUrl}/api/v1/admin/map`,
      {
        thumbnail: "https://thumbnail.com/a.png",
        dimensions: "100x200",
        name: "new map" + Math.random(),
        defaultElements: [
          {
            elementId: element1Id,
            x: 20,
            y: 20,
          },
          {
            elementId: element2Id,
            x: 18,
            y: 20,
          },
        ],
      },
      { headers: { Authorization: `Bearer ${userToken}` } }
    );

    expect(res.status).toBe(201);
    expect(res.data).toHaveProperty("id");
  });
});

describe("Websocket tests", () => {
  let adminToken;
  let adminId;
  let userToken;
  let userId;
  let ws1;
  let ws2;
  let ws1Msgs = [];
  let ws2Msgs = [];
  let userX;
  let userY;
  let adminX;
  let adminY;

  async function setupHttp() {
    const adminUsername = "admin" + Math.random();
    const username = "user" + Math.random();
    const password = "password";

    const adminSignup = await axios.post(`${backendUrl}/api/v1/signup`, {
      username: adminUsername,
      password,
      type: "admin",
    });
    adminId = adminSignup.data.userId;

    const adminLogin = await axios.post(`${backendUrl}/api/v1/signin`, {
      username: adminUsername,
      password,
    });
    adminToken = adminLogin.data.token;

    const userSignup = await axios.post(`${backendUrl}/api/v1/signup`, {
      username,
      password,
      type: "user",
    });
    userId = userSignup.data.userId;

    const userLogin = await axios.post(`${backendUrl}/api/v1/signin`, {
      username,
      password,
    });
    userToken = userLogin.data.token;

    // create elements
    const element1Res = await axios.post(
      `${backendUrl}/api/v1/admin/element`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 1,
        height: 1,
        static: true,
      },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );

    const element2Res = await axios.post(
      `${backendUrl}/api/v1/admin/element`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 1,
        height: 1,
        static: true,
      },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    const element1Id = element1Res.data.id;
    const element2Id = element2Res.data.id;

    // create map
    const createMapRes = await axios.post(
      `${backendUrl}/api/v1/admin/map`,
      {
        thumbnail: "https://thumbnail.com/a.png",
        dimensions: "100x200",
        name: "100 person interview room",
        defaultElements: [
          {
            elementId: element1Id,
            x: 20,
            y: 20,
          },
          {
            elementId: element2Id,
            x: 18,
            y: 20,
          },
        ],
      },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    const mapId = createMapRes.data.id;

    // create avatar
    const createAvatarRes = await axios.post(
      `${backendUrl}/api/v1/admin/avatar`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
        name: "Timmy",
      },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    const avatarId = createAvatarRes.data.avatarId;

    // create space
    const createSpaceRes = await axios.post(
      `${backendUrl}/api/v1/space`,
      {
        name: "Test" + Math.random(),
        dimensions: "100x200",
        mapId: mapId,
      },
      { headers: { Authorization: `Bearer ${userToken}` } }
    );
    const spaceId = createSpaceRes.data.spaceId;

    //  add element
    const addElement = await axios.post(
      `${backendUrl} /api/v1/space/element`,
      {
        elementId: element1Id,
        spaceId: spaceId,
        x: 50,
        y: 20,
      },
      { headers: { Authorization: `Bearer ${userToken}` } }
    );
  }

  function waitForAndPopLtsMsgs(msgArr) {
    return new Promise((r) => {
      if (msgArr.length > 0) {
        resolve(msgArr.shift());
      } else {
        let interval = setInterval(() => {
          if (msgArr.length > 0) {
            resolve(msgArr.shift());
            clearInterval(interval);
          }
        }, 100);
      }
    });
  }

  async function setupWs() {
    ws1 = new WebSocket(wsServerUrl);

    await new Promise((r) => {
      ws1.onopen = r;
    });
    ws1.onmessage = (event) => {
      ws1.push(JSON.parse(event.data));
    };

    ws2 = new WebSocket(wsServerUrl);

    await new Promise((r) => {
      ws2.onopen = r;
    });
    ws2.onmessage = (event) => {
      ws2.push(JSON.parse(event.data));
    };
  }

  beforeAll(async () => {
    setupHttp();
    setupWs();
  });

  test("get back ack for joining the space", async () => {
    ws1.send(
      JSON.stringify({
        type: "join",
        payload: {
          spaceId,
          token: userToken,
        },
      })
    );
    const msg1 = await waitForAndPopLtsMsgs(ws1Msgs);

    ws2.send(
      JSON.stringify({
        type: "join",
        payload: {
          spaceId,
          token: adminToken,
        },
      })
    );

    const msg2 = await waitForAndPopLtsMsgs(ws2Msgs);
    const msg3 = await waitForAndPopLtsMsgs(ws1Msgs);

    expect(msg1.type).toBe("space-joined");
    expect(msg2.type).toBe("space-joined");
    expect(msg1.payload.users.length).toBe(0);
    expect(msg2.payload.users.length).toBe(1);
    expect(msg3.type).toBe("user-joined");
    expect(msg3.payload.userId).toBe(userId);

    userX = msg1.payload.spawn.x;
    userY = msg1.payload.spawn.y;
    adminX = msg2.payload.spawn.x;
    adminY = msg2.payload.spawn.y;

    expect(msg3.payload.spawn.x).toBe(adminX);
    expect(msg3.payload.spawn.y).toBe(adminY);
  });

  test("User should not be able to move across the boundry of the wall", async () => {
    ws1.send(
      JSON.stringify({
        type: "movement",
        payload: { x: 20000000, y: 300000000 },
      })
    );

    const msg = await waitForAndPopLtsMsgs(ws1Msgs);
    expect(msg.type).toBe("movement-rejected");
    expect(msg.payload.x).toBe(userX);
    expect(msg.payload.y).toBe(userY);
  });

  test("User should not be able to move two blocks at the same time", async () => {
    ws1.send(
      JSON.stringify({
        type: "movement",
        payload: { x: userX + 2, y: userY + 2 },
      })
    );

    const msg = await waitForAndPopLtsMsgs(ws1Msgs);
    expect(msg.type).toBe("movement-rejected");
    expect(msg.payload.x).toBe(userX);
    expect(msg.payload.y).toBe(userY);
  });

  test("User should be able to move one block and should broadcast to other user", async () => {
    ws1.send(
      JSON.stringify({
        type: "movement",
        payload: { x: userX + 1, y: userY },
      })
    );

    const msg = await waitForAndPopLtsMsgs(ws2Msgs);
    expect(msg.type).toBe("movement");
    expect(msg.payload.x).toBe(userX + 1);
    expect(msg.payload.y).toBe(userY);
    expect(msg.payload.userId).toBe(userId);
    userX = msg.payload.x;
    userY = msg.payload.y;
  });

  test("If user leaves the space, other users should be notified", async () => {
    ws1.close();
    const msg = await waitForAndPopLtsMsgs(ws2Msgs);
    expect(msg.type).toBe("user-left");
    expect(msg.payload.userId).toBe(userId);
  });
});
