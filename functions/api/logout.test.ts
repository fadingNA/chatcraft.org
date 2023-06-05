import { describe, test, expect } from "vitest";

import { createToken } from "../token";
import { handleLogout } from "./logout";

describe("/api/logout", () => {
  test("/api/logout without access token should return 401", async () => {
    const JWT_SECRET = "secret";
    const accessToken = null;
    const idToken = await createToken("subject", {}, JWT_SECRET);
    const res = await handleLogout({ accessToken, idToken, JWT_SECRET });
    expect(res.status).toBe(401);
  });

  test("/api/logout without id token should return 401", async () => {
    const JWT_SECRET = "secret";
    const accessToken = await createToken("subject", {}, JWT_SECRET);
    const idToken = null;
    const res = await handleLogout({ accessToken, idToken, JWT_SECRET });
    expect(res.status).toBe(401);
  });

  test("/api/logout without proper access token should return 401", async () => {
    // Swap the secrets between creating and verifying tokens
    const accessToken = await createToken("subject", {}, "old_secret");
    const idToken = await createToken("subject", {}, "old_secret");
    const res = await handleLogout({ accessToken, idToken, JWT_SECRET: "new_secret" });
    expect(res.status).toBe(401);
  });

  test("/api/logout should clear cookies", async () => {
    const JWT_SECRET = "secret";
    const accessToken = await createToken("subject", {}, JWT_SECRET);
    const idToken = await createToken("subject", {}, JWT_SECRET);
    const res = await handleLogout({ accessToken, idToken, JWT_SECRET: JWT_SECRET });
    expect(res.status).toBe(204);

    res.headers.forEach((value, key) => {
      if (key.toLowerCase() !== "set-cookie") {
        return;
      }

      if (value.startsWith("__Host-access_token")) {
        expect(value).toMatch(
          /__Host-access_token=[^;]+; Max-Age=0; Path=\/; HttpOnly; Secure; SameSite=Strict/
        );
      } else {
        expect(value).toMatch(/__Host-id_token=[^;]+; Max-Age=0; Path=\/; Secure; SameSite=Strict/);
      }
    });
  });
});