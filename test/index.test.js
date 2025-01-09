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

    const avatarRes = await fetch(`${backendUrl}/api/v1/avatar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
        name: "Timmy",
      }),
    });

    const avatarResData = await avatarRes.json();

    avatarId = avatarResData.avatarId;
  });

  test("User cant update their metadata with wrong avatar id", async () => {
    const avatarId = "123";
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
    avatarId = data.avatars[0].avatarId;
  });

  test("get all available avatar that user has created", async () => {
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
    expect(currentAvatar).toBeDefined();
  });
});

describe("Space Management", () => {
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

    const signupRes = await fetch(`${backendUrl}/api/v1/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: adminUsername,
        password: adminPassword,
        type,
      }),
    });
    const signupData = await signupRes.json();
    adminId = signupData.userId;

    const signinRes = await fetch(`${backendUrl}/api/v1/auth/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: adminUsername,
        password: adminPassword,
      }),
    });
    const signinData = await signinRes.json();
    adminToken = signinData.token;

    // Create elements
    const element1Res = await fetch(`${backendUrl}/api/v1/admin/element`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 1,
        height: 1,
        static: true,
      }),
    });
    const element1Data = await element1Res.json();
    element1Id = element1Data.id;

    const element2Res = await fetch(`${backendUrl}/api/v1/admin/element`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 1,
        height: 1,
        static: true,
      }),
    });
    const element2Data = await element2Res.json();
    element2Id = element2Data.id;

    // Create map
    const mapRes = await fetch(`${backendUrl}/api/v1/admin/map`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        thumbnail: "https://thumbnail.com/a.png",
        dimensions: "100x200",
        name: "100 person interview room",
        defaultElements: [
          { elementId: element1Id, x: 20, y: 20 },
          { elementId: element2Id, x: 18, y: 20 },
        ],
      }),
    });
    const mapData = await mapRes.json();
    mapId = mapData.mapId;

    // Create user
    const username = "user" + Math.random();
    const userPassword = "password";

    const userSignupRes = await fetch(`${backendUrl}/api/v1/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password: userPassword, type: "user" }),
    });
    const userSignupData = await userSignupRes.json();
    userId = userSignupData.userId;

    const userSigninRes = await fetch(`${backendUrl}/api/v1/auth/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password: userPassword }),
    });
    const userSigninData = await userSigninRes.json();
    userToken = userSigninData.token;
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
      body: JSON.stringify({ name, dimension, mapId }),
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
      body: JSON.stringify({ name, dimension }),
    });
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data).toHaveProperty("spaceId");
  });

  test("user is not able to create space without mapId and dimensions", async () => {
    const name = "space" + Math.random();

    const res = await fetch(`${backendUrl}/api/v1/space`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({ name }),
    });

    expect(res.status).not.toBe(201);
  });

  test("user is not able to delete a space with incorrect spaceId", async () => {
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
      body: JSON.stringify({ name, dimension, mapId }),
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

// // change to fetch in below tests

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

    const signup = await fetch(`${backendUrl}/api/v1/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminUsername, adminPassword, type: "admin" }),
    }).then((res) => res.json());
    adminId = signup.userId;

    const res = await fetch(`${backendUrl}/api/v1/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminUsername, adminPassword }),
    }).then((res) => res.json());
    adminToken = res.token;

    // create element
    const element1Res = await fetch(`${backendUrl}/api/v1/admin/element`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 1,
        height: 1,
        static: true,
      }),
    }).then((res) => res.json());
    element1Id = element1Res.id;

    const element2Res = await fetch(`${backendUrl}/api/v1/admin/element`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 1,
        height: 1,
        static: true,
      }),
    }).then((res) => res.json());
    element2Id = element2Res.id;

    // create map
    const createMapRes = await fetch(`${backendUrl}/api/v1/admin/map`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
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
      }),
    }).then((res) => res.json());
    mapId = createMapRes.mapId;

    // create user
    const username = "user" + Math.random();
    const userpassword = "password";

    const userSignup = await fetch(`${backendUrl}/api/v1/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password: userpassword, type: "user" }),
    }).then((res) => res.json());
    userId = userSignup.userId;

    const userRes = await fetch(`${backendUrl}/api/v1/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password: userpassword }),
    }).then((res) => res.json());
    userToken = userRes.token;

    const name = "space" + Math.random();
    const dimension = "100x100";

    const createSpace = await fetch(`${backendUrl}/api/v1/space`, {
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
    }).then((res) => res.json());
    spaceId = createSpace.spaceId;
  });

  test("sending wrong spaceid for the user", async () => {
    const res = await fetch(`${backendUrl}/api/v1/space/wrongSpaceId`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    expect(res.status).toBe(400);
  });

  test("get space of the user for arena", async () => {
    const res = await fetch(`${backendUrl}/api/v1/space/${spaceId}`, {
      headers: { Authorization: `Bearer ${userToken}` },
    }).then((res) => res.json());
    expect(res.status).toBe(200);
    expect(res).toHaveProperty("dimensions");
    expect(res).toHaveProperty("elements");
    expect(res.elements).length.toBe(2);
  });

  test("add element to the space", async () => {
    const res = await fetch(`${backendUrl}/api/v1/space/element`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        elementId: element1Id,
        spaceId,
        x: 11,
        y: 13,
      }),
    });

    const newRes = await fetch(`${backendUrl}/api/v1/space/${spaceId}`, {
      headers: { Authorization: `Bearer ${userToken}` },
    }).then((res) => res.json());

    expect(res.status).toBe(200);
    expect(newRes.elements).length.toBe(3);
  });

  test("add element fails for non existing x and y", async () => {
    const res = await fetch(`${backendUrl}/api/v1/space/element`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        elementId: element1Id,
        spaceId,
        x: 11000,
        y: 1300000,
      }),
    });
    expect(res.status).toBe(400);
  });

  test("cannot add element to the space if error element id", async () => {
    const res = await fetch(`${backendUrl}/api/v1/space/${spaceId}/element`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        elementId: "wrongElementId",
        x: 10,
        y: 10,
      }),
    });
    expect(res.status).toBe(400);
  });

  test("delete the element from the arena", async () => {
    const res = await fetch(`${backendUrl}/api/v1/space/element`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        spaceId,
        element1Id,
      }),
    }).then((res) => res.json());

    expect(res.status).toBe(200);
    expect(res.elements).length.toBe(2);
  });

  test("see all available elements", async () => {
    const res = await fetch(`${backendUrl}/api/v1/elements`, {
      headers: { Authorization: `Bearer ${userToken}` },
    }).then((res) => res.json());
    expect(res.status).toBe(200);
    expect(res.elements.length).not.toBe(0);
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

    const adminSignup = await fetch(`${backendUrl}/api/v1/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminUsername, adminPassword, type }),
    });
    const adminSignupData = await adminSignup.json();
    adminId = adminSignupData.userId;

    const adminLogin = await fetch(`${backendUrl}/api/v1/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminUsername, adminPassword }),
    });
    const adminLoginData = await adminLogin.json();
    adminToken = adminLoginData.token;

    const username = "user" + Math.random();
    const password = "password";

    const userSignup = await fetch(`${backendUrl}/api/v1/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, type: "user" }),
    });
    const userSignupData = await userSignup.json();
    userId = userSignupData.userId;

    const userLogin = await fetch(`${backendUrl}/api/v1/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const userLoginData = await userLogin.json();
    userToken = userLoginData.token;
  });

  test("user cannot create elements", async () => {
    const res = await fetch(`${backendUrl}/api/v1/admin/element`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 1,
        height: 1,
        static: true,
      }),
    });

    expect(res.status).toBe(403);
  });

  test("only admin creates element", async () => {
    const elementsRes = await fetch(`${backendUrl}/api/v1/elements`, {
      method: "GET",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const elementsData = await elementsRes.json();
    const initialElementCount = elementsData.elements.length;

    const res = await fetch(`${backendUrl}/api/v1/admin/element`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 1,
        height: 1,
        static: true,
      }),
    });
    const resData = await res.json();

    expect(res.status).toBe(201);
    expect(resData).toHaveProperty("id");

    const newCountRes = await fetch(`${backendUrl}/api/v1/elements`, {
      method: "GET",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const newCountData = await newCountRes.json();

    expect(newCountData.elements.length).toBe(initialElementCount + 1);
  });

  test("user cannot update the elements imgUrl", async () => {
    const createEleRes = await fetch(`${backendUrl}/api/v1/admin/element`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 1,
        height: 1,
        static: true,
      }),
    });
    const createEleData = await createEleRes.json();
    const elementId = createEleData.id;

    const res = await fetch(`${backendUrl}/api/v1/admin/element/${elementId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
      }),
    });

    expect(res.status).toBe(400);
  });

  test("only admin updates the elements imgUrl", async () => {
    const createEleRes = await fetch(`${backendUrl}/api/v1/admin/element`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 1,
        height: 1,
        static: true,
      }),
    });
    const createEleData = await createEleRes.json();
    const elementId = createEleData.id;

    const res = await fetch(`${backendUrl}/api/v1/admin/element/${elementId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
      }),
    });

    expect(res.status).toBe(200);
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

    const adminSignup = await fetch(`${backendUrl}/api/v1/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: adminUsername,
        password,
        type: "admin",
      }),
    }).then((res) => res.json());
    adminId = adminSignup.userId;

    const adminLogin = await fetch(`${backendUrl}/api/v1/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: adminUsername,
        password,
      }),
    }).then((res) => res.json());
    adminToken = adminLogin.token;

    const userSignup = await fetch(`${backendUrl}/api/v1/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        password,
        type: "user",
      }),
    }).then((res) => res.json());
    userId = userSignup.userId;

    const userLogin = await fetch(`${backendUrl}/api/v1/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        password,
      }),
    }).then((res) => res.json());
    userToken = userLogin.token;

    // Create elements
    const element1Res = await fetch(`${backendUrl}/api/v1/admin/element`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 1,
        height: 1,
        static: true,
      }),
    }).then((res) => res.json());

    const element2Res = await fetch(`${backendUrl}/api/v1/admin/element`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 1,
        height: 1,
        static: true,
      }),
    }).then((res) => res.json());

    const element1Id = element1Res.id;
    const element2Id = element2Res.id;

    // Create map
    const createMapRes = await fetch(`${backendUrl}/api/v1/admin/map`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        thumbnail: "https://thumbnail.com/a.png",
        dimensions: "100x200",
        name: "100 person interview room",
        defaultElements: [
          { elementId: element1Id, x: 20, y: 20 },
          { elementId: element2Id, x: 18, y: 20 },
        ],
      }),
    }).then((res) => res.json());
    const mapId = createMapRes.id;

    // Create avatar
    const createAvatarRes = await fetch(`${backendUrl}/api/v1/admin/avatar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
        name: "Timmy",
      }),
    }).then((res) => res.json());
    const avatarId = createAvatarRes.avatarId;

    // Create space
    const createSpaceRes = await fetch(`${backendUrl}/api/v1/space`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        name: "Test" + Math.random(),
        dimensions: "100x200",
        mapId: mapId,
      }),
    }).then((res) => res.json());
    const spaceId = createSpaceRes.spaceId;

    // Add element to space
    await fetch(`${backendUrl}/api/v1/space/element`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        elementId: element1Id,
        spaceId: spaceId,
        x: 50,
        y: 20,
      }),
    });
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
