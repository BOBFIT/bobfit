"use strict";

const STORE_KEY = "akyfit.website.shadow.v2";
const IDB_NAME = "akyfit.website.v2";
const IDB_STORE = "state";
const IDB_KEY = "main";

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DEFAULT_ASSIGNMENT_LABELS = { rest: "Rest", cardio: "Cardio", day1: "Day 1", day2: "Day 2", day3: "Day 3", day4: "Day 4", day5: "Day 5" };
const WORKOUT_TYPES = { strength: "Strength", cardio: "Cardio", hiit: "HIIT", cycling: "Cycling", running: "Running", walking: "Walking", swimming: "Swimming", yoga: "Yoga", other: "Other" };
const INTENSITIES = { light: "Light", moderate: "Moderate", vigorous: "Vigorous" };
const MET = {
  strength: { light: 3.5, moderate: 5, vigorous: 6 },
  cardio: { light: 4, moderate: 6, vigorous: 8 },
  hiit: { light: 6, moderate: 8, vigorous: 10.5 },
  cycling: { light: 4, moderate: 6.8, vigorous: 10 },
  running: { light: 6, moderate: 8.3, vigorous: 11 },
  walking: { light: 2.5, moderate: 3.8, vigorous: 5 },
  swimming: { light: 4, moderate: 6, vigorous: 9.8 },
  yoga: { light: 2, moderate: 3, vigorous: 4 },
  other: { light: 3, moderate: 4.5, vigorous: 6 },
};

const PEPTIDES = {
  none: { id: "none", name: "No peptide", category: "Standard coaching", proteinFloorGPerKg: 1.6, calorieAdjustPct: 0, guidance: { eatMore: [], eatLess: [], avoid: [], timing: [], sideEffects: [] }, notes: "Standard macro coaching." },
  retatrutide: { id: "retatrutide", name: "Retatrutide", category: "GLP-1 / GIP / Glucagon", proteinFloorGPerKg: 1.8, calorieAdjustPct: -15, guidance: { eatMore: ["Lean protein at every meal", "Low-volume nutrient-dense foods", "Electrolytes", "Soluble fibre"], eatLess: ["Large single sittings", "Refined carbs", "Calorie-dense drinks"], avoid: ["Greasy foods", "Heavy alcohol", "Skipping meals"], timing: ["Same day each week", "Front-load protein"], sideEffects: ["Nausea", "Early satiety", "Constipation", "Fatigue"] }, notes: "Strong appetite suppression; protect lean mass." },
  tirzepatide: { id: "tirzepatide", name: "Tirzepatide", category: "GLP-1 / GIP", proteinFloorGPerKg: 1.8, calorieAdjustPct: -15, guidance: { eatMore: ["Protein-first plates", "Hydration", "Cooked vegetables"], eatLess: ["Large portions", "High-fat fried foods"], avoid: ["Greasy meals", "Heavy alcohol", "Sugary drinks"], timing: ["Same day each week"], sideEffects: ["Nausea", "Reflux", "Constipation"] }, notes: "Keep protein steady to protect lean mass." },
  semaglutide: { id: "semaglutide", name: "Semaglutide", category: "GLP-1", proteinFloorGPerKg: 1.6, calorieAdjustPct: -12, guidance: { eatMore: ["Protein", "Fibre", "Water"], eatLess: ["Refined carbs", "Large fatty meals"], avoid: ["Fried foods", "Excess alcohol"], timing: ["Same day weekly"], sideEffects: ["Nausea", "Constipation", "Reflux"] }, notes: "Single GLP-1 agonist." },
  bpc157: { id: "bpc157", name: "BPC-157", category: "Healing", proteinFloorGPerKg: 1.8, calorieAdjustPct: 0, guidance: { eatMore: ["Protein for repair", "Vitamin C", "Zinc", "Collagen sources"], eatLess: [], avoid: ["Excess alcohol"], timing: ["Often AM and PM"], sideEffects: ["Generally well tolerated"] }, notes: "Lean into protein for repair." },
  tb500: { id: "tb500", name: "TB-500", category: "Healing", proteinFloorGPerKg: 1.8, calorieAdjustPct: 0, guidance: { eatMore: ["Protein", "Omega-3s", "Micronutrients"], eatLess: [], avoid: ["Excess alcohol"], timing: ["Loading then maintenance"], sideEffects: ["Mild fatigue"] }, notes: "Pair with sleep and adequate protein." },
  cjc1295: { id: "cjc1295", name: "CJC-1295", category: "Growth Hormone", proteinFloorGPerKg: 1.8, calorieAdjustPct: 0, guidance: { eatMore: ["Protein near dose timing"], eatLess: ["Food within 60 min of dose"], avoid: ["Eating immediately before injection"], timing: ["Empty stomach before bed"], sideEffects: ["Flushing", "Water retention"] }, notes: "Timing matters." },
  ipamorelin: { id: "ipamorelin", name: "Ipamorelin", category: "Growth Hormone", proteinFloorGPerKg: 1.8, calorieAdjustPct: 0, guidance: { eatMore: ["Protein near dose timing"], eatLess: ["Food within 30-60 min"], avoid: ["Eating immediately around injection"], timing: ["Pre-bed dosing"], sideEffects: ["Head rush", "Hunger spike"] }, notes: "Often stacked with CJC-1295." },
  "mots-c": { id: "mots-c", name: "MOTS-c", category: "Metabolic", proteinFloorGPerKg: 1.6, calorieAdjustPct: -5, guidance: { eatMore: ["Whole-food carbs around training", "Protein"], eatLess: ["Refined sugar"], avoid: ["Processed sugar spikes"], timing: ["Often pre-workout"], sideEffects: ["Generally well tolerated"] }, notes: "Pairs well with carb cycling." },
};

const DEFAULT_TEMPLATES = {
  day1: { title: "Chest / Biceps / Triceps", exercises: ["Bench Press", "Incline Dumbbell Press", "Cable Fly", "Barbell Curl", "Hammer Curl", "Tricep Pushdown", "Skull Crushers"] },
  day2: { title: "Back / Biceps / Triceps", exercises: ["Deadlift", "Pull-Up / Lat Pulldown", "Seated Cable Row", "One-Arm Dumbbell Row", "Barbell Curl", "Preacher Curl", "Overhead Tricep Extension"] },
  day3: { title: "Shoulders", exercises: ["Overhead Press", "Lateral Raise", "Front Raise", "Rear Delt Fly", "Face Pull", "Arnold Press"] },
  day4: { title: "Custom Day 4", exercises: [] },
  day5: { title: "Custom Day 5", exercises: [] },
};

const clone = (v) => JSON.parse(JSON.stringify(v));
const uid = () => `${Date.now()}${Math.random().toString(36).slice(2, 8)}`;

function defaults() {
  return {
    meals: {},
    workouts: {},
    bodyMetrics: [],
    goals: { training: { calories: 2600, protein: 195, carbs: 280, fat: 75 }, rest: { calories: 2200, protein: 165, carbs: 220, fat: 70 } },
    dayMeta: {},
    dailyCheckin: {},
    peptide: { id: "none", weeklyDoseCount: 1 },
    weeklyPlan: { assignments: { 0: "day1", 1: "rest", 2: "day2", 3: "rest", 4: "day3", 5: "cardio", 6: "rest" }, doseDays: [] },
    workoutDrafts: {},
    savedMeals: [
      { id: uid(), name: "Whey shake + banana", calories: 280, protein: 32, carbs: 35, fat: 3, createdAt: Date.now(), isFavourite: true },
      { id: uid(), name: "Chicken rice bowl", calories: 520, protein: 48, carbs: 62, fat: 10, createdAt: Date.now(), isFavourite: true },
    ],
    workoutTemplates: normalizeTemplates(DEFAULT_TEMPLATES),
    settings: { aiEndpoint: "", coachWeightKg: "", logPlanKey: "", historyType: "meals" },
    createdAt: Date.now(),
  };
}

let state = defaults();
let lastSave = "Loading...";
let saveTimer = 0;
const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));
const num = (v) => Math.max(0, Math.round(Number(v) || 0));
const rawNum = (v) => Number.isFinite(Number(v)) ? Number(v) : 0;
const fmt = (v) => Math.round(Number(v) || 0).toLocaleString();
const fmtWeight = (v) => rawNum(v).toLocaleString(undefined, { maximumFractionDigits: 2 });
const todayKey = () => dayKey(new Date());
const dayKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const todayMeals = () => state.meals[todayKey()] || [];
const todayWorkouts = () => state.workouts[todayKey()] || [];
const icon = (name) => `<svg><use href="#i-${name}"></use></svg>`;

function merge(raw) {
  const base = defaults();
  const next = { ...base, ...(raw || {}) };
  next.goals = {
    training: { ...base.goals.training, ...(raw?.goals?.training || raw?.goals || {}) },
    rest: { ...base.goals.rest, ...(raw?.goals?.rest || {}) },
  };
  next.meals = raw?.meals || base.meals;
  next.workouts = raw?.workouts || base.workouts;
  next.bodyMetrics = Array.isArray(raw?.bodyMetrics) ? raw.bodyMetrics : Array.isArray(raw?.body) ? raw.body : base.bodyMetrics;
  next.dayMeta = raw?.dayMeta || base.dayMeta;
  next.dailyCheckin = raw?.dailyCheckin || base.dailyCheckin;
  next.peptide = { ...base.peptide, ...(raw?.peptide || {}) };
  next.weeklyPlan = { ...base.weeklyPlan, ...(raw?.weeklyPlan || {}) };
  next.weeklyPlan.assignments = { ...base.weeklyPlan.assignments, ...(raw?.weeklyPlan?.assignments || {}) };
  next.weeklyPlan.doseDays = Array.isArray(raw?.weeklyPlan?.doseDays) ? raw.weeklyPlan.doseDays : base.weeklyPlan.doseDays;
  next.workoutDrafts = raw?.workoutDrafts || base.workoutDrafts;
  next.savedMeals = Array.isArray(raw?.savedMeals) ? raw.savedMeals : base.savedMeals;
  next.workoutTemplates = normalizeTemplates({ ...base.workoutTemplates, ...(raw?.workoutTemplates || {}) });
  next.settings = { ...base.settings, ...(raw?.settings || {}) };
  return next;
}

function openDb() {
  return new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) return reject(new Error("IndexedDB unavailable"));
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) db.createObjectStore(IDB_STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error("IndexedDB failed"));
  });
}
const dbGet = (db) => new Promise((resolve, reject) => {
  const tx = db.transaction(IDB_STORE, "readonly");
  const req = tx.objectStore(IDB_STORE).get(IDB_KEY);
  req.onsuccess = () => resolve(req.result);
  req.onerror = () => reject(req.error || new Error("Read failed"));
});
const dbPut = (db, value) => new Promise((resolve, reject) => {
  const tx = db.transaction(IDB_STORE, "readwrite");
  tx.objectStore(IDB_STORE).put(value, IDB_KEY);
  tx.oncomplete = () => resolve();
  tx.onerror = () => reject(tx.error || new Error("Save failed"));
});

function localLoad() {
  try { return merge(JSON.parse(localStorage.getItem(STORE_KEY) || "null")); } catch { return defaults(); }
}
function localSave() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch {}
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
  } finally { db?.close?.(); }
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
    } finally { db?.close?.(); }
    renderStatus();
  }, 160);
}

function totals(meals = todayMeals()) {
  return meals.reduce((acc, meal) => ({
    calories: acc.calories + num(meal.calories),
    protein: acc.protein + num(meal.protein),
    carbs: acc.carbs + num(meal.carbs),
    fat: acc.fat + num(meal.fat),
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
}
function burned(workouts = todayWorkouts()) {
  return workouts.reduce((sum, workout) => sum + num(workout.caloriesBurned || workout.calories), 0);
}
function weekdayIndex(date = new Date()) {
  const day = date.getDay();
  return day === 0 ? 6 : day - 1;
}
function modeForToday() {
  const meta = state.dayMeta[todayKey()];
  if (meta?.mode) return meta.mode;
  return state.weeklyPlan.assignments[weekdayIndex()] === "rest" ? "rest" : "training";
}
function todayGoals() {
  return state.goals[modeForToday()] || state.goals.training;
}
function latestBody() {
  return [...state.bodyMetrics].filter((m) => rawNum(m.weightKg || m.weight) > 0).sort((a, b) => b.createdAt - a.createdAt)[0] || null;
}
function currentWeight() {
  return rawNum(latestBody()?.weightKg || latestBody()?.weight || state.settings.coachWeightKg);
}
function getPeptide() {
  return PEPTIDES[state.peptide.id] || PEPTIDES.none;
}
function escapeHtml(v) {
  return String(v ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}
function slug(v) {
  return String(v || "exercise").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "exercise";
}
function normalizeExercise(exercise, index) {
  if (typeof exercise === "string") return { id: `ex-${index}-${slug(exercise)}`, name: exercise };
  const name = String(exercise?.name || exercise?.title || `Exercise ${index + 1}`).trim();
  return { ...exercise, id: String(exercise?.id || `ex-${index}-${slug(name)}`), name };
}
function normalizeTemplate(template, key) {
  const fallbackTitle = DEFAULT_ASSIGNMENT_LABELS[key] || key;
  const exercises = Array.isArray(template) ? template : Array.isArray(template?.exercises) ? template.exercises : [];
  return {
    title: String(Array.isArray(template) ? fallbackTitle : template?.title || fallbackTitle),
    exercises: exercises.map(normalizeExercise),
  };
}
function normalizeTemplates(templates = {}) {
  return Object.fromEntries(Object.entries(templates).map(([key, template]) => [key, normalizeTemplate(template, key)]));
}
function templateKeys() {
  const keys = Object.keys(state.workoutTemplates || {});
  return keys.sort((a, b) => {
    const an = Number((a.match(/^day(\d+)$/) || [])[1] || 999);
    const bn = Number((b.match(/^day(\d+)$/) || [])[1] || 999);
    return an === bn ? a.localeCompare(b) : an - bn;
  });
}
function assignmentOptions() {
  return ["rest", ...templateKeys(), "cardio"];
}
function assignmentLabel(key) {
  if (DEFAULT_ASSIGNMENT_LABELS[key]) return DEFAULT_ASSIGNMENT_LABELS[key];
  const day = String(key || "").match(/^day(\d+)$/);
  return day ? `Day ${day[1]}` : String(key || "Workout");
}
function assignmentTitle(key) {
  return state.workoutTemplates[key]?.title || (key === "cardio" ? "Cardio session" : key === "rest" ? "Rest and recover" : assignmentLabel(key));
}
function assignedPlanKey(date = new Date()) {
  const key = state.weeklyPlan.assignments[weekdayIndex(date)] || "rest";
  return key === "rest" ? (templateKeys()[0] || "day1") : key;
}
function selectedWorkoutPlanKey() {
  const selected = state.settings.logPlanKey;
  if (selected && selected !== "rest") return selected;
  return assignedPlanKey();
}
function draftStorageKey(planKey = selectedWorkoutPlanKey(), date = todayKey()) {
  return `${date}:${planKey}`;
}
function templateExercises(planKey) {
  return state.workoutTemplates[planKey]?.exercises || [];
}
function ensureWorkoutDraft(planKey = selectedWorkoutPlanKey()) {
  const key = draftStorageKey(planKey);
  const template = state.workoutTemplates[planKey];
  const exercises = templateExercises(planKey);
  let draft = state.workoutDrafts[key];
  if (!draft) {
    draft = { id: uid(), dateKey: todayKey(), planKey, title: assignmentTitle(planKey), startedAt: Date.now(), updatedAt: Date.now(), exerciseLogs: [] };
  }
  const existing = new Map((draft.exerciseLogs || []).map((log) => [String(log.exerciseId || slug(log.name)), log]));
  const activeLogs = exercises.map((exercise) => {
    const old = existing.get(String(exercise.id)) || existing.get(slug(exercise.name));
    return { exerciseId: exercise.id, name: exercise.name, sets: Array.isArray(old?.sets) ? old.sets : [] };
  });
  const removedWithSets = (draft.exerciseLogs || []).filter((log) => !activeLogs.some((next) => next.exerciseId === log.exerciseId) && log.sets?.length);
  draft = { ...draft, planKey, title: assignmentTitle(planKey), updatedAt: Date.now(), exerciseLogs: [...activeLogs, ...removedWithSets] };
  state.workoutDrafts[key] = draft;
  return draft;
}
function latestExerciseSets(exerciseName, before = Date.now()) {
  const target = slug(exerciseName);
  const sessions = Object.entries(state.workouts || {}).flatMap(([date, workouts]) => (workouts || []).map((workout) => ({ date, workout })));
  sessions.sort((a, b) => (b.workout.createdAt || 0) - (a.workout.createdAt || 0));
  for (const { date, workout } of sessions) {
    if ((workout.createdAt || 0) >= before) continue;
    const log = (workout.exerciseLogs || []).find((entry) => slug(entry.name) === target && entry.sets?.length);
    if (log) return { date, sets: log.sets };
  }
  return null;
}
function setSummary(sets = []) {
  return sets.map((set) => `${fmtWeight(set.weightKg)}kg x ${fmt(set.reps)}`).join(", ");
}
function allWorkoutSessions() {
  return Object.entries(state.workouts || {}).flatMap(([date, workouts]) => (workouts || []).map((workout) => ({ ...workout, date }))).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}
function dateLabel(date) {
  const d = new Date(`${date}T12:00:00`);
  if (Number.isNaN(d.getTime())) return String(date || "");
  return d.toLocaleDateString([], { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}
function allMealDays() {
  return Object.entries(state.meals || {})
    .filter(([, meals]) => Array.isArray(meals) && meals.length)
    .sort(([a], [b]) => b.localeCompare(a));
}
function allBodyEntries() {
  return [...(state.bodyMetrics || [])].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}
function weightDetail(metric) {
  const details = [`${rawNum(metric.weightKg || metric.weight).toFixed(1)} kg`];
  if (metric.fatPercent || metric.fat) details.push(`${metric.fatPercent || metric.fat}% fat`);
  if (metric.muscleKg) details.push(`${metric.muscleKg} kg muscle`);
  if (metric.visceralFat) details.push(`visceral ${metric.visceralFat}`);
  return details.join(" / ");
}

function render() {
  renderHeader();
  renderStatus();
  renderDayMode();
  renderAlerts();
  renderMacroRing();
  renderMacroBars();
  renderTodayPlan();
  renderCheckin();
  renderLists();
  renderForms();
  renderPlanner();
  renderCoach();
  renderPeptides();
  renderGoals();
  renderBody();
  renderSettings();
}
function renderHeader() {
  const active = $(".view.active");
  $("#header-title").textContent = active?.dataset.title || "AkyFit";
  $("#header-subtitle").textContent = new Date().toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" }).toUpperCase();
}
function renderStatus() {
  $("#data-summary") && ($("#data-summary").textContent = JSON.stringify({
    storage: lastSave,
    mealsToday: todayMeals().length,
    workoutsToday: todayWorkouts().length,
    savedMeals: state.savedMeals.length,
    bodyMetrics: state.bodyMetrics.length,
    peptide: getPeptide().name,
    aiBackend: state.settings.aiEndpoint || "Not set",
  }, null, 2));
}
function renderDayMode() {
  $$(".segmented [data-mode]").forEach((b) => b.classList.toggle("active", b.dataset.mode === modeForToday()));
}
function renderAlerts() {
  const t = totals();
  const g = todayGoals();
  const alerts = [];
  if (g.protein && t.protein / g.protein < 0.5 && new Date().getHours() >= 17) alerts.push(["Protein behind", `You are at ${fmt(t.protein)}g of ${fmt(g.protein)}g.`]);
  const pep = getPeptide();
  const weight = currentWeight();
  if (pep.id !== "none" && weight) {
    const floor = Math.round(pep.proteinFloorGPerKg * weight);
    if (t.protein < floor) alerts.push([`${pep.name}: protect lean mass`, `Protein floor is ${floor}g. You are at ${fmt(t.protein)}g.`]);
  }
  $("#alert-stack").innerHTML = alerts.map(([title, body]) => `<div class="alert"><strong>${escapeHtml(title)}</strong><span>${escapeHtml(body)}</span></div>`).join("");
}
function renderMacroRing() {
  const t = totals();
  const g = todayGoals();
  const b = burned();
  const left = Math.max(0, g.calories - t.calories + b);
  const segments = [
    [t.calories, g.calories, "#0c0a09"],
    [t.protein, g.protein, "var(--protein)"],
    [t.carbs, g.carbs, "var(--carbs)"],
    [t.fat, g.fat, "var(--fat)"],
  ];
  const rings = segments.map(([value, goal, color], i) => {
    const r = 126 - i * 27;
    const c = 2 * Math.PI * r;
    const pct = goal > 0 ? Math.min(1, value / goal) : 0;
    return `<circle cx="140" cy="140" r="${r}" stroke="#f5f5f4" stroke-width="13" fill="none"/><circle cx="140" cy="140" r="${r}" stroke="${color}" stroke-width="13" fill="none" stroke-linecap="round" stroke-dasharray="${c * pct} ${c}"/>`;
  }).join("");
  $("#macro-ring").innerHTML = `<svg viewBox="0 0 280 280"><g transform="rotate(-90 140 140)">${rings}</g></svg><div class="ring-center"><strong>${fmt(t.calories)}</strong><span>of ${fmt(g.calories)} kcal</span><small>${fmt(left)} remaining</small></div>`;
}
function renderMacroBars() {
  const t = totals();
  const g = todayGoals();
  const bars = [["Protein", "protein", "var(--protein)"], ["Carbs", "carbs", "var(--carbs)"], ["Fat", "fat", "var(--fat)"]];
  $("#macro-bars").innerHTML = bars.map(([label, key, color]) => {
    const pct = g[key] ? Math.min(100, (t[key] / g[key]) * 100) : 0;
    return `<div class="macro-bar"><strong>${label}</strong><div class="track"><div class="fill" style="width:${pct}%;background:${color}"></div></div><span>${fmt(t[key])}/${fmt(g[key])}g</span></div>`;
  }).join("");
}
function renderTodayPlan() {
  const assign = state.weeklyPlan.assignments[weekdayIndex()] || "rest";
  $("#today-plan-pill").textContent = assignmentLabel(assign);
  const template = state.workoutTemplates[assign];
  const exercises = template?.exercises || [];
  $("#today-plan-sub").textContent = assignmentTitle(assign);
  const list = exercises.length ? `<ul>${exercises.map((e) => `<li>${escapeHtml(e.name)}</li>`).join("")}</ul>` : `<div class="empty">${assign === "rest" ? "Rest and recover." : "No exercises configured."}</div>`;
  const action = assign !== "rest" ? `<button class="text-button" data-select-plan="${escapeHtml(assign)}" data-view-shortcut="log" type="button">Log this workout</button>` : "";
  $("#today-template").innerHTML = `${list}${action}`;
}
function renderCheckin() {
  const c = state.dailyCheckin[todayKey()] || {};
  const f = $("#checkin-form");
  f.elements.waterMl.value = c.waterMl || "";
  f.elements.stepCount.value = c.stepCount || "";
  f.elements.sleepHours.value = c.sleepHours || "";
  f.elements.energyLevel.value = c.energyLevel || "";
}
function row(item, detail, type) {
  return `<div class="row"><div><strong>${escapeHtml(item.name || new Date(item.createdAt).toLocaleDateString())}</strong><small>${escapeHtml(detail)}</small></div><button data-delete-type="${type}" data-delete-id="${item.id}" type="button" aria-label="Delete">${icon("trash")}</button></div>`;
}
function renderLists() {
  const ms = todayMeals();
  const ws = todayWorkouts();
  $("#meal-subtitle").textContent = `${ms.length} meals / ${fmt(totals(ms).calories)} kcal`;
  $("#workout-subtitle").textContent = `${ws.length} workouts / ${fmt(burned(ws))} kcal burned`;
  $("#meal-list").innerHTML = ms.length ? ms.map((m) => row(m, `${fmt(m.calories)} kcal / ${fmt(m.protein)}p / ${fmt(m.carbs)}c / ${fmt(m.fat)}f`, "meal")).join("") : `<div class="empty">No meals logged today.</div>`;
  $("#workout-list").innerHTML = ws.length ? ws.map((w) => row(w, workoutDetail(w), "workout")).join("") : `<div class="empty">No workouts logged today.</div>`;
  $("#saved-meals").innerHTML = state.savedMeals.length ? state.savedMeals.map((m) => `<div class="row"><div><strong>${escapeHtml(m.name)}</strong><small>${fmt(m.calories)} kcal / ${fmt(m.protein)}p / ${fmt(m.carbs)}c / ${fmt(m.fat)}f</small></div><button data-add-saved="${m.id}" type="button">${icon("plus")}</button></div>`).join("") : `<div class="empty">No saved meals yet.</div>`;
  renderHistory();
}
function renderForms() {
  const select = $("#planned-workout-select");
  const options = assignmentOptions().filter((key) => key !== "rest");
  const selected = selectedWorkoutPlanKey();
  select.innerHTML = options.map((key) => `<option value="${escapeHtml(key)}">${escapeHtml(`${assignmentLabel(key)} - ${assignmentTitle(key)}`)}</option>`).join("");
  select.value = options.includes(selected) ? selected : (options[0] || "cardio");
  state.settings.logPlanKey = select.value;
  renderWorkoutLogger();
}
function workoutDetail(workout) {
  const logs = workout.exerciseLogs || [];
  const setCount = logs.reduce((sum, log) => sum + (log.sets?.length || 0), 0);
  const base = `${workout.planTitle || WORKOUT_TYPES[workout.type] || "Workout"} / ${fmt(workout.durationMin || workout.minutes)} min / ${fmt(workout.caloriesBurned || workout.calories)} kcal`;
  return setCount ? `${base} / ${setCount} sets` : base;
}
function renderWorkoutLogger() {
  const planKey = selectedWorkoutPlanKey();
  const form = $("#workout-session-form");
  const draft = ensureWorkoutDraft(planKey);
  const isCardio = planKey === "cardio";
  const logs = draft.exerciseLogs || [];
  const sessionTitle = `${assignmentLabel(planKey)} - ${assignmentTitle(planKey)}`;
  $("#planned-workout-log").innerHTML = isCardio || !logs.length ? `<div class="empty">${isCardio ? "Add minutes and calories, then save the cardio session." : "No exercises on this day yet. Add exercises in Planner first."}</div>` : `
    <div class="session-title">
      <strong>${escapeHtml(sessionTitle)}</strong>
      <span>${logs.reduce((sum, log) => sum + (log.sets?.length || 0), 0)} sets in this draft</span>
    </div>
    ${logs.map((log) => {
      const previous = latestExerciseSets(log.name, draft.startedAt);
      return `<div class="exercise-log" data-exercise-id="${escapeHtml(log.exerciseId)}">
        <div class="exercise-log-head">
          <div>
            <strong>${escapeHtml(log.name)}</strong>
            <small>${previous ? `Previous ${previous.date}: ${escapeHtml(setSummary(previous.sets))}` : "No previous sets saved"}</small>
          </div>
        </div>
        <div class="set-list">${log.sets?.length ? log.sets.map((set) => `<span class="set-chip">${fmtWeight(set.weightKg)}kg x ${fmt(set.reps)} <button data-delete-set="${escapeHtml(set.id)}" data-exercise-id="${escapeHtml(log.exerciseId)}" type="button" aria-label="Delete set">x</button></span>`).join("") : `<span class="muted">No sets added yet</span>`}</div>
        <div class="set-entry">
          <label>Reps<input name="reps" type="number" min="0" inputmode="numeric" /></label>
          <label>Weight kg<input name="weightKg" type="number" min="0" step="0.5" inputmode="decimal" /></label>
          <button class="secondary" data-add-set="${escapeHtml(log.exerciseId)}" type="button">Add set</button>
        </div>
      </div>`;
    }).join("")}`;
  if (form.elements.minutes && !form.elements.minutes.value) form.elements.minutes.value = 45;
}
function renderHistory() {
  const el = $("#history-list");
  if (!el) return;
  const type = state.settings.historyType || "meals";
  $$(".history-tabs [data-history-type]").forEach((b) => b.classList.toggle("active", b.dataset.historyType === type));
  if (type === "meals") {
    const days = allMealDays();
    $("#history-subtitle").textContent = days.length ? `${days.length} days of logged meals` : "No past meals logged yet";
    el.innerHTML = days.length ? days.map(([date, meals]) => {
      const t = totals(meals);
      const items = meals.map((meal) => `<li><strong>${escapeHtml(meal.name || "Meal")}</strong>: ${fmt(meal.calories)} kcal / ${fmt(meal.protein)}p / ${fmt(meal.carbs)}c / ${fmt(meal.fat)}f</li>`).join("");
      return `<div class="history-card">
        <div class="history-head"><div><strong>${escapeHtml(dateLabel(date))}</strong><small>${meals.length} meals / ${fmt(t.calories)} kcal / ${fmt(t.protein)}p / ${fmt(t.carbs)}c / ${fmt(t.fat)}f</small></div></div>
        <ul>${items}</ul>
      </div>`;
    }).join("") : `<div class="empty">No meal history yet.</div>`;
    return;
  }
  if (type === "workouts") {
    const sessions = allWorkoutSessions();
    $("#history-subtitle").textContent = sessions.length ? `${sessions.length} saved workout sessions` : "No workout sessions saved yet";
    el.innerHTML = sessions.length ? sessions.map((workout) => {
      const exercises = (workout.exerciseLogs || []).filter((log) => log.sets?.length).map((log) => `<li><strong>${escapeHtml(log.name)}</strong>: ${escapeHtml(setSummary(log.sets))}</li>`).join("");
      return `<div class="history-card">
        <div class="history-head">
          <div><strong>${escapeHtml(workout.name || workout.planTitle || "Workout")}</strong><small>${escapeHtml(dateLabel(workout.date))} / ${escapeHtml(workoutDetail(workout))}</small></div>
          <button data-delete-workout-date="${escapeHtml(workout.date)}" data-delete-workout-id="${escapeHtml(workout.id)}" type="button" aria-label="Delete workout">${icon("trash")}</button>
        </div>
        ${exercises ? `<ul>${exercises}</ul>` : `<div class="muted">No set-by-set detail saved for this session.</div>`}
      </div>`;
    }).join("") : `<div class="empty">No workout history yet.</div>`;
    return;
  }
  const entries = allBodyEntries();
  $("#history-subtitle").textContent = entries.length ? `${entries.length} saved weight entries` : "No weight entries saved yet";
  el.innerHTML = entries.length ? entries.map((metric) => `<div class="history-card">
    <div class="history-head">
      <div><strong>${escapeHtml(new Date(metric.createdAt || Date.now()).toLocaleDateString([], { weekday: "short", day: "numeric", month: "short", year: "numeric" }))}</strong><small>${escapeHtml(weightDetail(metric))}</small></div>
      <button data-delete-type="body" data-delete-id="${escapeHtml(metric.id)}" type="button" aria-label="Delete weight">${icon("trash")}</button>
    </div>
  </div>`).join("") : `<div class="empty">No weight history yet.</div>`;
}
function renderPlanner() {
  $("#week-planner").innerHTML = WEEK_DAYS.map((day, i) => {
    const a = state.weeklyPlan.assignments[i] || "rest";
    const dose = state.weeklyPlan.doseDays.includes(i);
    return `<div class="day-card"><strong>${day}</strong><button data-cycle-day="${i}" type="button">${assignmentLabel(a)}</button><small>${escapeHtml(assignmentTitle(a))}</small><button class="${dose ? "dose-on" : ""}" data-dose-day="${i}" type="button">${dose ? "Dose day" : "No dose"}</button></div>`;
  }).join("");
  $("#template-list").innerHTML = templateKeys().map((key) => {
    const template = state.workoutTemplates[key];
    const removable = !DEFAULT_TEMPLATES[key];
    const exercises = template.exercises?.length ? template.exercises.map((exercise) => `
      <div class="exercise-edit">
        <input data-exercise-name="${escapeHtml(key)}" data-exercise-id="${escapeHtml(exercise.id)}" value="${escapeHtml(exercise.name)}" />
        <button data-delete-exercise="${escapeHtml(key)}" data-exercise-id="${escapeHtml(exercise.id)}" type="button" aria-label="Delete exercise">${icon("trash")}</button>
      </div>`).join("") : `<div class="empty">No exercises yet. Add one below.</div>`;
    return `<div class="template-card" data-template-card="${escapeHtml(key)}">
      <div class="template-head">
        <span>${escapeHtml(assignmentLabel(key))}</span>
        ${removable ? `<button data-delete-template="${escapeHtml(key)}" type="button">Delete day</button>` : ""}
      </div>
      <label>Day name<input data-template-title="${escapeHtml(key)}" value="${escapeHtml(template.title || "")}" /></label>
      <div class="editable-exercises">${exercises}</div>
      <div class="add-exercise-form">
        <input data-new-exercise="${escapeHtml(key)}" placeholder="Add exercise" />
        <button class="secondary" data-add-exercise="${escapeHtml(key)}" type="button">Add</button>
      </div>
    </div>`;
  }).join("");
}
function offlineCoach() {
  const t = totals();
  const g = todayGoals();
  const left = Math.max(0, g.calories - t.calories + burned());
  const proteinLeft = Math.max(0, g.protein - t.protein);
  let title = "Good pace";
  let body = "Keep meals simple and match the remaining calories.";
  if (todayMeals().length === 0) { title = "Start protein-first"; body = "Log the first meal with lean protein so the day does not get backloaded."; }
  else if (proteinLeft > 45) { title = "Protein is the priority"; body = "A shake, Greek yoghurt, chicken, tuna, or lean beef will help close the gap."; }
  else if (left < 250) { title = "Keep the finish lean"; body = "Calories are tight, so choose low-fat protein and avoid easy-to-overshoot snacks."; }
  return { title, body };
}
function renderCoach() {
  const c = offlineCoach();
  $("#coach-card").innerHTML = `<strong>${escapeHtml(c.title)}</strong><span>${escapeHtml(c.body)}</span>`;
  $("#ai-endpoint").value = state.settings.aiEndpoint || "";
  $("#coach-weight").value = state.settings.coachWeightKg || currentWeight() || "";
}
function renderPeptides() {
  const select = $("#peptide-select");
  if (!select.dataset.ready) {
    select.innerHTML = Object.values(PEPTIDES).map((p) => `<option value="${p.id}">${escapeHtml(p.name)}</option>`).join("");
    select.dataset.ready = "1";
  }
  select.value = state.peptide.id;
  $("#weekly-dose-count").value = state.peptide.weeklyDoseCount || 1;
  const p = getPeptide();
  const groups = [["Category", [p.category, p.notes]], ["Eat more", p.guidance.eatMore], ["Eat less", p.guidance.eatLess], ["Avoid", p.guidance.avoid], ["Timing", p.guidance.timing], ["Side effects", p.guidance.sideEffects]].filter(([, list]) => list.length);
  $("#peptide-guidance").innerHTML = groups.map(([title, list]) => `<div><strong>${escapeHtml(title)}</strong><ul>${list.map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ul></div>`).join("");
}
function renderGoals() {
  const fields = ["calories", "protein", "carbs", "fat"];
  $("#goals-form").innerHTML = `<strong class="wide">Training day</strong>${fields.map((f) => `<label>${f}<input name="training.${f}" type="number" min="0" value="${state.goals.training[f]}" inputmode="numeric"/></label>`).join("")}<strong class="wide">Rest day</strong>${fields.map((f) => `<label>${f}<input name="rest.${f}" type="number" min="0" value="${state.goals.rest[f]}" inputmode="numeric"/></label>`).join("")}<button class="primary wide" type="submit">Save goals</button>`;
}
function renderBody() {
  const list = [...state.bodyMetrics].sort((a, b) => b.createdAt - a.createdAt);
  $("#body-list").innerHTML = list.length ? list.map((m) => row({ ...m, name: new Date(m.createdAt).toLocaleDateString() }, `${rawNum(m.weightKg || m.weight).toFixed(1)} kg / ${m.fatPercent || m.fat || "-"}% fat`, "body")).join("") : `<div class="empty">No body metrics yet.</div>`;
  renderBodyChart(list);
}
function renderBodyChart(list) {
  const points = [...list].sort((a, b) => a.createdAt - b.createdAt).filter((m) => rawNum(m.weightKg || m.weight) > 0);
  if (points.length < 2) { $("#body-chart").innerHTML = `<div class="empty">Add two weight entries to draw a trend.</div>`; return; }
  const weights = points.map((m) => rawNum(m.weightKg || m.weight));
  const min = Math.min(...weights), max = Math.max(...weights), span = Math.max(1, max - min);
  const poly = points.map((m, i) => `${18 + (i / Math.max(1, points.length - 1)) * 264},${136 - ((rawNum(m.weightKg || m.weight) - min) / span) * 100}`).join(" ");
  $("#body-chart").innerHTML = `<svg viewBox="0 0 300 160"><path d="M18 136H282M18 36V136" stroke="#d6d3d1" fill="none"/><polyline points="${poly}" fill="none" stroke="#2563eb" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}
function renderSettings() { renderStatus(); }

function normalizeImported(raw) {
  if (!raw || typeof raw !== "object") throw new Error("That file is not valid AkyFit data.");
  if (raw.appName === "AkyFit" && raw.data) return fromAkyFitBackup(raw.data);
  if (raw.data && (raw.data.meals || raw.data.goals || raw.data.workouts)) return fromAkyFitBackup(raw.data);
  const storage = readStorageDump(raw);
  if (storage) return fromAkyFitBackup(storage);
  return merge(raw);
}
function readStorageDump(raw) {
  const keys = { meals: "macrocoach.meals.v1", goals: "macrocoach.goals.v1", workouts: "macrocoach.workouts.v1", bodyMetrics: "macrocoach.body.v1", peptide: "macrocoach.peptide.v1", dayMeta: "macrocoach.dayMeta.v1", dailyCheckin: "macrocoach.dailyCheckin.v1", weeklyPlan: "macrocoach.weeklyPlan.v1", workoutDrafts: "macrocoach.workoutDrafts.v1", savedMeals: "macrocoach.savedMeals.v1", workoutTemplates: "macrocoach.workoutTemplates.v1", settings: "macrocoach.settings.v1" };
  const out = {}; let found = false;
  for (const [name, key] of Object.entries(keys)) if (key in raw) { found = true; try { out[name] = typeof raw[key] === "string" ? JSON.parse(raw[key]) : raw[key]; } catch { out[name] = raw[key]; } }
  return found ? out : null;
}
function fromAkyFitBackup(data) {
  return merge({
    meals: data.meals || {},
    workouts: data.workouts || {},
    bodyMetrics: data.bodyMetrics || [],
    goals: data.goals || defaults().goals,
    peptide: data.peptide || defaults().peptide,
    dayMeta: data.dayMeta || {},
    dailyCheckin: data.dailyCheckin || {},
    weeklyPlan: data.weeklyPlan || defaults().weeklyPlan,
    workoutDrafts: data.workoutDrafts || {},
    savedMeals: data.savedMeals || [],
    workoutTemplates: data.workoutTemplates || DEFAULT_TEMPLATES,
    settings: data.settings || {},
  });
}

function exportBackup() {
  const backup = { version: 2, exportedAt: Date.now(), appName: "AkyFit", data: state };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `akyfit-backup-${todayKey()}.json`; a.click();
  URL.revokeObjectURL(url);
}
async function importFile(file) {
  const next = normalizeImported(JSON.parse(await file.text()));
  if (!confirm("Import this AkyFit/Replit backup? This replaces the website data currently on this device.")) return;
  state = next;
  save(); render();
  setAiOutput("Import complete", "Your old AkyFit/Replit data was imported.");
}

function endpoint() { return String(state.settings.aiEndpoint || "").trim().replace(/\/+$/, "").replace(/\/api$/, ""); }
function setAiOutput(title, body) { $("#ai-output").innerHTML = `<strong>${escapeHtml(title)}</strong><span>${escapeHtml(body)}</span>`; }
async function callAi(path, body) {
  if (!endpoint()) throw new Error("Add your Replit/API backend URL first.");
  const res = await fetch(`${endpoint()}/api/${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!res.ok) { let msg = `AI request failed (${res.status})`; try { const d = await res.json(); if (d?.error) msg = d.error; } catch {} throw new Error(msg); }
  return res.json();
}
function fileBase64(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result || "").split(",").pop());
    r.onerror = () => reject(new Error("Could not read image"));
    r.readAsDataURL(file);
  });
}
function aiPayload() {
  return { goals: todayGoals(), consumed: totals(), hoursLeftInDay: Math.max(0, Math.round((new Date().setHours(23, 59, 59, 999) - Date.now()) / 360000) / 10), trainingDay: modeForToday() === "training", peptideId: state.peptide.id, ...(currentWeight() ? { weightKg: currentWeight() } : {}) };
}

function estimateCalories(type, intensity, minutes) {
  const weight = currentWeight() || 75;
  const met = MET[type]?.[intensity] || 4.5;
  return Math.round(((met * 3.5 * weight) / 200) * minutes);
}
function setView(view) {
  $$(".view").forEach((v) => v.classList.toggle("active", v.id === `view-${view}`));
  $$(".tabbar [data-view]").forEach((b) => b.classList.toggle("active", b.dataset.view === view));
  renderHeader();
}

function bind() {
  document.addEventListener("click", async (e) => {
    const b = e.target.closest("button"); if (!b) return;
    if (b.dataset.view) setView(b.dataset.view);
    if (b.dataset.viewShortcut) setView(b.dataset.viewShortcut);
    if (b.dataset.selectPlan !== undefined) {
      state.settings.logPlanKey = b.dataset.selectPlan;
      ensureWorkoutDraft(state.settings.logPlanKey);
      save(); render();
    }
    if (b.dataset.historyType !== undefined) {
      state.settings.historyType = b.dataset.historyType;
      save(); renderHistory();
    }
    if (b.dataset.mode) { state.dayMeta[todayKey()] = { mode: b.dataset.mode }; save(); render(); }
    if (b.dataset.checkinAdd) {
      const key = todayKey();
      const current = state.dailyCheckin[key] || {};
      current[b.dataset.checkinAdd] = num(current[b.dataset.checkinAdd]) + num(b.dataset.amount);
      state.dailyCheckin[key] = current;
      save(); render();
    }
    if (b.dataset.deleteType) {
      const key = todayKey();
      if (b.dataset.deleteType === "meal") state.meals[key] = todayMeals().filter((x) => x.id !== b.dataset.deleteId);
      if (b.dataset.deleteType === "workout") state.workouts[key] = todayWorkouts().filter((x) => x.id !== b.dataset.deleteId);
      if (b.dataset.deleteType === "body") state.bodyMetrics = state.bodyMetrics.filter((x) => x.id !== b.dataset.deleteId);
      save(); render();
    }
    if (b.dataset.deleteWorkoutDate !== undefined) {
      const date = b.dataset.deleteWorkoutDate;
      state.workouts[date] = (state.workouts[date] || []).filter((x) => x.id !== b.dataset.deleteWorkoutId);
      save(); render();
    }
    if (b.dataset.addSaved) {
      const meal = state.savedMeals.find((m) => m.id === b.dataset.addSaved);
      if (meal) addMeal(meal, false);
    }
    if (b.dataset.cycleDay !== undefined) {
      const i = b.dataset.cycleDay; const current = state.weeklyPlan.assignments[i] || "rest";
      const options = assignmentOptions();
      state.weeklyPlan.assignments[i] = options[(Math.max(0, options.indexOf(current)) + 1) % options.length];
      save(); render();
    }
    if (b.dataset.doseDay !== undefined) {
      const day = Number(b.dataset.doseDay); const set = new Set(state.weeklyPlan.doseDays);
      set.has(day) ? set.delete(day) : set.add(day);
      state.weeklyPlan.doseDays = [...set].sort((a, z) => a - z);
      save(); render();
    }
    if (b.dataset.addSet !== undefined) {
      const card = b.closest(".exercise-log");
      const draft = ensureWorkoutDraft(selectedWorkoutPlanKey());
      const log = draft.exerciseLogs.find((entry) => entry.exerciseId === b.dataset.addSet);
      if (card && log) {
        const reps = num(card.querySelector('input[name="reps"]').value);
        const weightKg = rawNum(card.querySelector('input[name="weightKg"]').value);
        if (!reps && !weightKg) return;
        log.sets = [...(log.sets || []), { id: uid(), reps, weightKg, createdAt: Date.now() }];
        card.querySelector('input[name="reps"]').value = "";
        card.querySelector('input[name="weightKg"]').value = "";
        save(); renderWorkoutLogger();
      }
    }
    if (b.dataset.deleteSet !== undefined) {
      const draft = ensureWorkoutDraft(selectedWorkoutPlanKey());
      const log = draft.exerciseLogs.find((entry) => entry.exerciseId === b.dataset.exerciseId);
      if (log) log.sets = (log.sets || []).filter((set) => set.id !== b.dataset.deleteSet);
      save(); renderWorkoutLogger();
    }
    if (b.dataset.addExercise !== undefined) {
      const key = b.dataset.addExercise;
      const input = b.closest(".template-card")?.querySelector("[data-new-exercise]");
      const name = input?.value.trim();
      if (!name) return;
      state.workoutTemplates[key].exercises = [...(state.workoutTemplates[key].exercises || []), { id: `ex-${Date.now()}-${slug(name)}`, name }];
      input.value = "";
      save(); render();
    }
    if (b.dataset.deleteExercise !== undefined) {
      const key = b.dataset.deleteExercise;
      state.workoutTemplates[key].exercises = (state.workoutTemplates[key].exercises || []).filter((exercise) => exercise.id !== b.dataset.exerciseId);
      save(); render();
    }
    if (b.dataset.deleteTemplate !== undefined) {
      const key = b.dataset.deleteTemplate;
      if (!confirm(`Delete ${assignmentLabel(key)} and its exercises? Existing logged sessions stay saved.`)) return;
      delete state.workoutTemplates[key];
      for (const day of Object.keys(state.weeklyPlan.assignments)) if (state.weeklyPlan.assignments[day] === key) state.weeklyPlan.assignments[day] = "rest";
      if (state.settings.logPlanKey === key) state.settings.logPlanKey = "";
      save(); render();
    }
    if (b.id === "add-workout-day") {
      const input = $("#new-workout-day-title");
      const title = input.value.trim() || `Custom Day ${templateKeys().length + 1}`;
      const numbers = templateKeys().map((key) => Number((key.match(/^day(\d+)$/) || [])[1] || 0));
      const next = Math.max(5, ...numbers) + 1;
      const key = `day${next}`;
      state.workoutTemplates[key] = { title, exercises: [] };
      state.settings.logPlanKey = key;
      input.value = "";
      save(); render();
    }
  });
  document.addEventListener("input", (e) => {
    const el = e.target;
    if (el.dataset?.templateTitle !== undefined) {
      const key = el.dataset.templateTitle;
      if (state.workoutTemplates[key]) state.workoutTemplates[key].title = el.value;
      save();
    }
    if (el.dataset?.exerciseName !== undefined) {
      const key = el.dataset.exerciseName;
      const exercise = state.workoutTemplates[key]?.exercises?.find((item) => item.id === el.dataset.exerciseId);
      if (exercise) exercise.name = el.value;
      save();
    }
  });
  document.addEventListener("change", (e) => {
    const el = e.target;
    if (el.dataset?.templateTitle !== undefined || el.dataset?.exerciseName !== undefined) render();
  });
  $("#meal-form").addEventListener("submit", (e) => {
    e.preventDefault(); const f = e.currentTarget;
    addMeal({ name: f.elements.name.value, calories: f.elements.calories.value, protein: f.elements.protein.value, carbs: f.elements.carbs.value, fat: f.elements.fat.value }, Boolean(f.elements.saveMeal.checked));
    f.reset(); setView("today");
  });
  $("#planned-workout-select").addEventListener("change", (e) => { state.settings.logPlanKey = e.currentTarget.value; ensureWorkoutDraft(state.settings.logPlanKey); save(); render(); });
  $("#workout-session-form").addEventListener("submit", (e) => {
    e.preventDefault(); const f = e.currentTarget;
    const planKey = f.elements.planKey.value;
    const draft = ensureWorkoutDraft(planKey);
    const exerciseLogs = (draft.exerciseLogs || []).map((log) => ({ ...log, sets: (log.sets || []).filter((set) => num(set.reps) || rawNum(set.weightKg)) })).filter((log) => log.sets.length);
    if (planKey !== "cardio" && !exerciseLogs.length) { alert("Add at least one set before saving this workout."); return; }
    const minutes = num(f.elements.minutes.value || 45);
    const key = todayKey();
    const now = Date.now();
    const session = {
      id: uid(),
      name: `${assignmentLabel(planKey)} - ${assignmentTitle(planKey)}`,
      type: planKey === "cardio" ? "cardio" : "strength",
      intensity: "moderate",
      planKey,
      planTitle: assignmentTitle(planKey),
      exerciseLogs,
      durationMin: minutes,
      caloriesBurned: num(f.elements.calories.value || estimateCalories(planKey === "cardio" ? "cardio" : "strength", "moderate", minutes)),
      createdAt: now,
    };
    state.workouts[key] = [session, ...todayWorkouts()];
    delete state.workoutDrafts[draftStorageKey(planKey)];
    f.elements.minutes.value = 45;
    f.elements.calories.value = "";
    save(); render(); setView("today");
  });
  $("#checkin-form").addEventListener("input", (e) => {
    const f = e.currentTarget;
    state.dailyCheckin[todayKey()] = { waterMl: num(f.elements.waterMl.value), stepCount: num(f.elements.stepCount.value), sleepHours: f.elements.sleepHours.value, energyLevel: f.elements.energyLevel.value };
    save(); render();
  });
  $("#goals-form").addEventListener("submit", (e) => {
    e.preventDefault(); const f = e.currentTarget;
    for (const mode of ["training", "rest"]) for (const field of ["calories", "protein", "carbs", "fat"]) state.goals[mode][field] = num(f.elements[`${mode}.${field}`].value);
    save(); render();
  });
  $("#body-form").addEventListener("submit", (e) => {
    e.preventDefault(); const f = e.currentTarget;
    state.bodyMetrics = [{ id: uid(), source: "manual", createdAt: Date.now(), weightKg: rawNum(f.elements.weightKg.value), fatPercent: f.elements.fatPercent.value, muscleKg: f.elements.muscleKg.value, visceralFat: f.elements.visceralFat.value }, ...state.bodyMetrics];
    f.reset(); save(); render();
  });
  $("#peptide-select").addEventListener("change", (e) => { state.peptide.id = e.currentTarget.value; save(); render(); });
  $("#weekly-dose-count").addEventListener("change", (e) => { state.peptide.weeklyDoseCount = Math.min(3, Math.max(1, num(e.currentTarget.value || 1))); save(); render(); });
  $("#coach-weight").addEventListener("change", (e) => { state.settings.coachWeightKg = e.currentTarget.value; save(); render(); });
  $("#import-button").addEventListener("click", () => $("#import-file").click());
  $("#import-file").addEventListener("change", async (e) => { const file = e.currentTarget.files?.[0]; if (!file) return; try { await importFile(file); } catch (err) { alert(err?.message || "Import failed."); } finally { e.currentTarget.value = ""; } });
  $("#backup-button").addEventListener("click", exportBackup);
  $("#offline-coach").addEventListener("click", () => { renderCoach(); setAiOutput("Offline coach", offlineCoach().body); });
  $("#save-ai-endpoint").addEventListener("click", () => { state.settings.aiEndpoint = $("#ai-endpoint").value.trim(); save(); setAiOutput("AI URL saved", "AI buttons will use this backend URL if it is online."); });
  $("#ai-coach").addEventListener("click", async () => { try { setAiOutput("AI Coach", "Thinking..."); const d = await callAi("coach-recommendation", aiPayload()); setAiOutput(d.headline || "AI Coach", d.advice || JSON.stringify(d)); } catch (err) { setAiOutput("AI unavailable", err?.message || "Could not reach backend."); } });
  $("#ai-morning").addEventListener("click", async () => { try { setAiOutput("Morning Brief", "Thinking..."); const d = await callAi("morning-brief", { goals: todayGoals(), trainingDay: modeForToday() === "training", peptideId: state.peptide.id, ...(currentWeight() ? { weightKg: currentWeight() } : {}) }); setAiOutput(d.greeting || "Morning Brief", `${d.focus || ""}\n${(d.tips || []).join("\n")}`); } catch (err) { setAiOutput("AI unavailable", err?.message || "Could not reach backend."); } });
  $("#ai-evening").addEventListener("click", async () => { try { setAiOutput("Evening Review", "Thinking..."); const d = await callAi("evening-review", { goals: todayGoals(), consumed: totals(), caloriesBurned: burned(), workoutsLogged: todayWorkouts().length, waterMl: state.dailyCheckin[todayKey()]?.waterMl || 0, trainingDay: modeForToday() === "training", peptideId: state.peptide.id }); setAiOutput(d.headline || "Evening Review", `${(d.wins || []).join("\n")}\n${d.tomorrowFocus || ""}`); } catch (err) { setAiOutput("AI unavailable", err?.message || "Could not reach backend."); } });
  $("#ai-meal-plan").addEventListener("click", async () => { try { setAiOutput("Meal Plan", "Building..."); const d = await callAi("meal-plan", { goals: todayGoals(), consumed: totals(), trainingDay: modeForToday() === "training", peptideId: state.peptide.id, ...(currentWeight() ? { weightKg: currentWeight() } : {}) }); setAiOutput(d.summary || "Meal Plan", Array.isArray(d.items) ? d.items.map((i) => `${i.time || ""} ${i.meal || ""} (${i.calories || 0} kcal, ${i.protein || 0}p)`).join("\n") : JSON.stringify(d)); } catch (err) { setAiOutput("AI unavailable", err?.message || "Could not reach backend."); } });
  $("#ai-food-analyse").addEventListener("click", async () => { try { const file = $("#ai-food-photo").files?.[0]; if (!file) throw new Error("Choose a food photo first."); setAiOutput("Food photo", "Analysing..."); const d = await callAi("analyse-food-photo", { imageBase64: await fileBase64(file) }); const summary = `${d.name || "Meal"}: ${fmt(d.calories)} kcal / ${fmt(d.protein)}p / ${fmt(d.carbs)}c / ${fmt(d.fat)}f`; setAiOutput("Food estimate", summary); if (confirm(`Add this meal?\n\n${summary}`)) { addMeal({ name: d.name || "AI food estimate", calories: d.calories, protein: d.protein, carbs: d.carbs, fat: d.fat }, false); setView("today"); } } catch (err) { setAiOutput("AI unavailable", err?.message || "Could not analyse the photo."); } });
}
function addMeal(meal, saveAsMeal) {
  const key = todayKey();
  const next = { id: uid(), name: String(meal.name || "Meal").trim(), calories: num(meal.calories), protein: num(meal.protein), carbs: num(meal.carbs), fat: num(meal.fat), createdAt: Date.now() };
  state.meals[key] = [next, ...todayMeals()];
  if (saveAsMeal) state.savedMeals = [{ ...next, id: uid(), isFavourite: true }, ...state.savedMeals.filter((m) => m.name.toLowerCase() !== next.name.toLowerCase())];
  save(); render();
}

load().then(() => { bind(); render(); save(); });
