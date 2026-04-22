const PASSWORD = "HEMANSHU";
const AUTH_KEY = "project_authed_v1";

const loginView = document.getElementById("loginView");

const loginForm = document.getElementById("loginForm");
const passwordInput = document.getElementById("password");
const togglePw = document.getElementById("togglePw");
const loginBtn = document.getElementById("loginBtn");
const errorEl = document.getElementById("error");
const loginMode = document.getElementById("loginMode");
const passwordField = document.getElementById("passwordField");
const logoutBtn = document.getElementById("logoutBtn");
const capsEl = document.getElementById("caps");

const LOL_KEY = "project_lol_v1";

function setError(message) {
  if (!message) {
    errorEl.textContent = "";
    errorEl.classList.remove("show");
    return;
  }
  errorEl.textContent = message;
  errorEl.classList.add("show");
}

function getMode() {
  return (loginMode?.value || "HELLO.COM").toUpperCase();
}

function isDepthMode(mode) {
  return mode === "HELLO.DEPTH";
}

function setAuthed(authed) {
  if (authed) localStorage.setItem(AUTH_KEY, "1");
  else localStorage.removeItem(AUTH_KEY);

  const path = (window.location.pathname || "").toLowerCase();
  const protectedPages = ["/home.html", "\\home.html", "/showcase.html", "\\showcase.html", "/lol.html", "\\lol.html"];
  const onProtected = protectedPages.some((p) => path.endsWith(p));

  if (authed) {
    if (!onProtected) {
      const lol = localStorage.getItem(LOL_KEY) === "1";
      window.location.href = lol ? "./lol.html" : "./home.html";
    }
    return;
  }

  // Not authed
  if (onProtected) {
    window.location.href = "./index.html";
    return;
  }

  // Login page reset
  if (loginView) loginView.hidden = false;
  if (passwordInput) {
    passwordInput.value = "";
    passwordInput.focus();
  }
  setError("");
}

function isAuthed() {
  return localStorage.getItem(AUTH_KEY) === "1";
}

function setBusy(busy) {
  loginBtn.disabled = busy;
  passwordInput.disabled = busy;
  togglePw.disabled = busy;
  if (loginMode) loginMode.disabled = busy;
}

function updateCapsLock(e) {
  // Some browsers support getModifierState; harmless if missing.
  const caps = e?.getModifierState?.("CapsLock") ?? false;
  if (caps) {
    capsEl.textContent = "Caps Lock is ON";
    capsEl.classList.add("on");
  } else {
    capsEl.textContent = "";
    capsEl.classList.remove("on");
  }
}

togglePw?.addEventListener("click", () => {
  const isPw = passwordInput.type === "password";
  passwordInput.type = isPw ? "text" : "password";
  togglePw.setAttribute("aria-label", isPw ? "Hide password" : "Show password");
  if (togglePw.classList?.contains("peekBtn")) {
    togglePw.textContent = isPw ? "🙈" : "👁";
  }
  passwordInput.focus();
});

passwordInput?.addEventListener("keydown", updateCapsLock);
passwordInput?.addEventListener("keyup", updateCapsLock);

function syncModeUI() {
  const mode = getMode();
  const depth = isDepthMode(mode);

  if (passwordField) passwordField.classList.remove("hidden");
  if (passwordInput) {
    passwordInput.required = true;
  }

  // Hint messaging
  const hint = document.getElementById("loginHint");
  if (hint) hint.textContent = "";
}

loginMode?.addEventListener("change", () => {
  setError("");
  syncModeUI();
});

loginForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  setError("");
  setBusy(true);

  const mode = getMode();
  const depth = isDepthMode(mode);

  // Small delay for smoother UX and to avoid "instant flash" on fast machines.
  window.setTimeout(() => {
    if (!depth) {
      // HELLO.COM / HELLO.IN: any password allowed, show ONLY LOL
      localStorage.setItem(LOL_KEY, "1");
      localStorage.setItem(AUTH_KEY, "1");
      window.location.href = "./lol.html";
      return;
    }

    // HELLO.DEPTH: password required
    const typed = (passwordInput.value || "").trim();
    if (typed === PASSWORD) {
      localStorage.removeItem(LOL_KEY);
      setAuthed(true);
    } else {
      setBusy(false);
      setError("Incorrect password. Please try again.");
      passwordInput.select();
      passwordInput.focus();
    }
  }, 180);
});

logoutBtn?.addEventListener("click", () => setAuthed(false));

// Boot: enforce route protection
setAuthed(isAuthed());
if (!isAuthed() && passwordInput) passwordInput.focus();

// Boot UI
syncModeUI();

