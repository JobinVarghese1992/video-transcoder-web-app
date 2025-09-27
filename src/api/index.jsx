import { notifications } from "@mantine/notifications";

export const BASE_URL = window.location.origin;

let _token = null;

export function setToken(t) {
  _token = t;
  if (t) localStorage.setItem("jwt", t);
  else localStorage.removeItem("jwt");
}

export function getToken() {
  return _token ?? localStorage.getItem("jwt");
}

async function req(path, init = {}) {
  const headers = {
    "content-type": "application/json",
    ...(init.headers || {}),
  };
  const token = getToken();
  if (token) headers["authorization"] = `Bearer ${token}`;

  const r = await fetch(`${BASE_URL}${path}`, { ...init, headers });

  if (r.status === 401) {
    setToken(null);
    if (typeof window !== "undefined") {
      try {
        window.history.pushState({}, "", "/login");
        window.dispatchEvent(new PopStateEvent("popstate"));
      } catch {}
      if (window.location.pathname !== "/login")
        window.location.href = "/login";
    }
    throw new Error("401 Unauthorized");
  }

  if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
  return r;
}

export async function login(username, password) {
  const r = await req("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  const j = await r.json();
  if (j.success === false) {
    if (j.message === "Incorrect username or password.") {
      notifications.show({
        color: "red",
        title: "Login Failed",
        message: "Incorrect username or password.",
      });
    }
  }
  if (j.success === true) {
    return j;
  }
}

export async function register(username, email, password) {
  const r = await req("/api/v1/auth/signup", {
    method: "POST",
    body: JSON.stringify({ username, email, password }),
  });
  const j = await r.json();
  if (j.success === false) {
    if (j.message === "Password does not meet security requirements.") {
      notifications.show({
        color: "red",
        title: "Weak Password",
        message:
          "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
      });
    } else if (
      j.message ===
      "1 validation error detected: Value at 'username' failed to satisfy constraint: Member must satisfy regular expression pattern: [\\p{L}\\p{M}\\p{S}\\p{N}\\p{P}]+"
    ) {
      notifications.show({
        color: "red",
        title: "Invalid Username",
        message:
          "Username can only contain letters, numbers, and special characters and no spaces.",
      });
    } else if (j.message === "This username already exists.") {
      notifications.show({
        color: "red",
        title: "Username Taken",
        message: "Please choose a different username.",
      });
    }
  }
  if (j.success === true) {
    return j;
  }
}

export async function confirmSignup(username, confirmationCode) {
  const r = await req("/api/v1/auth/confirm-signup", {
    method: "POST",
    body: JSON.stringify({ username, confirmationCode }),
  });
  const j = await r.json();
  if (j.success === false) {
    if (j.message === "Invalid confirmation code.") {
      notifications.show({
        color: "red",
        title: "Invalid Code",
        message:
          "The verification code you entered is incorrect. Please try again.",
      });
    }
  }
  if (j.success === true) {
    notifications.show({
      title: "Success",
      message: "Your account has been verified. You can now log in.",
    });
    return j;
  }
}

export async function confirmSignin(username, confirmationCode, session) {
  const r = await req("/api/v1/auth/confirm-signin", {
    method: "POST",
    body: JSON.stringify({ username, confirmationCode, session }),
  });
  const j = await r.json();
  if (j.success === false) {
    if (j.message === "Invalid code.") {
      notifications.show({
        color: "red",
        title: "Invalid Code",
        message:
          "The verification code you entered is incorrect. Please try again.",
      });
    }
  }
  if (j.success === true) {
    notifications.show({
      title: "Success",
      message: "You have been signed in successfully.",
    });
    return j;
  }
  return j;
}

export async function logout() {
  setToken(null);
}

// q = { limit, sort, createdBy, filter, q, cursor }
export async function listVideos(q = {}) {
  const qp = new URLSearchParams();
  if (q.limit != null) qp.set("limit", String(q.limit));
  if (q.sort) qp.set("sort", q.sort);
  if (q.createdBy) qp.set("createdBy", q.createdBy);
  if (q.filter) qp.set("filter", q.filter);
  if (q.q) qp.set("q", q.q);
  if (q.cursor) qp.set("cursor", q.cursor); // raw JSON string; URLSearchParams will encode

  const r = await req(`/api/v1/videos?${qp.toString()}`);
  return r.json();
}

export async function getVideo(videoId) {
  const r = await req(`/api/v1/videos/${encodeURIComponent(videoId)}`);
  return r.json();
}

export async function updateVideo(videoId, patch) {
  const r = await req(`/api/v1/videos/${encodeURIComponent(videoId)}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
  return r.json();
}

export async function deleteVideo(videoId) {
  const r = await req(`/api/v1/videos/${encodeURIComponent(videoId)}`, {
    method: "DELETE",
  });
  return r.json();
}

export async function startTranscode(videoId) {
  const r = await req(
    `/api/v1/videos/${encodeURIComponent(videoId)}/transcode`,
    {
      method: "POST",
      body: JSON.stringify({ force: true }),
    }
  );
  return r.json();
}

export async function createUploadUrl(fileName, sizeBytes) {
  const r = await req("/api/v1/videos/upload-url", {
    method: "POST",
    body: JSON.stringify({ fileName, sizeBytes, contentType: "video/mp4" }),
  });
  return r.json();
}

export async function completeUpload(body) {
  const r = await req("/api/v1/videos/complete-upload", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return r.json();
}
