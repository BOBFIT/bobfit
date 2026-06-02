"use strict";

const STORE_KEY = "akyfit.website.shadow.v1";
const IDB_NAME = "akyfit.website.v1";
const IDB_STORE = "state";
const IDB_KEY = "main";

const defaults = () => ({
  meals: {},
  workouts: {},
  body: [],
  goals: { calories: 2600, protein: 195, carbs: 280, fat: 75 },
  createdAt: Date.now(),
});

let state = defaults();
let saveTimer = 0;
let lastSave = "Loading...";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));
const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const uid = () => `${Date.now()}${Math.random().toString(36).slice(2, 8)}`;
const num = (value) => Math.max(0, Math.round(Number(value) || 0));
const sum = (items, key) => items.reduce((total, item) => total + num(item[key]), 0);
const meals = () => state.meals[todayKey()] || [];
const workouts = () => state.workouts[todayKey()] || [];

function merge(raw) {
  const base = defaults();
  const next = { ...base, ...(raw || {}) };
  next.goals = { ...base.goals, ...(raw?.goals || {}) };
  next.meals = raw?.meals || base.meals;
  next.workouts = raw?.workouts || base.workouts;
  next.body = Array.isArray(raw?.body) ? raw.body : base.body;
  return next;
}

function openDb() {
  return new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) {
      reject(new Error("IndexedDB unavailable"));
      return;
    }
    const request = indexedDB.open(IDB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) db.createObjectStore(IDB_STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("IndexedDB failed"));
  });
}

function dbGet(db) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, "readonly");
    const request = tx.objectStore(IDB_STORE).get(IDB_KEY);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Read failed"));
  });
}

function dbPut(db, value) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, "readwrite");
    tx.objectStore(IDB_STORE).put(value, IDB_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error || new Error("Save failed"));
  });
}

function localLoad() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? merge(JSON.parse(raw)) : defaults();
  } catch {
    return defaults();
  }
}

function localSave() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  } catch {
    // IndexedDB remains the primary store.
  }
}

async function load() {
  state = localLoad();
  let db;
  try {
    db = await openDb();
    const stored = await dbGet(db);
    if (stored) state = merge(stored);
    lastSave = "Saved on this iPhone";
  } catch {
    lastSave = "Using fallback storage";
  } finally {
    db?.close?.();
  }
  localSave();
}

function save() {
  localSave();
  clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    let db;
    try {
      db = await openDb();
      await dbPut(db, state);
      lastSave = `Saved ${new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
    } catch {
      lastSave = "Saved to fallback copy";
    } finally {
      db?.close?.();
    }
    renderStatus();
  }, 180);
}

function renderStatus() {
  $("#save-status").textContent = lastSave;
}

function render() {
  const totalCalories = sum(meals(), "calories");
  const protein = sum(meals(), "protein");
  const carbs = sum(meals(), "carbs");
  const fat = sum(meals(), "fat");
  const burned = sum(workouts(), "calories");
  const target = state.goals.calories;
  const left = Math.max(0, target - totalCalories + burned);
  const pct = target ? Math.min(100, Math.round((totalCalories / target) * 100)) : 0;

  $("#date-label").textContent = new Date().toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });
  $("#calories-left").textContent = `${left.toLocaleString()} kcal left`;
  $("#target-label").textContent = `${totalCalories.toLocaleString()} / ${target.toLocaleString()} kcal`;
  $("#ring").style.setProperty("--pct", `${pct}%`);
  $("#ring-value").textContent = `${pct}%`;
  $("#protein-stat").textContent = `${protein}g`;
  $("#carbs-stat").textContent = `${carbs}g`;
  $("#fat-stat").textContent = `${fat}g`;
  $("#burned-stat").textContent = `${burned}`;

  $("#meal-list").innerHTML = meals().length
    ? meals().map((meal) => row(meal, `${meal.calories} kcal / ${meal.protein}p / ${meal.carbs}c / ${meal.fat}f`, "meal")).join("")
    : `<div class="empty">No meals logged today.</div>`;

  $("#workout-list").innerHTML = workouts().length
    ? workouts().map((workout) => row(workout, `${workout.minutes} min / ${workout.calories} kcal`, "workout")).join("")
    : `<div class="empty">No workouts logged today.</div>`;

  $("#body-list").innerHTML = state.body.length
    ? [...state.body].sort((a, b) => b.createdAt - a.createdAt).map((entry) => row(entry, `${entry.weight || "-"}kg / ${entry.fat || "-"}% body fat`, "body")).join("")
    : `<div class="empty">No body metrics yet.</div>`;

  $("#goals-form").elements.calories.value = state.goals.calories;
  $("#goals-form").elements.protein.value = state.goals.protein;
  $("#goals-form").elements.carbs.value = state.goals.carbs;
  $("#goals-form").elements.fat.value = state.goals.fat;

  $("#coach-card").innerHTML = coach({ left, protein });
  renderStatus();
}

function row(item, detail, type) {
  return `
    <div class="row">
      <div>
        <strong>${escapeHtml(item.name || new Date(item.createdAt).toLocaleDateString())}</strong>
        <small>${escapeHtml(detail)}</small>
      </div>
      <button type="button" data-delete-type="${type}" data-delete-id="${item.id}" aria-label="Delete">x</button>
    </div>
  `;
}

function coach(values) {
  const proteinLeft = Math.max(0, state.goals.protein - values.protein);
  if (meals().length === 0) return `<strong>Start protein-first.</strong><span>Log the first meal with lean protein so the day does not get backloaded.</span>`;
  if (proteinLeft > 45) return `<strong>Protein is the priority.</strong><span>A shake, Greek yoghurt, chicken, tuna, or lean beef will help close the gap.</span>`;
  if (values.left < 250) return `<strong>Keep the finish lean.</strong><span>Calories are tight, so choose low-fat protein and avoid easy-to-overshoot snacks.</span>`;
  return `<strong>Good pace.</strong><span>You have room to finish calmly. Keep meals simple and match the remaining calories.</span>`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function openTab(id) {
  $$(".tabs button").forEach((button) => button.classList.toggle("active", button.dataset.tab === id));
  $$(".screen").forEach((screen) => screen.classList.toggle("active", screen.id === id));
}

function bind() {
  document.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    if (button.dataset.tab) openTab(button.dataset.tab);
    if (button.dataset.openTab) openTab(button.dataset.openTab);
    if (button.dataset.deleteType) {
      const key = todayKey();
      if (button.dataset.deleteType === "meal") state.meals[key] = meals().filter((item) => item.id !== button.dataset.deleteId);
      if (button.dataset.deleteType === "workout") state.workouts[key] = workouts().filter((item) => item.id !== button.dataset.deleteId);
      if (button.dataset.deleteType === "body") state.body = state.body.filter((item) => item.id !== button.dataset.deleteId);
      save();
      render();
    }
  });

  $("#meal-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const key = todayKey();
    state.meals[key] = [
      {
        id: uid(),
        name: form.elements.name.value.trim(),
        calories: num(form.elements.calories.value),
        protein: num(form.elements.protein.value),
        carbs: num(form.elements.carbs.value),
        fat: num(form.elements.fat.value),
        createdAt: Date.now(),
      },
      ...meals(),
    ];
    form.reset();
    save();
    render();
    openTab("today");
  });

  $("#workout-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const key = todayKey();
    const minutes = num(form.elements.minutes.value || 45);
    state.workouts[key] = [
      {
        id: uid(),
        name: form.elements.name.value.trim() || "Workout",
        minutes,
        calories: num(form.elements.calories.value || minutes * 6),
        createdAt: Date.now(),
      },
      ...workouts(),
    ];
    form.reset();
    form.elements.minutes.value = 45;
    save();
    render();
    openTab("today");
  });

  $("#goals-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    state.goals = {
      calories: num(form.elements.calories.value),
      protein: num(form.elements.protein.value),
      carbs: num(form.elements.carbs.value),
      fat: num(form.elements.fat.value),
    };
    save();
    render();
  });

  $("#body-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    state.body = [
      {
        id: uid(),
        name: new Date().toLocaleDateString(),
        weight: form.elements.weight.value,
        fat: form.elements.fat.value,
        createdAt: Date.now(),
      },
      ...state.body,
    ];
    form.reset();
    save();
    render();
  });

  $("#backup-button").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `akyfit-backup-${todayKey()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  });
}

load().then(() => {
  bind();
  render();
  save();
});
