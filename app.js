"use strict";

const APP_NAME = "Julius Trainer";
const BACKUP_PREFIX = "julius-trainer";
const BACKUP_APP_NAMES = new Set([APP_NAME, "AkyFit"]);
const STORE_KEY = "akyfit.website.shadow.v2";
const IDB_NAME = "akyfit.website.v2";
const IDB_STORE = "state";
const IDB_KEY = "main";

const TRAINING_PLAN_VERSION = "aky-training-plan-targets-v4";
const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DEFAULT_WEEKLY_ASSIGNMENTS = { 0: "day1", 1: "day3", 2: "rest", 3: "day5", 4: "day7", 5: "day8", 6: "rest" };
const TRAINING_TERMS = [
  ["Feeder sets", "Warm up by building through lighter sets before working sets."],
  ["Rest-pause", "Fail at the target reps, rest briefly, then continue to failure again with the same weight."],
  ["Cluster set", "Break the work into mini-sets, such as 6x4, with 10-15 sec rests while keeping the same weight."],
  ["Pause on contraction", "Hold and squeeze the shortened position for the listed time."],
  ["Pause on stretch", "Hold the stretched position under control before the next rep."],
  ["Tempo 3120 / 3121", "3 sec eccentric, 1 sec pause, 2 sec concentric, then 0-1 sec at the top."],
];
const PEPTIDE_TIMINGS = [
  ["morning", "Morning"],
  ["night", "Night"],
  ["preworkout", "Before workout"],
];
const FIXED_SYRINGE_UNITS = 100;
const FIXED_DRAW_UNITS = 10;
const FIXED_MG_PER_DRAW = 1;
const FIXED_DRAW_ML = FIXED_DRAW_UNITS / FIXED_SYRINGE_UNITS;
const FIXED_CONCENTRATION_MG_ML = FIXED_MG_PER_DRAW / FIXED_DRAW_ML;
const DEFAULT_COMPOUNDS = [
  { id: "retatrutide", name: "Retatrutide", type: "peptide", vialMg: 10, diluentMl: 1, info: "Fixed calculator rule: 10 units equals 1mg. A 10mg vial needs 1ml bac water." },
  { id: "tesamorelin", name: "Tesamorelin", type: "peptide", vialMg: "", diluentMl: "", info: "Enter the vial strength from your label. Bac water is calculated as vial mg divided by 10." },
  { id: "mots-c", name: "MOTS-c", type: "peptide", vialMg: "", diluentMl: "", info: "Enter the vial strength from your label. Bac water is calculated as vial mg divided by 10." },
  { id: "nad", name: "NAD+", type: "peptide", vialMg: 1000, diluentMl: 10, info: "Special mix override: 1000mg powder uses 10ml bac water." },
  {
    id: "glow-stack",
    name: "Glow Stack",
    type: "peptide",
    vialMg: 70,
    diluentMl: 3,
    info: "Special mix override: 70mg Glow Stack uses 3ml bac water.",
    components: [
      { name: "GHK-Cu", mg: 50 },
      { name: "TB100", mg: 10 },
      { name: "BPC157", mg: 10 },
    ],
  },
  { id: "test-e", name: "Test E", type: "oil", vialMg: "", diluentMl: "", info: "Oil-based injection. Enter the vial concentration in mg/ml, then the dose in mg." },
];
const MET = { strength: 5, cardio: 6, other: 4.5 };
const target = (label, details = "") => ({ id: `target-${slug(label)}`, label, details });

const DEFAULT_TEMPLATES = {
  day1: { title: "Legs A", exercises: [
    ex("Seated leg curl", "8-10 with 2 sec contraction pause; 12-15 with 3 sec stretch pause; 6x4 cluster with 10-15 sec rest."),
    ex("Hack squat", "6-9; then 10-15 with 2 sec pause at the bottom."),
    ex("Cybex squat leg press", "10-12; then 12-15 rest-pause: 20 sec rest to failure, then 40 sec rest to failure."),
    ex("Leg extension superset with pendulum", "Leg extension 10-12 x 3 with 2 sec contraction pause; pendulum add 20kg, no lockout, 3/4 reps to failure."),
    ex("DB walking lunges", "Use a challenging weight that keeps balance. Full-length track lunges with 2 sec pause on each lunge."),
  ] },
  day2: { title: "Legs B", exercises: [
    ex("Lying leg curl", "8-10 with 2 sec contraction pause; 12-15 with 3 sec stretch pause; 6x4 cluster with 10-15 sec rest."),
    ex("Pendulum squat", "8-10; then 4x5 cluster using a weight you could do for around 15 reps."),
    ex("Leg hip press", "8-10 x 2. Second set: 8-10, 45 sec rest max reps, 30 sec max reps, 15 sec max reps, 30 sec max reps, 45 sec max reps."),
    ex("Leg extension giant digressive set", "2 rounds: 8-10; drop 20-30% max reps with 6 sec negative; drop 20-30% max reps with 6 sec positive; drop 20-30% iso hold mid range. Rest 90-120 sec."),
    ex("Lunges", "Use a challenging weight that keeps balance. Full-length track lunges with 2 sec pause on each lunge."),
  ] },
  day3: { title: "Push A", exercises: [
    ex("Reverse pec deck", "12-15 x 2; then 6x4 cluster with 10-15 sec rest."),
    ex("Prime incline press", "8-10 x 3. Set 1 middle pin, set 2 bottom pin, set 3 top pin. Try to keep load the same."),
    ex("High incline smith press", "8-10; then 12-15 rest-pause set."),
    ex("Flex leverage press", "8-10; then 5x4 cluster. Tricep bias: elbows stop in line with torso, pause each rep in the hole."),
    ex("Pec deck", "12-15 reps x 2. 1st rep 6 second hold; 2nd rep 5 second hold; 3rd rep 4 second hold; 4th rep 3 second hold; 5th rep 2 second hold; then rep out to failure, ideally between 12-15."),
    ex("Lateral raise machine", "3 x 12-15 with 2 sec pause on contraction each rep."),
  ] },
  day4: { title: "Push B", exercises: [
    ex("Reverse pec deck", "12-15 x 2; then 6x4 cluster with 10-15 sec rest."),
    ex("Dumbbell side lateral", "2 sec hold at top. 10-12; 12-15; 15-20 with no pause."),
    ex("High incline smith machine press", "8-10; then 10-12. Use 4 sec eccentrics, deep reps, correct elbow path and posture."),
    ex("Prime flat machine chest press", "3121 tempo with micro pause in stretch and peak contraction. 8-10; then 10-12."),
    ex("Dip machine / assisted dips", "10-12 with 2 sec peak contraction and 1 sec stretch; then 12-15; then 15-20."),
    ex("Single arm cuffed lateral", "Micro pause top and bottom. 10-12; then 12-15 rest-pause."),
  ] },
  day5: { title: "Pull A", exercises: [
    ex("Rope pullover", "15-20; then 6x4 cluster set."),
    ex("Single arm prone cable pulldown", "Lat bias. Do not let shoulder extend; stretch through full arm extension. 10-12 with 2 sec hold; then 12-15 no hold."),
    ex("Single arm seated row", "Lat bias. Turn torso slightly away from working arm. Micro pause top and bottom. 8-10; then 12-15."),
    ex("Upper back bias cable pulldown", "8-10; then start at same load, 6 reps, drop 1 pin, repeat until 6 drops and 36 reps total."),
    ex("Upper back bias T-bar row", "Both sets hold 2 sec stretch and push chest away in stretch. 8-10; then 5x4 cluster."),
    ex("Deadlift", "10-15."),
    ex("Rear delt pulldown with D handles", "Cybex machine. Shoulders in front of ears, no retraction, drive elbows out and round. 10-12; then 12-15 rest-pause, both 3121 tempo."),
  ] },
  day6: { title: "Pull B", exercises: [
    ex("Single arm prone cable pulldown", "Lat bias. 12-15 with 2 sec contraction hold; then 12-15 no hold."),
    ex("BB RDL", "4 sec eccentrics, 2 sec pause in stretch. Keep 1 rep in reserve; do not take to failure. 8-10."),
    ex("Prime pin stack row", "8-10 with 2 sec contraction hold; then 5x4 cluster with no hold."),
    ex("Nautilus leverage row", "8-10 with 2 sec contraction pause; then 12-15 with 2 sec stretch."),
    ex("Single arm Nautilus row", "Lat bias. 10-12 with 2 sec stretch; then 12-15 with 2 sec contraction."),
    ex("Smith machine shrugs", "8-10 with 2 sec squeeze; then 10-12 double drop set with no hold."),
  ] },
  day7: { title: "Hamstring / Calves", exercises: [
    ex("Toe press superset with standing calf raise", "Toe press on leg press 15-20 x 3 with 2 sec squeeze; superset with standing bodyweight calf raise to failure."),
    ex("Seated calf machine", "20 x 3. First 10 slow with pauses on stretch and squeeze, then 10 quick. Increase weight each set; last set drop set."),
    ex("Lying hamstring curl", "8-10; 12-15; then 5x4 cluster set."),
    ex("Seated hamstring curl", "8-10; then 10-12. Use 2 sec stretch each rep for both sets."),
    ex("DB RDL", "10-12; then 12-15. Use 2 sec stretch each rep for both sets."),
    ex("Adductors", "10-15 x 2 with 2 sec stretch each rep for both sets."),
    ex("Glute drive / hip thrust machine", "8-10; then 15-20. Micro pause on stretch and squeeze each rep."),
  ] },
  day8: { title: "Delts / Arms", exercises: [
    ex("Lateral raise machine", "8-10; 12-15; then start at first-set load, 6 reps, drop 1 pin and repeat until 6 drops and 36 reps total."),
    ex("Dead stop smith machine shoulder press", "Set stopper so bar reaches around lip/nose height. 10-12; then 5x4 cluster."),
    ex("EZ bar incline skull crusher", "3 sec pause in stretch. Grip just outside shoulder width. 8-10; then 10-12."),
    ex("Seated single arm dumbbell drag bicep curl", "Bench at 65 degrees, torso locked in. Once you fail, hammer curl to failure again. 12-15 x 2."),
    ex("Assisted dip machine", "Stay upright with 3 sec in stretch, no leaning forward, all tension on triceps. 10-12; then 12-15."),
  ] },
};

let saveTimer = 0;
const openExerciseCards = new Set();
const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));
const uid = () => `${Date.now()}${Math.random().toString(36).slice(2, 8)}`;
const clone = (v) => JSON.parse(JSON.stringify(v));
const num = (v) => Math.max(0, Math.round(Number(v) || 0));
const rawNum = (v) => Number.isFinite(Number(v)) ? Number(v) : 0;
const fmt = (v) => Math.round(Number(v) || 0).toLocaleString();
const fmtWeight = (v) => rawNum(v).toLocaleString(undefined, { maximumFractionDigits: 2 });
const fmtDose = (v, digits = 3) => rawNum(v).toLocaleString(undefined, { maximumFractionDigits: digits });
const todayKey = () => dayKey(new Date());
const dayKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const clamp = (value, min = 0, max = 100) => Math.min(max, Math.max(min, Number(value) || 0));
let state = defaults();

function ex(name, notes, targets = []) {
  return { id: `ex-${slug(name)}`, name, notes, targets: targets.length ? expandStoredTargets(targets) : deriveTargets(name, notes) };
}
function defaults() {
  return {
    meals: {},
    savedMeals: [],
    mealPlans: [],
    macroTargets: { calories: "", protein: "", carbs: "", fat: "" },
    workouts: {},
    bodyMetrics: [],
    progressCheckins: [],
    dailyCheckin: {},
    peptideCycles: [],
    peptideLogs: [],
    weeklyPlan: { assignments: { ...DEFAULT_WEEKLY_ASSIGNMENTS }, doseDays: [] },
    workoutTemplates: clone(DEFAULT_TEMPLATES),
    workoutDrafts: {},
    settings: { activeView: "today", selectedSplit: "", selectedSplitDate: "", historyType: "meals", historyDate: todayKey(), trainingPlanVersion: TRAINING_PLAN_VERSION },
    createdAt: Date.now(),
  };
}
function merge(raw) {
  const base = defaults();
  const next = { ...base, ...(raw || {}) };
  next.meals = raw?.meals || base.meals;
  next.savedMeals = Array.isArray(raw?.savedMeals) ? raw.savedMeals.map(normalizeMeal).filter(Boolean) : base.savedMeals;
  next.mealPlans = Array.isArray(raw?.mealPlans) ? raw.mealPlans.map(normalizeMealPlan).filter(Boolean) : base.mealPlans;
  next.macroTargets = normalizeMacroTargets(raw?.macroTargets || raw?.targets || base.macroTargets);
  next.workouts = raw?.workouts || base.workouts;
  next.bodyMetrics = Array.isArray(raw?.bodyMetrics) ? raw.bodyMetrics : Array.isArray(raw?.body) ? raw.body : base.bodyMetrics;
  next.progressCheckins = Array.isArray(raw?.progressCheckins) ? raw.progressCheckins.map(normalizeProgressCheckin).filter(Boolean) : base.progressCheckins;
  next.dailyCheckin = raw?.dailyCheckin || base.dailyCheckin;
  next.peptideCycles = Array.isArray(raw?.peptideCycles) ? raw.peptideCycles.map(normalizeCycle).filter(Boolean) : base.peptideCycles;
  next.peptideLogs = Array.isArray(raw?.peptideLogs) ? raw.peptideLogs.map(normalizeDoseLog).filter(Boolean) : base.peptideLogs;
  next.weeklyPlan = { ...base.weeklyPlan, ...(raw?.weeklyPlan || {}) };
  next.weeklyPlan.assignments = { ...base.weeklyPlan.assignments, ...(raw?.weeklyPlan?.assignments || {}) };
  next.weeklyPlan.doseDays = Array.isArray(raw?.weeklyPlan?.doseDays) ? raw.weeklyPlan.doseDays : [];
  next.workoutTemplates = upgradePlanNotes(normalizeTemplates({ ...base.workoutTemplates, ...(raw?.workoutTemplates || {}) }));
  next.workoutDrafts = raw?.workoutDrafts || {};
  next.settings = { ...base.settings, ...(raw?.settings || {}) };
  if (!hasFullTrainingPlan(next.workoutTemplates)) installDefaultTrainingPlan(next);
  return next;
}
function normalizeTemplates(templates) {
  return Object.fromEntries(Object.entries(templates || {}).map(([key, template]) => {
    const exercises = Array.isArray(template) ? template : Array.isArray(template?.exercises) ? template.exercises : [];
    return [key, {
      title: normalizeTitle(Array.isArray(template) ? key : template?.title || key),
      exercises: exercises.map((exercise, index) => normalizeExercise(exercise, index)),
    }];
  }));
}
function upgradePlanNotes(templates) {
  const next = normalizeTemplates(templates);
  for (const [key, defaultTemplate] of Object.entries(DEFAULT_TEMPLATES)) {
    if (!next[key]) {
      next[key] = clone(defaultTemplate);
      continue;
    }
    next[key].title = normalizeTitle(next[key].title || defaultTemplate.title);
    const byName = new Map((next[key].exercises || []).map((exercise) => [slug(exercise.name), exercise]));
    for (const defaultExercise of defaultTemplate.exercises) {
      const existing = byName.get(slug(defaultExercise.name));
      if (existing && !existing.notes) existing.notes = defaultExercise.notes;
      if (existing && (!Array.isArray(existing.targets) || !existing.targets.length)) existing.targets = clone(defaultExercise.targets || []);
    }
  }
  return next;
}
function hasFullTrainingPlan(templates) {
  return Object.entries(DEFAULT_TEMPLATES).every(([key, defaultTemplate]) => {
    const template = templates?.[key];
    return template?.title === defaultTemplate.title && Array.isArray(template.exercises) && template.exercises.length >= defaultTemplate.exercises.length;
  });
}
function installDefaultTrainingPlan(target) {
  const existing = normalizeTemplates(target.workoutTemplates || {});
  const custom = Object.fromEntries(Object.entries(existing).filter(([key]) => !DEFAULT_TEMPLATES[key]));
  target.workoutTemplates = { ...clone(DEFAULT_TEMPLATES), ...custom };
  target.weeklyPlan = {
    ...(target.weeklyPlan || {}),
    assignments: { ...DEFAULT_WEEKLY_ASSIGNMENTS },
    doseDays: Array.isArray(target.weeklyPlan?.doseDays) ? target.weeklyPlan.doseDays : [],
  };
  target.settings = { ...(target.settings || {}), trainingPlanVersion: TRAINING_PLAN_VERSION };
  if (!target.settings.selectedSplit || !target.workoutTemplates[target.settings.selectedSplit]) {
    target.settings.selectedSplit = DEFAULT_WEEKLY_ASSIGNMENTS[weekdayIndex()] === "rest" ? "day1" : DEFAULT_WEEKLY_ASSIGNMENTS[weekdayIndex()];
  }
  return target;
}
function normalizeExercise(exercise, index) {
  if (typeof exercise === "string") return { id: `ex-${index}-${slug(exercise)}`, name: exercise, notes: "", targets: deriveTargets(exercise, "") };
  const name = String(exercise?.name || exercise?.title || `Exercise ${index + 1}`).trim();
  const notes = String(exercise?.notes || "");
  const targets = Array.isArray(exercise?.targets) && exercise.targets.length ? expandStoredTargets(exercise.targets) : deriveTargets(name, notes);
  return { ...exercise, id: String(exercise?.id || `ex-${index}-${slug(name)}`), name, notes, targets };
}
function normalizeTitle(title) {
  if (title === "Pull A - Lat Focus") return "Pull A";
  if (title === "Pull B - Upper Back Bias") return "Pull B";
  return String(title || "");
}
function slug(v) {
  return String(v || "item").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "item";
}
function escapeHtml(v) {
  return String(v ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}
function guidanceHtml(notes) {
  if (!notes) return "";
  return `<div class="exercise-guidance"><span>Target reps / notes</span><p>${escapeHtml(notes)}</p></div>`;
}
function normalizeTarget(item, index = 0) {
  if (typeof item === "string") return { id: `target-${index}-${slug(item)}`, label: item, details: item };
  const label = String(item?.label || item?.name || item?.reps || `Target ${index + 1}`).trim();
  return { id: String(item?.id || `target-${index}-${slug(label)}`), label, details: String(item?.details || item?.notes || label) };
}
function expandStoredTargets(targets = []) {
  return targets.flatMap((item, index) => expandMultiSetTarget(normalizeTarget(item, index), index));
}
function deriveTargets(name, notes) {
  const text = String(notes || "").trim();
  if (!text) return [];
  const chunks = text
    .replace(/\bthen\b/gi, ";")
    .replace(/\.\s+/g, "; ")
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean);
  const targets = chunks.flatMap((chunk, index) => {
    const expanded = targetsFromMultiSetChunk(chunk, index);
    if (expanded.length) return expanded;
    const label = targetLabel(chunk, index);
    return label ? [normalizeTarget({ label, details: chunk }, index)] : [];
  }).filter(Boolean);
  return targets.length ? targets : [normalizeTarget({ label: `${name} target`, details: text })];
}
function targetsFromMultiSetChunk(text, index) {
  const clean = String(text || "").trim();
  if (/\bcluster\b/i.test(clean)) return [];
  const match = clean.match(/(\d+\s*[-/]\s*\d+|\d+)\s*(?:reps?)?\s*x\s*(\d+)/i);
  if (!match) return [];
  const reps = match[1].replace(/\s+/g, "");
  const count = Math.min(Math.max(Number(match[2]) || 0, 0), 10);
  const extra = clean.replace(match[0], "").replace(/^[\s,.:;-]+|[\s.]+$/g, "");
  return Array.from({ length: count }, (_, setIndex) => normalizeTarget({
    id: `target-${index}-${slug(reps)}-set-${setIndex + 1}`,
    label: `Set ${setIndex + 1}: ${reps} reps`,
    details: `Set ${setIndex + 1} of ${count}. Aim for ${reps} reps${extra ? ` ${extra}` : ""}.`,
  }, index));
}
function expandMultiSetTarget(item, index) {
  if (/^set\s*\d+:/i.test(item.label) || /^set\s*\d+\s+of\s+\d+/i.test(item.details)) return [item];
  const expanded = targetsFromMultiSetChunk(`${item.label}. ${item.details}`, index);
  return expanded.length ? expanded : [item];
}
function targetLabel(text, index) {
  const clean = String(text || "").trim();
  const lower = clean.toLowerCase();
  const cluster = clean.match(/(\d+)\s*x\s*(\d+)\s*cluster/i) || clean.match(/(\d+)x(\d+)\s*cluster/i);
  if (cluster) return `${cluster[1]}x${cluster[2]} cluster`;
  const rangeSets = clean.match(/(\d+\s*[-/]\s*\d+|\d+)\s*(?:reps?)?\s*x\s*(\d+)/i);
  if (rangeSets) return `${rangeSets[1].replace(/\s+/g, "")} reps x${rangeSets[2]}`;
  const setNo = clean.match(/^set\s*(\d+)/i);
  if (setNo) return `Set ${setNo[1]}`;
  const ordinalRep = clean.match(/^(\d+)(?:st|nd|rd|th)\s+rep/i);
  if (ordinalRep) return `Rep ${ordinalRep[1]} hold`;
  const reps = clean.match(/(\d+\s*[-/]\s*\d+|\d+)\s*(?:reps?|rep\b)/i) || clean.match(/^(\d+\s*[-/]\s*\d+|\d+)$/);
  if (reps) {
    const suffix = lower.includes("rest-pause") ? " rest-pause" : lower.includes("drop") ? " drop set" : "";
    return `${reps[1].replace(/\s+/g, "")} reps${suffix}`;
  }
  if (lower.includes("cluster")) return "Cluster set";
  if (lower.includes("rest-pause") || lower.includes("rest pause")) return "Rest-pause";
  if (lower.includes("drop")) return "Drop set";
  if (lower.includes("failure")) return "To failure";
  if (lower.includes("pause") || lower.includes("tempo") || lower.includes("hold")) return `Technique ${index + 1}`;
  return "";
}
function nextTargetId(targets = [], sets = []) {
  const used = new Set((sets || []).map((set) => set.targetId).filter(Boolean));
  return targets.find((item) => !used.has(item.id))?.id || targets[0]?.id || "";
}
function targetOptionsHtml(targets = [], selectedId = "") {
  return targets.length
    ? targets.map((item) => `<option value="${escapeHtml(item.id)}"${item.id === selectedId ? " selected" : ""}>${escapeHtml(item.label)}</option>`).join("")
    : `<option value="">Working set</option>`;
}
function targetDetailsHtml(targets = [], open = false) {
  if (!targets.length) return "";
  return `<details class="target-details"${open ? " open" : ""}><summary>Set targets</summary><div>${targets.map((item) => `<p><strong>${escapeHtml(item.label)}</strong> ${escapeHtml(item.details)}</p>`).join("")}</div></details>`;
}
function getTarget(targets = [], id = "") {
  return targets.find((item) => item.id === id) || targets[0] || null;
}
function trainingTermsHtml() {
  return `<details class="training-terms"><summary>Set terminology</summary><div>${TRAINING_TERMS.map(([term, detail]) => `<p><strong>${escapeHtml(term)}</strong> ${escapeHtml(detail)}</p>`).join("")}</div></details>`;
}
function templateKeys() {
  return Object.keys(state.workoutTemplates || {}).sort((a, b) => {
    const an = Number((a.match(/^day(\d+)$/) || [])[1] || 999);
    const bn = Number((b.match(/^day(\d+)$/) || [])[1] || 999);
    return an === bn ? a.localeCompare(b) : an - bn;
  });
}
function splitTitle(key) {
  if (key === "rest") return "Rest";
  if (key === "cardio") return "Cardio";
  return state.workoutTemplates[key]?.title || key;
}
function plannedSplitForToday() {
  const planned = state.weeklyPlan.assignments[weekdayIndex()] || "day1";
  return planned === "rest" ? "day1" : planned;
}
function selectedSplit(preferPlanner = false) {
  const planned = plannedSplitForToday();
  return planned;
}
function weekdayIndex(date = new Date()) {
  const d = date.getDay();
  return d === 0 ? 6 : d - 1;
}
function isDateKey(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ""));
}
function historySelectedDate() {
  const date = isDateKey(state.settings.historyDate) ? state.settings.historyDate : todayKey();
  state.settings.historyDate = date;
  return date;
}
function startOfWeek(date = new Date()) {
  const d = new Date(date);
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - weekdayIndex(d));
  return d;
}
function metricDateKey(metric) {
  const d = new Date(metric?.createdAt || Date.now());
  return Number.isNaN(d.getTime()) ? todayKey() : dayKey(d);
}
function daysBetween(startDate, endDate) {
  const start = parseDay(startDate);
  const end = parseDay(endDate);
  if (!start || !end) return 0;
  return Math.round((end - start) / 86400000);
}
function weightEntriesForDate(date) {
  return (state.bodyMetrics || []).filter((metric) => metricDateKey(metric) === date).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}
function dayHistoryCounts(date) {
  const meals = (state.meals[date] || []).length;
  const workouts = (state.workouts[date] || []).length;
  const weight = weightEntriesForDate(date).length;
  return { meals, workouts, weight, total: meals + workouts + weight };
}
function mealsForDate(date = todayKey()) {
  return (state.meals[date] || []).map(normalizeMeal).filter(Boolean);
}
function workoutsForDate(date = todayKey()) {
  return state.workouts[date] || [];
}
function todayMeals() { return state.meals[todayKey()] || []; }
function todayWorkouts() { return state.workouts[todayKey()] || []; }
function totals(meals = todayMeals()) {
  return meals.reduce((acc, meal) => ({
    calories: acc.calories + num(meal.calories),
    protein: acc.protein + num(meal.protein),
    carbs: acc.carbs + num(meal.carbs),
    fat: acc.fat + num(meal.fat),
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
}
function normalizeMeal(meal) {
  if (!meal || typeof meal !== "object") return null;
  return {
    id: String(meal.id || uid()),
    name: String(meal.name || "Meal"),
    calories: num(meal.calories),
    protein: rawNum(meal.protein),
    carbs: rawNum(meal.carbs),
    fat: rawNum(meal.fat),
    createdAt: rawNum(meal.createdAt) || Date.now(),
  };
}
function normalizeMealPlan(plan) {
  if (!plan || typeof plan !== "object") return null;
  const meals = Array.isArray(plan.meals) ? plan.meals.map(normalizeMeal).filter(Boolean) : [];
  if (!meals.length) return null;
  return {
    id: String(plan.id || uid()),
    name: String(plan.name || "Meal plan"),
    meals,
    createdAt: rawNum(plan.createdAt) || Date.now(),
  };
}
function normalizeProgressCheckin(entry) {
  if (!entry || typeof entry !== "object") return null;
  const date = isDateKey(entry.date) ? entry.date : todayKey();
  return {
    id: String(entry.id || uid()),
    date,
    weightKg: rawNum(entry.weightKg),
    waistCm: rawNum(entry.waistCm),
    mood: String(entry.mood || ""),
    notes: String(entry.notes || ""),
    photoDataUrl: String(entry.photoDataUrl || ""),
    createdAt: rawNum(entry.createdAt) || Date.now(),
  };
}
function normalizeMacroTargets(targets = {}) {
  return {
    calories: num(targets.calories),
    protein: rawNum(targets.protein),
    carbs: rawNum(targets.carbs),
    fat: rawNum(targets.fat),
  };
}
function hasMacroTargets(targets = state.macroTargets || {}) {
  return ["calories", "protein", "carbs", "fat"].some((key) => rawNum(targets[key]) > 0);
}
function mealFingerprint(meal) {
  return [slug(meal.name), num(meal.calories), rawNum(meal.protein), rawNum(meal.carbs), rawNum(meal.fat)].join("|");
}
function saveMealToLibrary(meal) {
  const normalized = normalizeMeal(meal);
  if (!normalized) return;
  const key = mealFingerprint(normalized);
  state.savedMeals = [normalized, ...(state.savedMeals || []).filter((item) => mealFingerprint(item) !== key)].slice(0, 80);
}
function addMealToToday(meal) {
  const normalized = normalizeMeal(meal);
  if (!normalized) return null;
  const entry = { ...normalized, id: uid(), createdAt: Date.now() };
  const key = todayKey();
  state.meals[key] = [entry, ...todayMeals()];
  return entry;
}
function allMealEntries(includeToday = true) {
  return Object.entries(state.meals || {})
    .flatMap(([date, meals]) => (meals || []).map((meal) => {
      const normalized = normalizeMeal(meal);
      return normalized ? { ...normalized, date } : null;
    }).filter(Boolean))
    .filter((meal) => includeToday || meal.date !== todayKey())
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}
function uniqueRecentMeals(limit = 12) {
  const seen = new Set();
  const meals = [];
  for (const meal of allMealEntries(false)) {
    const key = mealFingerprint(meal);
    if (seen.has(key)) continue;
    seen.add(key);
    meals.push(meal);
    if (meals.length >= limit) break;
  }
  return meals;
}
function macroRemaining() {
  const target = normalizeMacroTargets(state.macroTargets || {});
  const total = totals();
  return {
    calories: target.calories - total.calories,
    protein: target.protein - total.protein,
    carbs: target.carbs - total.carbs,
    fat: target.fat - total.fat,
  };
}
function burned(workouts = todayWorkouts()) {
  return workouts.reduce((sum, workout) => sum + num(workout.caloriesBurned || workout.calories), 0);
}
function compoundById(id) {
  return DEFAULT_COMPOUNDS.find((item) => item.id === id) || DEFAULT_COMPOUNDS[0];
}
function compoundName(id) {
  return compoundById(id)?.name || String(id || "Compound");
}
function compoundOptionsHtml(selected = "") {
  return DEFAULT_COMPOUNDS.map((item) => `<option value="${escapeHtml(item.id)}"${item.id === selected ? " selected" : ""}>${escapeHtml(item.name)}</option>`).join("");
}
function peptideCompoundOptionsHtml(selected = "") {
  const peptides = DEFAULT_COMPOUNDS.filter((item) => item.type === "peptide");
  const selectedId = peptides.some((item) => item.id === selected) ? selected : peptides[0]?.id || "";
  return peptides.map((item) => `<option value="${escapeHtml(item.id)}"${item.id === selectedId ? " selected" : ""}>${escapeHtml(item.name)}</option>`).join("");
}
function timingLabel(value) {
  return PEPTIDE_TIMINGS.find(([key]) => key === value)?.[1] || String(value || "Timing");
}
function timingOptionsHtml(selected = "") {
  return PEPTIDE_TIMINGS.map(([key, label]) => `<option value="${escapeHtml(key)}"${key === selected ? " selected" : ""}>${escapeHtml(label)}</option>`).join("");
}
function normalizeCycle(cycle) {
  if (!cycle?.peptideId || !cycle?.startDate || !cycle?.endDate) return null;
  const compound = compoundById(cycle.peptideId);
  return {
    id: String(cycle.id || uid()),
    peptideId: compound.id,
    peptideName: compound.name,
    startDate: String(cycle.startDate),
    endDate: String(cycle.endDate),
    weeks: String(cycle.weeks || "custom"),
    doseMg: rawNum(cycle.doseMg),
    vialMg: rawNum(cycle.vialMg || compound.vialMg),
    diluentMl: rawNum(cycle.diluentMl || compound.diluentMl),
    days: Array.isArray(cycle.days) ? cycle.days.map(Number).filter((day) => day >= 0 && day <= 6) : [],
    timings: Array.isArray(cycle.timings) ? cycle.timings.filter((time) => PEPTIDE_TIMINGS.some(([key]) => key === time)) : [],
    createdAt: cycle.createdAt || Date.now(),
  };
}
function normalizeDoseLog(log) {
  if (!log?.peptideId || !log?.date) return null;
  const compound = compoundById(log.peptideId);
  return {
    id: String(log.id || uid()),
    cycleId: String(log.cycleId || ""),
    peptideId: compound.id,
    peptideName: log.peptideName || compound.name,
    date: String(log.date),
    timing: log.timing || "morning",
    doseMg: rawNum(log.doseMg),
    vialMg: rawNum(log.vialMg),
    diluentMl: rawNum(log.diluentMl),
    drawMl: rawNum(log.drawMl),
    drawUnits: rawNum(log.drawUnits),
    concentrationMgMl: rawNum(log.concentrationMgMl),
    componentDoses: Array.isArray(log.componentDoses) ? log.componentDoses : [],
    notes: String(log.notes || ""),
    createdAt: log.createdAt || Date.now(),
  };
}
function parseDay(dateKey) {
  const d = new Date(`${dateKey}T12:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}
function addDays(date, amount) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}
function cycleEndDate(startDate, weeks) {
  const start = parseDay(startDate);
  const count = Number(weeks);
  if (!start || !count) return startDate || todayKey();
  return dayKey(addDays(start, (count * 7) - 1));
}
function cycleIsActive(cycle, date = todayKey()) {
  return String(cycle.startDate) <= date && String(cycle.endDate) >= date;
}
function cycleDueOn(cycle, date = todayKey()) {
  return cycleIsActive(cycle, date) && (cycle.days || []).includes(weekdayIndex(parseDay(date) || new Date()));
}
function doseAmountToMg(amount, unit = "mg") {
  const value = rawNum(amount);
  return unit === "mcg" ? value / 1000 : value;
}
function calculateDraw(peptideId, vialMg, diluentMl, doseAmount, preferredUnits = 0, doseUnit = "mg") {
  const compound = compoundById(peptideId);
  const dose = doseAmountToMg(doseAmount, doseUnit);
  const strength = rawNum(vialMg || compound.vialMg);
  const diluent = rawNum(diluentMl || compound.diluentMl);
  if (!dose || !strength) return { ok: false, message: "Enter dose and powder amount from the vial to calculate." };
  if (compound.type === "oil") {
    const drawMl = dose / strength;
    return { ok: true, type: "oil", doseMg: dose, concentrationMgMl: strength, drawMl, drawUnits: drawMl * 100, message: `${fmtDose(drawMl)} ml based on ${fmtDose(strength)} mg/ml.` };
  }
  const preferredMl = rawNum(preferredUnits) / 100;
  const idealDiluentMl = preferredMl && dose ? (strength * preferredMl) / dose : 0;
  if (!diluent) {
    return { ok: true, type: "peptide", doseMg: dose, strengthMg: strength, needsCurrentDiluent: true, concentrationMgMl: 0, drawMl: 0, drawUnits: 0, idealDiluentMl, lowUnitWarning: false };
  }
  const concentrationMgMl = strength / diluent;
  const drawMl = dose / concentrationMgMl;
  const drawUnits = drawMl * 100;
  const componentDoses = Array.isArray(compound.components) && compound.components.length
    ? compound.components.map((component) => ({ name: component.name, mg: dose * (rawNum(component.mg) / compound.components.reduce((sum, item) => sum + rawNum(item.mg), 0)) }))
    : [];
  return { ok: true, type: "peptide", doseMg: dose, strengthMg: strength, concentrationMgMl, drawMl, drawUnits, idealDiluentMl, componentDoses, lowUnitWarning: drawUnits > 0 && drawUnits < 5 };
}
function mixRule(peptideId, vialMg) {
  const strength = rawNum(vialMg);
  if (!strength) return { bacWaterMl: 0, isOverride: false, note: "" };
  if (peptideId === "nad") {
    return {
      bacWaterMl: strength / 100,
      isOverride: true,
      note: "NAD+ override: 1000mg powder uses 10ml bac water.",
    };
  }
  if (peptideId === "glow-stack") {
    return {
      bacWaterMl: (strength * 3) / 70,
      isOverride: true,
      note: "Glow Stack override: 70mg powder uses 3ml bac water.",
    };
  }
  return {
    bacWaterMl: strength / FIXED_CONCENTRATION_MG_ML,
    isOverride: false,
    note: "Standard formula: bac water ml = vial mg / 10.",
  };
}
function fixedBacWaterMl(vialMg, peptideId = "") {
  return mixRule(peptideId, vialMg).bacWaterMl;
}
function calculateFixedReconstitution(peptideId, vialMg) {
  const compound = compoundById(peptideId);
  const strength = rawNum(vialMg || compound.vialMg);
  if (compound.type !== "peptide") return { ok: false, message: "This fixed bac-water calculator is for peptide powder only." };
  if (!strength) return { ok: false, message: "Enter the peptide powder amount from the vial label, in mg." };
  const rule = mixRule(peptideId, strength);
  const bacWaterMl = rule.bacWaterMl;
  const concentrationMgMl = strength / bacWaterMl;
  const mgPerDraw = concentrationMgMl * FIXED_DRAW_ML;
  const totalDraws = mgPerDraw ? strength / mgPerDraw : 0;
  const componentDoses = Array.isArray(compound.components) && compound.components.length
    ? compound.components.map((component) => {
      const total = compound.components.reduce((sum, item) => sum + rawNum(item.mg), 0);
      return { name: component.name, mg: mgPerDraw * (rawNum(component.mg) / total) };
    })
    : [];
  return {
    ok: true,
    type: "fixed-peptide",
    strengthMg: strength,
    bacWaterMl,
    concentrationMgMl,
    drawUnits: FIXED_DRAW_UNITS,
    drawMl: FIXED_DRAW_ML,
    mgPerDraw,
    totalDraws,
    componentDoses,
    ruleNote: rule.note,
    isOverride: rule.isOverride,
  };
}
function doseLogFromCycle(cycle, timing, date = todayKey()) {
  const result = calculateDraw(cycle.peptideId, cycle.vialMg, cycle.diluentMl, cycle.doseMg);
  return normalizeDoseLog({
    id: uid(),
    cycleId: cycle.id,
    peptideId: cycle.peptideId,
    peptideName: compoundName(cycle.peptideId),
    date,
    timing,
    doseMg: cycle.doseMg,
    vialMg: cycle.vialMg,
    diluentMl: cycle.diluentMl,
    concentrationMgMl: result.ok ? result.concentrationMgMl : 0,
    drawMl: result.ok ? result.drawMl : 0,
    drawUnits: result.ok ? result.drawUnits : 0,
    componentDoses: result.ok ? result.componentDoses : [],
    createdAt: Date.now(),
  });
}
function doseAlreadyLogged(cycleId, timing, date = todayKey()) {
  return (state.peptideLogs || []).find((log) => log.cycleId === cycleId && log.timing === timing && log.date === date);
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
async function load() {
  try { state = merge(JSON.parse(localStorage.getItem(STORE_KEY) || "null")); } catch { state = defaults(); }
  let db;
  try {
    db = await openDb();
    const tx = db.transaction(IDB_STORE, "readonly");
    const req = tx.objectStore(IDB_STORE).get(IDB_KEY);
    const stored = await new Promise((resolve, reject) => {
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    if (stored) state = merge(stored);
  } catch {} finally { db?.close?.(); }
}
function save() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch {}
  clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    let db;
    try {
      db = await openDb();
      const tx = db.transaction(IDB_STORE, "readwrite");
      tx.objectStore(IDB_STORE).put(state, IDB_KEY);
    } catch {} finally { db?.close?.(); }
    renderSummary();
  }, 120);
}

function render() {
  renderHeader();
  renderToday();
  renderCheckin();
  renderLog();
  renderPlanner();
  renderPeptides();
  renderHistory();
  renderSummary();
}
function renderHeader() {
  $("#date-label").textContent = new Date().toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" }).toUpperCase();
  const active = $(".view.active");
  $("#screen-title").textContent = active?.dataset.title || APP_NAME;
}
function renderToday() {
  const assign = state.weeklyPlan.assignments[weekdayIndex()] || "rest";
  const template = state.workoutTemplates[assign];
  const exercises = template?.exercises || [];
  const mealTotal = totals();
  $("#today-split").textContent = splitTitle(assign);
  $("#today-detail").textContent = assign === "rest" ? "Rest day" : `${exercises.length} exercises planned`;
  $("#today-exercises").innerHTML = exercises.length ? `<ul>${exercises.map((exercise) => `<li><strong>${escapeHtml(exercise.name)}</strong>${guidanceHtml(exercise.notes)}${targetDetailsHtml(exercise.targets)}</li>`).join("")}</ul>${trainingTermsHtml()}` : `<div class="empty">Rest and recover.</div>`;
  $("#meal-count").textContent = `${todayMeals().length} meals`;
  $("#meal-total").textContent = `${fmt(mealTotal.calories)} kcal`;
  $("#workout-count").textContent = `${todayWorkouts().length} workouts`;
  $("#workout-total").textContent = `${fmt(burned())} kcal burned`;
  renderMacroHero(mealTotal);
  renderHomeDashboard(mealTotal);
  renderConsistencyCalendar();
  renderCoachNotes();
  renderTodayMealList();
  renderMacroSuggestions();
  renderTodayPeptideReminders();
}
function macroName(key) {
  return ({ calories: "Kcal", protein: "Protein", carbs: "Carbs", fat: "Fat" })[key] || key;
}
function macroUnit(key) {
  return key === "calories" ? "kcal" : "g";
}
function macroText(meal) {
  return `${fmt(meal.calories)} kcal / ${fmtDose(meal.protein, 1)}p / ${fmtDose(meal.carbs, 1)}c / ${fmtDose(meal.fat, 1)}f`;
}
function macroBarHtml(key, total, target) {
  const targetValue = rawNum(target[key]);
  const current = rawNum(total[key]);
  const remaining = targetValue - current;
  const pct = targetValue ? Math.min(100, Math.round((current / targetValue) * 100)) : 0;
  const stateClass = targetValue && remaining < 0 ? "over" : "under";
  const note = !targetValue ? "No target" : remaining >= 0 ? `${fmtDose(remaining, 1)} ${macroUnit(key)} left` : `${fmtDose(Math.abs(remaining), 1)} ${macroUnit(key)} over`;
  return `<div class="macro-line ${stateClass}">
    <div><strong>${macroName(key)}</strong><span>${fmtDose(current, 1)} / ${fmtDose(targetValue, 1)} ${macroUnit(key)}</span></div>
    <div class="macro-track"><span style="width:${pct}%"></span></div>
    <small>${note}</small>
  </div>`;
}
function renderMacroHero(total = totals()) {
  const el = $("#macro-hero");
  if (!el) return;
  const target = normalizeMacroTargets(state.macroTargets || {});
  if (!hasMacroTargets(target)) {
    el.innerHTML = `<button class="secondary macro-set-button" data-view="planner" type="button">Set macros</button>`;
    return;
  }
  const pct = target.calories ? Math.min(100, Math.round((total.calories / target.calories) * 100)) : 0;
  const over = target.calories && total.calories > target.calories;
  el.innerHTML = `<div class="macro-ring${over ? " over" : ""}" style="--pct:${pct}%"><strong>${pct}%</strong><span>kcal</span></div>
    <div class="macro-hero-lines">
      <span>${fmt(total.calories)} / ${fmt(target.calories)} kcal</span>
      <span>${fmtDose(total.protein, 1)} / ${fmtDose(target.protein, 1)}g protein</span>
    </div>`;
}
function plannedAssignForDate(date = todayKey()) {
  const day = parseDay(date) || new Date();
  return state.weeklyPlan.assignments[weekdayIndex(day)] || "rest";
}
function dueDoseSlots(date = todayKey()) {
  return (state.peptideCycles || [])
    .filter((cycle) => cycleDueOn(cycle, date))
    .flatMap((cycle) => (cycle.timings || []).map((timing) => ({ cycle, timing })));
}
function doseLoggedForSlot(slot, date = todayKey()) {
  return Boolean((state.peptideLogs || []).find((log) => log.cycleId === slot.cycle.id && log.timing === slot.timing && log.date === date));
}
function macroCompletion(total = totals(), target = state.macroTargets || {}) {
  const normalized = normalizeMacroTargets(target);
  if (!hasMacroTargets(normalized)) return 0;
  const keys = ["calories", "protein", "carbs", "fat"].filter((key) => rawNum(normalized[key]) > 0);
  if (!keys.length) return 0;
  const score = keys.reduce((sum, key) => {
    const current = rawNum(total[key]);
    const targetValue = rawNum(normalized[key]);
    const ratio = targetValue ? current / targetValue : 0;
    const underScore = clamp(ratio * 100);
    const overPenalty = key === "calories" && ratio > 1 ? clamp((ratio - 1) * 80, 0, 35) : 0;
    return sum + clamp(underScore - overPenalty);
  }, 0) / keys.length;
  return Math.round(score);
}
function latestWeightTrend() {
  const entries = [...(state.bodyMetrics || [])]
    .filter((entry) => rawNum(entry.weightKg || entry.weight) > 0)
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  const latest = entries[0];
  const previous = entries[1];
  if (!latest) return { label: "No weight yet", detail: "Add weight in History", recent: false, score: 45 };
  const latestWeight = rawNum(latest.weightKg || latest.weight);
  const latestDate = metricDateKey(latest);
  if (!previous) return { label: `${fmtWeight(latestWeight)}kg`, detail: dateLabel(latestDate), recent: daysBetween(latestDate, todayKey()) <= 7, score: 80 };
  const diff = latestWeight - rawNum(previous.weightKg || previous.weight);
  const sign = diff > 0 ? "+" : "";
  const recent = daysBetween(latestDate, todayKey()) <= 7;
  return {
    label: `${fmtWeight(latestWeight)}kg`,
    detail: `${sign}${fmtWeight(diff)}kg vs last`,
    recent,
    score: recent ? 100 : 65,
  };
}
function readinessData(total = totals()) {
  const target = normalizeMacroTargets(state.macroTargets || {});
  const c = state.dailyCheckin[todayKey()] || {};
  const assign = plannedAssignForDate();
  const restDay = assign === "rest";
  const due = dueDoseSlots();
  const loggedDoses = due.filter((slot) => doseLoggedForSlot(slot)).length;
  const weight = latestWeightTrend();
  const metrics = [
    { key: "macros", label: "Macros", value: hasMacroTargets(target) ? `${macroCompletion(total, target)}%` : "Set", detail: hasMacroTargets(target) ? `${fmt(total.calories)} / ${fmt(target.calories)} kcal` : "Add targets", score: hasMacroTargets(target) ? macroCompletion(total, target) : 40 },
    { key: "water", label: "Water", value: `${fmtDose(rawNum(c.waterMl) / 1000, 1)}L`, detail: "Goal 3L", score: clamp((rawNum(c.waterMl) / 3000) * 100) },
    { key: "steps", label: "Steps", value: fmt(c.stepCount), detail: "Goal 10k", score: clamp((rawNum(c.stepCount) / 10000) * 100) },
    { key: "sleep", label: "Sleep", value: c.sleepHours ? `${fmtDose(c.sleepHours, 1)}h` : "-", detail: "Goal 7h", score: clamp((rawNum(c.sleepHours) / 7) * 100) },
    { key: "workout", label: "Workout", value: restDay ? "Rest" : todayWorkouts().length ? "Done" : "Due", detail: splitTitle(assign), score: restDay || todayWorkouts().length ? 100 : 0 },
    { key: "peptides", label: "Peptides", value: due.length ? `${loggedDoses}/${due.length}` : "None", detail: due.length ? "Due today" : "No dose due", score: due.length ? clamp((loggedDoses / due.length) * 100) : 100 },
    { key: "weight", label: "Weight", value: weight.label, detail: weight.detail, score: weight.score },
  ];
  const weights = { macros: 24, water: 14, steps: 13, sleep: 14, workout: 15, peptides: 12, weight: 8 };
  const score = Math.round(metrics.reduce((sum, item) => sum + (item.score * (weights[item.key] || 10)), 0) / metrics.reduce((sum, item) => sum + (weights[item.key] || 10), 0));
  const summary = score >= 85 ? "Strong day. Keep the boxes green." : score >= 65 ? "Good base. Finish the remaining targets." : "Focus on the next easy win first.";
  return { score, summary, metrics };
}
function renderHomeDashboard(total = totals()) {
  const scoreEl = $("#readiness-score");
  const summaryEl = $("#readiness-summary");
  const metricsEl = $("#dashboard-metrics");
  if (!scoreEl || !summaryEl || !metricsEl) return;
  const data = readinessData(total);
  scoreEl.style.setProperty("--pct", `${data.score}%`);
  scoreEl.classList.toggle("warning", data.score < 65);
  scoreEl.querySelector("strong").textContent = String(data.score);
  summaryEl.textContent = data.summary;
  metricsEl.innerHTML = data.metrics.map((item) => `<div class="dash-card ${item.score >= 90 ? "done" : item.score >= 60 ? "mid" : "low"}">
    <span>${escapeHtml(item.label)}</span>
    <strong>${escapeHtml(item.value)}</strong>
    <small>${escapeHtml(item.detail)}</small>
  </div>`).join("");
}
function dayAdherence(date) {
  const meals = mealsForDate(date);
  const total = totals(meals);
  const c = state.dailyCheckin[date] || {};
  const due = dueDoseSlots(date);
  const peptideDone = due.length ? due.every((slot) => doseLoggedForSlot(slot, date)) : true;
  return {
    meals: meals.length > 0 && (!hasMacroTargets() || macroCompletion(total) >= 75),
    workout: plannedAssignForDate(date) === "rest" ? "rest" : workoutsForDate(date).length > 0,
    water: rawNum(c.waterMl) >= 3000,
    peptide: peptideDone,
  };
}
function renderConsistencyCalendar() {
  const el = $("#consistency-calendar");
  if (!el) return;
  const today = parseDay(todayKey()) || new Date();
  el.innerHTML = Array.from({ length: 14 }, (_, index) => {
    const date = dayKey(addDays(today, index - 13));
    const d = parseDay(date);
    const data = dayAdherence(date);
    const workoutClass = data.workout === "rest" ? "rest" : data.workout ? "hit" : "miss";
    return `<div class="consistency-day${date === todayKey() ? " active" : ""}">
      <span>${escapeHtml(d?.toLocaleDateString([], { weekday: "short" }) || "")}</span>
      <strong>${d?.getDate() || ""}</strong>
      <div class="consistency-dots">
        <i class="${workoutClass}" title="Workout"></i>
        <i class="${data.meals ? "hit" : "miss"}" title="Meals"></i>
        <i class="${data.water ? "hit" : "miss"}" title="Water"></i>
        <i class="${data.peptide ? "hit" : "miss"}" title="Peptides"></i>
      </div>
    </div>`;
  }).join("");
}
function coachNotes() {
  const notes = [];
  const remaining = macroRemaining();
  if (hasMacroTargets()) {
    const protein = Math.max(0, rawNum(remaining.protein));
    const carbs = Math.max(0, rawNum(remaining.carbs));
    notes.push(protein || carbs ? `You still need about ${fmtDose(protein, 1)}g protein and ${fmtDose(carbs, 1)}g carbs today.` : "Macros are on track today. Keep the next meal controlled.");
  } else {
    notes.push("Set macro targets in Planner so meal suggestions can get sharper.");
  }
  const trend = exerciseTrendNote();
  if (trend) notes.push(trend);
  const c = state.dailyCheckin[todayKey()] || {};
  if (rawNum(c.waterMl) < 3000) notes.push(`Water is ${fmtDose(Math.max(0, 3000 - rawNum(c.waterMl)) / 1000, 1)}L behind your 3L goal.`);
  else if (rawNum(c.stepCount) < 10000) notes.push(`Steps need about ${fmt(Math.max(0, 10000 - rawNum(c.stepCount)))} more to hit 10k.`);
  else notes.push("Water and steps are in a strong place today.");
  return notes.slice(0, 4);
}
function renderCoachNotes() {
  const el = $("#coach-notes");
  if (!el) return;
  el.innerHTML = coachNotes().map((note) => `<div class="coach-card"><span>Coach</span><p>${escapeHtml(note)}</p></div>`).join("");
}
function mealActionButton(label, attrs, kind = "secondary") {
  return `<button class="${kind}" ${attrs} type="button">${label}</button>`;
}
function mealCardHtml(meal, actions = "", extra = "") {
  return `<div class="meal-card">
    <div class="meal-card-head">
      <div><strong>${escapeHtml(meal.name)}</strong><small>${escapeHtml(macroText(meal))}${extra ? ` / ${escapeHtml(extra)}` : ""}</small></div>
      ${actions ? `<div class="meal-actions">${actions}</div>` : ""}
    </div>
  </div>`;
}
function renderTodayMealList() {
  const el = $("#today-meal-list");
  if (!el) return;
  const meals = todayMeals().map(normalizeMeal).filter(Boolean);
  const total = totals(meals);
  el.innerHTML = meals.length
    ? `<div class="macro-bars">${["calories", "protein", "carbs", "fat"].map((key) => macroBarHtml(key, total, state.macroTargets || {})).join("")}</div>
      ${meals.map((meal) => mealCardHtml(meal, `${mealActionButton("Save", `data-save-meal-date="${todayKey()}" data-save-meal-id="${escapeHtml(meal.id)}"`)}${mealActionButton("Delete", `data-delete-today-meal="${escapeHtml(meal.id)}"`, "danger-button")}`)).join("")}`
    : `<div class="empty">No meals logged today.</div>`;
}
function mealSuggestionScore(meal, remaining) {
  const weights = { calories: 1, protein: 1.5, carbs: 0.7, fat: 0.5 };
  return ["calories", "protein", "carbs", "fat"].reduce((score, key) => {
    const need = rawNum(remaining[key]);
    if (need <= 0) return score;
    const value = rawNum(meal[key]);
    const coverage = Math.min(value, need) / need;
    const overshoot = value > need ? (value - need) / Math.max(need, 1) : 0;
    return score + (coverage * weights[key]) - Math.min(overshoot, 1) * 0.2;
  }, 0);
}
function suggestedMeals(limit = 3) {
  const remaining = macroRemaining();
  const missing = ["calories", "protein", "carbs", "fat"].some((key) => rawNum(remaining[key]) > (key === "calories" ? 50 : 5));
  if (!missing) return [];
  return [...(state.savedMeals || [])]
    .map(normalizeMeal)
    .filter((meal) => meal && (meal.calories || meal.protein || meal.carbs || meal.fat))
    .map((meal) => ({ meal, score: mealSuggestionScore(meal, remaining) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.meal);
}
function combineMeals(meals = []) {
  return meals.reduce((acc, meal) => ({
    id: [...(acc.id ? acc.id.split(",") : []), meal.id].filter(Boolean).join(","),
    name: [...(acc.name ? acc.name.split(" + ") : []), meal.name].filter(Boolean).join(" + "),
    calories: acc.calories + num(meal.calories),
    protein: acc.protein + rawNum(meal.protein),
    carbs: acc.carbs + rawNum(meal.carbs),
    fat: acc.fat + rawNum(meal.fat),
    meals,
  }), { id: "", name: "", calories: 0, protein: 0, carbs: 0, fat: 0, meals: [] });
}
function suggestedMealCombos(limit = 3) {
  const remaining = macroRemaining();
  const missing = ["calories", "protein", "carbs", "fat"].some((key) => rawNum(remaining[key]) > (key === "calories" ? 50 : 5));
  if (!missing) return [];
  const meals = [...(state.savedMeals || [])].map(normalizeMeal).filter((meal) => meal && (meal.calories || meal.protein || meal.carbs || meal.fat)).slice(0, 30);
  const combos = meals.map((meal) => [meal]);
  for (let i = 0; i < meals.length; i += 1) {
    for (let j = i + 1; j < meals.length; j += 1) combos.push([meals[i], meals[j]]);
  }
  const seen = new Set();
  return combos
    .map((items) => {
      const combo = combineMeals(items);
      const key = combo.id;
      if (seen.has(key)) return null;
      seen.add(key);
      return { combo, score: mealSuggestionScore(combo, remaining) + (items.length > 1 ? 0.25 : 0) };
    })
    .filter((item) => item && item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.combo);
}
function renderMacroSuggestions() {
  const el = $("#macro-suggestion-list");
  if (!el) return;
  if (!hasMacroTargets()) {
    el.innerHTML = `<div class="empty">Set your macro targets in Planner first.</div>`;
    return;
  }
  const remaining = macroRemaining();
  const missing = ["calories", "protein", "carbs", "fat"].some((key) => rawNum(remaining[key]) > (key === "calories" ? 50 : 5));
  if (!missing) {
    el.innerHTML = `<div class="empty">You are on or above today's targets.</div>`;
    return;
  }
  const suggestions = suggestedMealCombos();
  if (!suggestions.length) {
    el.innerHTML = `<div class="empty">Save meals from Log or History, then suggestions will appear here.</div>`;
    return;
  }
  const gap = `<div class="formula-note">You need ${fmtDose(Math.max(0, remaining.protein), 1)}g protein and ${fmtDose(Math.max(0, remaining.carbs), 1)}g carbs. Calories left: ${fmt(Math.max(0, remaining.calories))}.</div>`;
  el.innerHTML = `${gap}${suggestions.map((meal) => {
    const buttonAttr = meal.meals?.length > 1 ? `data-add-meal-combo="${escapeHtml(meal.id)}"` : `data-add-saved-meal="${escapeHtml(meal.id)}"`;
    const extra = meal.meals?.length > 1 ? `${meal.meals.length} saved meals` : "";
    return mealCardHtml(meal, mealActionButton("Add today", buttonAttr, "primary"), extra);
  }).join("")}`;
}
function renderCheckin() {
  const c = state.dailyCheckin[todayKey()] || {};
  const f = $("#checkin-form");
  f.elements.waterMl.value = c.waterMl || "";
  f.elements.stepCount.value = c.stepCount || "";
  f.elements.sleepHours.value = c.sleepHours || "";
  f.elements.energyLevel.value = c.energyLevel || "";
}
function renderLog() {
  const options = templateKeys();
  const select = $("#split-select");
  const planned = selectedSplit(true);
  select.value = options.includes(planned) ? planned : options[0];
  state.settings.selectedSplit = select.value;
  state.settings.selectedSplitDate = todayKey();
  const template = state.workoutTemplates[select.value];
  $("#planned-log-split").textContent = splitTitle(select.value);
  $("#planned-log-detail").textContent = template?.exercises?.length ? `${template.exercises.length} exercises from today's Weekly Plan` : "Change today's day in Planner to choose this workout.";
  renderWorkoutEditor();
  renderPersonalRecords();
  renderSavedMealList();
  renderRecentMealList();
}
function ensureDraft(split = selectedSplit()) {
  const key = `${todayKey()}:${split}`;
  const template = state.workoutTemplates[split];
  let draft = state.workoutDrafts[key] || { id: uid(), split, startedAt: Date.now(), exerciseLogs: [] };
  const old = new Map((draft.exerciseLogs || []).map((log) => [String(log.exerciseId), log]));
  draft.exerciseLogs = (template?.exercises || []).map((exercise) => {
    const prev = old.get(String(exercise.id));
    return { exerciseId: exercise.id, name: exercise.name, notes: exercise.notes || "", targets: exercise.targets || [], sets: Array.isArray(prev?.sets) ? prev.sets : [] };
  });
  state.workoutDrafts[key] = draft;
  return draft;
}
function renderWorkoutEditor() {
  const split = selectedSplit();
  const draft = ensureDraft(split);
  const logs = draft.exerciseLogs || [];
  $("#workout-editor").innerHTML = logs.length ? `
    ${trainingTermsHtml()}
    ${logs.map((log) => {
      const previous = latestExerciseSets(log.name, draft.startedAt);
      const isOpen = openExerciseCards.has(String(log.exerciseId)) || !!log.sets?.length;
      return `<details class="exercise-log" data-exercise-id="${escapeHtml(log.exerciseId)}"${isOpen ? " open" : ""}>
        <summary class="exercise-summary">
          <span>
            <strong>${escapeHtml(log.name)}</strong>
            <small>${previous ? `Previous ${previous.date}: ${escapeHtml(setSummary(previous.sets))}` : "No previous sets saved"}</small>
          </span>
          <span class="summary-pill">Log sets</span>
        </summary>
        <div class="exercise-log-body">
          ${guidanceHtml(log.notes)}
          ${targetDetailsHtml(log.targets, true)}
          ${progressiveOverloadHtml(log, draft.startedAt)}
          <div class="set-entry">
            <label class="target-select">Set target<select name="targetId">${targetOptionsHtml(log.targets, nextTargetId(log.targets, log.sets))}</select></label>
            <label>Reps done<input name="reps" type="number" min="0" inputmode="numeric" /></label>
            <label>Weight kg<input name="weightKg" type="number" min="0" step="0.5" inputmode="decimal" /></label>
            <button class="secondary" data-add-set="${escapeHtml(log.exerciseId)}" type="button">Add set</button>
          </div>
          <div class="set-list">${log.sets?.length ? log.sets.map((set) => `<span class="set-chip"><strong>${escapeHtml(set.targetLabel || "Set")}</strong>${fmtWeight(set.weightKg)}kg x ${fmt(set.reps)} <button data-delete-set="${escapeHtml(set.id)}" data-exercise-id="${escapeHtml(log.exerciseId)}" type="button">x</button></span>`).join("") : `<span class="empty">No sets added yet</span>`}</div>
        </div>
      </details>`;
    }).join("")}` : `<div class="empty">No exercises in this split yet.</div>`;
}
function latestExerciseSets(name, before = Date.now()) {
  const target = slug(name);
  const sessions = allWorkoutSessions();
  for (const workout of sessions) {
    if ((workout.createdAt || 0) >= before) continue;
    const log = (workout.exerciseLogs || []).find((entry) => slug(entry.name) === target && entry.sets?.length);
    if (log) return { date: workout.date, sets: log.sets };
  }
  return null;
}
function setSummary(sets = []) {
  return sets.map((set) => `${set.targetLabel ? `${set.targetLabel}: ` : ""}${fmtWeight(set.weightKg)}kg x ${fmt(set.reps)}`).join(", ");
}
function estimatedOneRepMax(set) {
  const weight = rawNum(set.weightKg);
  const reps = num(set.reps);
  return weight && reps ? weight * (1 + (reps / 30)) : 0;
}
function exerciseSessions(name, before = Infinity) {
  const target = slug(name);
  return allWorkoutSessions()
    .filter((workout) => (workout.createdAt || 0) < before)
    .flatMap((workout) => (workout.exerciseLogs || [])
      .filter((log) => slug(log.name) === target && log.sets?.length)
      .map((log) => ({ workout, log, date: workout.date, createdAt: workout.createdAt || 0 })))
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}
function summarizeExerciseLog(entry) {
  const sets = (entry?.log?.sets || []).filter((set) => num(set.reps) || rawNum(set.weightKg));
  const bestSet = [...sets].sort((a, b) => rawNum(b.weightKg) - rawNum(a.weightKg) || num(b.reps) - num(a.reps))[0] || null;
  const bestReps = sets.reduce((max, set) => Math.max(max, num(set.reps)), 0);
  const volume = sets.reduce((sum, set) => sum + (rawNum(set.weightKg) * num(set.reps)), 0);
  const est1rm = sets.reduce((max, set) => Math.max(max, estimatedOneRepMax(set)), 0);
  return { sets, bestSet, bestReps, volume, est1rm };
}
function targetRepText(targets = []) {
  if (!targets.length) return "Working sets";
  return targets.map((target) => target.label).slice(0, 2).join(" / ");
}
function targetRepHigh(targets = []) {
  const text = targets.map((target) => `${target.label} ${target.details}`).join(" ");
  const range = text.match(/(\d+)\s*[-/]\s*(\d+)/);
  if (range) return Number(range[2]) || 0;
  const single = text.match(/\b(\d+)\s*(?:reps?|rep\b)/i);
  return single ? Number(single[1]) : 0;
}
function exerciseStats(name, before = Infinity) {
  const sessions = exerciseSessions(name, before);
  const latest = sessions[0] ? { ...sessions[0], summary: summarizeExerciseLog(sessions[0]) } : null;
  const previous = sessions[1] ? { ...sessions[1], summary: summarizeExerciseLog(sessions[1]) } : null;
  const allSets = sessions.flatMap((entry) => (entry.log.sets || []).map((set) => ({ ...set, date: entry.date, exercise: entry.log.name })));
  const bestSet = [...allSets].sort((a, b) => rawNum(b.weightKg) - rawNum(a.weightKg) || num(b.reps) - num(a.reps))[0] || null;
  const bestReps = allSets.reduce((max, set) => Math.max(max, num(set.reps)), 0);
  const bestEst1rm = allSets.reduce((max, set) => Math.max(max, estimatedOneRepMax(set)), 0);
  const bestVolume = sessions.reduce((max, entry) => Math.max(max, summarizeExerciseLog(entry).volume), 0);
  return { sessions, latest, previous, bestSet, bestReps, bestEst1rm, bestVolume };
}
function overloadSuggestion(log, before = Infinity) {
  const stats = exerciseStats(log.name, before);
  if (!stats.latest?.summary?.bestSet) return "Log this once to start tracking progression.";
  const lastSet = stats.latest.summary.bestSet;
  const high = targetRepHigh(log.targets || []);
  if (high && num(lastSet.reps) >= high && rawNum(lastSet.weightKg) > 0) return `Try +2.5kg if warm-ups feel good.`;
  if (stats.bestSet && rawNum(lastSet.weightKg) < rawNum(stats.bestSet.weightKg)) return `Build back toward ${fmtWeight(stats.bestSet.weightKg)}kg.`;
  return "Match last week, then add reps if it moves well.";
}
function progressiveOverloadHtml(log, before = Infinity) {
  const stats = exerciseStats(log.name, before);
  const last = stats.latest?.summary?.bestSet;
  const best = stats.bestSet;
  return `<div class="overload-card">
    <div class="overload-head"><strong>Progressive overload</strong><small>${escapeHtml(overloadSuggestion(log, before))}</small></div>
    <div class="overload-grid">
      <span><small>Last weight</small><strong>${last ? `${fmtWeight(last.weightKg)}kg` : "-"}</strong></span>
      <span><small>Best weight</small><strong>${best ? `${fmtWeight(best.weightKg)}kg` : "-"}</strong></span>
      <span><small>Last reps</small><strong>${last ? fmt(last.reps) : "-"}</strong></span>
      <span><small>Target reps</small><strong>${escapeHtml(targetRepText(log.targets || []))}</strong></span>
    </div>
  </div>`;
}
function personalRecords(limit = 10) {
  const grouped = new Map();
  for (const workout of allWorkoutSessions()) {
    for (const log of workout.exerciseLogs || []) {
      const key = slug(log.name);
      if (!key || !log.sets?.length) continue;
      const current = grouped.get(key) || { name: log.name, bestSet: null, bestReps: 0, bestVolume: 0, bestEst1rm: 0, dates: [] };
      const summary = summarizeExerciseLog({ log });
      current.dates.push(workout.date);
      if (summary.bestSet && (!current.bestSet || rawNum(summary.bestSet.weightKg) > rawNum(current.bestSet.weightKg) || (rawNum(summary.bestSet.weightKg) === rawNum(current.bestSet.weightKg) && num(summary.bestSet.reps) > num(current.bestSet.reps)))) current.bestSet = { ...summary.bestSet, date: workout.date };
      current.bestReps = Math.max(current.bestReps, summary.bestReps);
      current.bestVolume = Math.max(current.bestVolume, summary.volume);
      current.bestEst1rm = Math.max(current.bestEst1rm, summary.est1rm);
      grouped.set(key, current);
    }
  }
  return [...grouped.values()].sort((a, b) => b.bestEst1rm - a.bestEst1rm || b.bestVolume - a.bestVolume).slice(0, limit);
}
function renderPersonalRecords() {
  const el = $("#personal-record-list");
  if (!el) return;
  const records = personalRecords();
  el.innerHTML = records.length ? records.map((record) => `<div class="pr-card">
    <strong>${escapeHtml(record.name)}</strong>
    <div class="pr-metrics">
      <span><small>Best set</small><b>${record.bestSet ? `${fmtWeight(record.bestSet.weightKg)}kg x ${fmt(record.bestSet.reps)}` : "-"}</b></span>
      <span><small>Volume</small><b>${fmtWeight(record.bestVolume)}kg</b></span>
      <span><small>Est. 1RM</small><b>${fmtWeight(record.bestEst1rm)}kg</b></span>
    </div>
  </div>`).join("") : `<div class="empty">Save workout sets to start earning PR badges.</div>`;
}
function exerciseTrendNote() {
  const records = personalRecords(30);
  for (const record of records) {
    const sessions = exerciseSessions(record.name).slice(0, 3).map((entry) => summarizeExerciseLog(entry));
    if (sessions.length < 2) continue;
    const latest = sessions[0].bestSet;
    const previous = sessions[1].bestSet;
    if (!latest || !previous) continue;
    if (rawNum(latest.weightKg) > rawNum(previous.weightKg) || (rawNum(latest.weightKg) === rawNum(previous.weightKg) && num(latest.reps) > num(previous.reps))) {
      return `${record.name} is improving versus the previous session. Keep the same form standard.`;
    }
    if (sessions.length >= 3 && sessions.every((session) => session.bestSet && rawNum(session.bestSet.weightKg) <= rawNum(previous.weightKg))) {
      return `${record.name} looks stalled across recent logs. Aim to match last week before adding load.`;
    }
  }
  return allWorkoutSessions().length ? "Keep logging set detail so training trend notes become more accurate." : "Log your first full workout to unlock overload and trend notes.";
}
function renderPlanner() {
  renderMacroTargetForm();
  renderMealPlanBuilder();
  $("#week-grid").innerHTML = WEEK_DAYS.map((day, index) => {
    const assign = state.weeklyPlan.assignments[index] || "rest";
    return `<div class="day-card"><strong>${day}</strong><button data-cycle-day="${index}" type="button">${escapeHtml(splitTitle(assign))}</button><small>${assign === "rest" ? "Rest day" : `${state.workoutTemplates[assign]?.exercises?.length || 0} exercises`}</small></div>`;
  }).join("");
  $("#split-list").innerHTML = templateKeys().map((key) => {
    const template = state.workoutTemplates[key];
    return `<div class="split-card">
      <div class="split-head"><strong>${escapeHtml(template.title)}</strong><button class="danger-button" data-delete-split="${escapeHtml(key)}" type="button">Delete</button></div>
      <label>Split name<input data-split-title="${escapeHtml(key)}" value="${escapeHtml(template.title)}" /></label>
      <div class="exercise-list">${template.exercises.map((exercise) => `<div class="exercise-edit">
        <div>
          <input data-exercise-name="${escapeHtml(key)}" data-exercise-id="${escapeHtml(exercise.id)}" value="${escapeHtml(exercise.name)}" />
          <textarea data-exercise-notes="${escapeHtml(key)}" data-exercise-id="${escapeHtml(exercise.id)}" rows="2" placeholder="Rep range / extra notes">${escapeHtml(exercise.notes || "")}</textarea>
          ${targetDetailsHtml(exercise.targets)}
        </div>
        <button class="danger-button" data-delete-exercise="${escapeHtml(key)}" data-exercise-id="${escapeHtml(exercise.id)}" type="button">x</button>
      </div>`).join("")}</div>
      <div class="add-line"><input data-new-exercise="${escapeHtml(key)}" placeholder="Add exercise" /><button class="secondary" data-add-exercise="${escapeHtml(key)}" type="button">Add</button></div>
    </div>`;
  }).join("");
}
function renderMacroTargetForm() {
  const f = $("#macro-target-form");
  if (!f) return;
  const target = normalizeMacroTargets(state.macroTargets || {});
  f.elements.calories.value = target.calories || "";
  f.elements.protein.value = target.protein || "";
  f.elements.carbs.value = target.carbs || "";
  f.elements.fat.value = target.fat || "";
}
function renderMealPlanBuilder() {
  const picker = $("#meal-plan-saved-picker");
  const list = $("#meal-plan-list");
  if (!picker || !list) return;
  const saved = (state.savedMeals || []).map(normalizeMeal).filter(Boolean);
  picker.innerHTML = saved.length
    ? saved.map((meal) => `<label class="meal-plan-choice"><input name="mealPlanMeal" type="checkbox" value="${escapeHtml(meal.id)}" /><span><strong>${escapeHtml(meal.name)}</strong><small>${escapeHtml(macroText(meal))}</small></span></label>`).join("")
    : `<div class="empty">Save meals from the Log tab first, then build a full-day plan here.</div>`;
  const plans = (state.mealPlans || []).map(normalizeMealPlan).filter(Boolean);
  list.innerHTML = plans.length ? plans.map((plan) => {
    const total = totals(plan.meals);
    return `<div class="meal-card">
      <div class="meal-card-head">
        <div><strong>${escapeHtml(plan.name)}</strong><small>${plan.meals.length} meals / ${escapeHtml(macroText(total))}</small></div>
        <div class="meal-actions">
          <button class="primary" data-apply-meal-plan="${escapeHtml(plan.id)}" type="button">Add day</button>
          <button class="danger-button" data-delete-meal-plan="${escapeHtml(plan.id)}" type="button">Delete</button>
        </div>
      </div>
      <div class="dose-meta">${plan.meals.map((meal) => `<span class="pill">${escapeHtml(meal.name)}</span>`).join("")}</div>
    </div>`;
  }).join("") : `<div class="empty">No daily meal plans saved yet.</div>`;
}
function renderSavedMealList() {
  const el = $("#saved-meal-list");
  if (!el) return;
  const meals = (state.savedMeals || []).map(normalizeMeal).filter(Boolean);
  el.innerHTML = meals.length
    ? meals.map((meal) => mealCardHtml(meal, `${mealActionButton("Add today", `data-add-saved-meal="${escapeHtml(meal.id)}"`, "primary")}${mealActionButton("Delete", `data-delete-saved-meal="${escapeHtml(meal.id)}"`, "danger-button")}`)).join("")
    : `<div class="empty">No saved meals yet. Log a meal and keep Save meal ticked.</div>`;
}
function renderRecentMealList() {
  const el = $("#recent-meal-list");
  if (!el) return;
  const meals = uniqueRecentMeals(12);
  el.innerHTML = meals.length
    ? meals.map((meal) => mealCardHtml(meal, `${mealActionButton("Add today", `data-add-meal-date="${escapeHtml(meal.date)}" data-add-meal-id="${escapeHtml(meal.id)}"`, "primary")}${mealActionButton("Save", `data-save-meal-date="${escapeHtml(meal.date)}" data-save-meal-id="${escapeHtml(meal.id)}"`, "secondary")}`, dateLabel(meal.date))).join("")
    : `<div class="empty">Previous logged meals will appear here.</div>`;
}
function renderPeptides() {
  if (!$("#cycle-peptide")) return;
  hydratePeptideControls();
  renderPeptideDashboard();
  renderTodayPeptideReminders();
  renderPeptideDueList();
  renderPeptideCycles();
  renderPeptideInfo();
  renderReconstitution();
  renderPeptideHistory();
}
function hydratePeptideControls() {
  const cycleSelect = $("#cycle-peptide");
  const calcSelect = $("#calc-peptide");
  const logSelect = $("#log-peptide");
  const selectedCycle = cycleSelect.value || DEFAULT_COMPOUNDS[0].id;
  const peptideCompounds = DEFAULT_COMPOUNDS.filter((item) => item.type === "peptide");
  const selectedCalc = peptideCompounds.some((item) => item.id === calcSelect.value) ? calcSelect.value : selectedCycle;
  const selectedLog = logSelect.value || selectedCycle;
  cycleSelect.innerHTML = compoundOptionsHtml(selectedCycle);
  calcSelect.innerHTML = peptideCompoundOptionsHtml(selectedCalc);
  logSelect.innerHTML = compoundOptionsHtml(selectedLog);
  cycleSelect.value = selectedCycle;
  calcSelect.value = peptideCompounds.some((item) => item.id === selectedCalc) ? selectedCalc : peptideCompounds[0]?.id || "";
  logSelect.value = selectedLog;
  const dayPicker = $("#cycle-day-picker");
  const selectedDays = new Set($$("#cycle-day-picker input:checked").map((input) => input.value));
  dayPicker.innerHTML = WEEK_DAYS.map((day, index) => `<label><input name="cycleDays" type="checkbox" value="${index}"${selectedDays.has(String(index)) ? " checked" : ""} />${day}</label>`).join("");
  const timePicker = $("#cycle-time-picker");
  const selectedTimes = new Set($$("#cycle-time-picker input:checked").map((input) => input.value));
  timePicker.innerHTML = PEPTIDE_TIMINGS.map(([key, label]) => `<label><input name="cycleTimes" type="checkbox" value="${escapeHtml(key)}"${selectedTimes.has(key) ? " checked" : ""} />${escapeHtml(label)}</label>`).join("");
  const cycleForm = $("#peptide-cycle-form");
  if (!cycleForm.elements.startDate.value) cycleForm.elements.startDate.value = todayKey();
  if (!cycleForm.elements.endDate.value) cycleForm.elements.endDate.value = cycleEndDate(cycleForm.elements.startDate.value, cycleForm.elements.weeks.value);
  applyCompoundDefaults(cycleForm, cycleSelect.value, false);
  const calcForm = $("#reconstitution-form");
  applyCompoundDefaults(calcForm, calcSelect.value, false);
  const logForm = $("#peptide-log-form");
  logForm.elements.timing.innerHTML = timingOptionsHtml(logForm.elements.timing.value || "morning");
  if (!logForm.elements.date.value) logForm.elements.date.value = todayKey();
}
function applyCompoundDefaults(form, peptideId, overwrite = false) {
  const compound = compoundById(peptideId);
  if (!form) return;
  if ("vialMg" in form.elements && (overwrite || !form.elements.vialMg.value)) form.elements.vialMg.value = compound.vialMg || "";
  syncFixedDiluent(form, compound);
  if ("diluentMl" in form.elements && compound.type !== "peptide" && (overwrite || !form.elements.diluentMl.value)) form.elements.diluentMl.value = compound.diluentMl || "";
  if ("doseMg" in form.elements && overwrite) form.elements.doseMg.value = "";
}
function syncFixedDiluent(form, compound = compoundById(form?.elements?.peptideId?.value)) {
  if (!form || !("diluentMl" in form.elements)) return;
  const diluent = form.elements.diluentMl;
  if (compound.type !== "peptide") {
    diluent.readOnly = false;
    return;
  }
  const water = fixedBacWaterMl(form.elements.vialMg?.value || compound.vialMg, compound.id);
  diluent.readOnly = true;
  diluent.value = water ? String(Number(water.toFixed(3))) : "";
}
function cycleLogs(cycle) {
  return (state.peptideLogs || []).filter((log) => {
    const inDates = String(log.date) >= String(cycle.startDate) && String(log.date) <= String(cycle.endDate);
    return log.cycleId === cycle.id || (!log.cycleId && log.peptideId === cycle.peptideId && inDates);
  });
}
function scheduledDoseSlots(cycle, fromDate = cycle.startDate, toDate = cycle.endDate) {
  const start = parseDay(fromDate);
  const end = parseDay(toDate);
  if (!start || !end || end < start) return [];
  const slots = [];
  for (let day = new Date(start); day <= end; day = addDays(day, 1)) {
    const date = dayKey(day);
    if (!cycleDueOn(cycle, date)) continue;
    for (const timing of cycle.timings || []) slots.push({ date, timing });
  }
  return slots;
}
function cycleDashboardData(cycle) {
  const today = todayKey();
  const totalDays = Math.max(1, daysBetween(cycle.startDate, cycle.endDate) + 1);
  const elapsedDays = clamp(daysBetween(cycle.startDate, today) + 1, 0, totalDays);
  const week = Math.max(1, Math.ceil(Math.max(1, elapsedDays) / 7));
  const weeks = Math.max(1, Math.ceil(totalDays / 7));
  const logs = cycleLogs(cycle);
  const totalMg = logs.reduce((sum, log) => sum + rawNum(log.doseMg), 0);
  const pastEnd = dayKey(addDays(parseDay(today) || new Date(), -1));
  const missed = scheduledDoseSlots(cycle, cycle.startDate, pastEnd)
    .filter((slot) => !logs.some((log) => log.date === slot.date && log.timing === slot.timing)).length;
  const next = scheduledDoseSlots(cycle, today, cycle.endDate)
    .find((slot) => !logs.some((log) => log.date === slot.date && log.timing === slot.timing));
  return {
    progress: Math.round((elapsedDays / totalDays) * 100),
    week,
    weeks,
    logs,
    totalMg,
    missed,
    next,
    daysLeft: Math.max(0, daysBetween(today, cycle.endDate) + 1),
  };
}
function renderPeptideDashboard() {
  const el = $("#peptide-dashboard");
  if (!el) return;
  const cycles = [...(state.peptideCycles || [])].sort((a, b) => cycleIsActive(b) - cycleIsActive(a) || (b.createdAt || 0) - (a.createdAt || 0));
  el.innerHTML = cycles.length ? cycles.map((cycle) => {
    const data = cycleDashboardData(cycle);
    const status = cycleIsActive(cycle) ? `Week ${data.week} of ${data.weeks}` : String(cycle.startDate) > todayKey() ? "Upcoming" : "Complete";
    const next = data.next ? `${dateLabel(data.next.date)} / ${timingLabel(data.next.timing)}` : "No upcoming dose";
    return `<div class="cycle-card">
      <div class="dose-card-head">
        <div>
          <strong>${escapeHtml(compoundName(cycle.peptideId))}</strong>
          <small>${escapeHtml(status)} / ${escapeHtml(dateLabel(cycle.startDate))} to ${escapeHtml(dateLabel(cycle.endDate))}</small>
        </div>
        <span class="pill">${data.progress}%</span>
      </div>
      <div class="cycle-track"><span style="width:${clamp(data.progress)}%"></span></div>
      <div class="dashboard-grid compact">
        <div class="dash-card"><span>Next dose</span><strong>${escapeHtml(next)}</strong><small>${fmtDose(cycle.doseMg)}mg planned</small></div>
        <div class="dash-card ${data.missed ? "low" : "done"}"><span>Missed</span><strong>${fmt(data.missed)}</strong><small>Doses before today</small></div>
        <div class="dash-card"><span>Total used</span><strong>${fmtDose(data.totalMg)}mg</strong><small>${fmt(data.logs.length)} dose logs</small></div>
        <div class="dash-card"><span>Remaining</span><strong>${fmt(data.daysLeft)} days</strong><small>Cycle time left</small></div>
      </div>
    </div>`;
  }).join("") : `<div class="empty">Add a peptide cycle to see progress, missed doses and total mg used.</div>`;
}
function renderTodayPeptideReminders() {
  const el = $("#today-peptide-reminders");
  if (!el) return;
  el.innerHTML = dueDoseCards(true);
}
function renderPeptideDueList() {
  const el = $("#peptide-due-list");
  if (!el) return;
  el.innerHTML = dueDoseCards(false);
}
function dueDoseCards(compact = false) {
  const date = todayKey();
  const due = (state.peptideCycles || []).filter((cycle) => cycleDueOn(cycle, date));
  if (!due.length) return `<div class="empty">No peptide doses scheduled for today.</div>`;
  return due.flatMap((cycle) => (cycle.timings || []).map((timing) => {
    const logged = doseAlreadyLogged(cycle.id, timing, date);
    const calc = calculateDraw(cycle.peptideId, cycle.vialMg, cycle.diluentMl, cycle.doseMg);
    return `<div class="dose-card">
      <div class="dose-card-head">
        <div>
          <strong>${escapeHtml(compoundName(cycle.peptideId))}</strong>
          <small>${escapeHtml(timingLabel(timing))} / ${fmtDose(cycle.doseMg)}mg${calc.ok && calc.drawMl ? ` / ${fmtDose(calc.drawMl)}ml${calc.type === "peptide" ? ` / ${fmt(calc.drawUnits)} units` : ""}` : ""}</small>
        </div>
        ${logged ? `<span class="pill">Logged</span>` : `<button class="primary" data-log-dose="${escapeHtml(cycle.id)}" data-dose-timing="${escapeHtml(timing)}" type="button">Log</button>`}
      </div>
      ${compact ? "" : `<div class="dose-meta"><span class="pill">${escapeHtml(dateLabel(cycle.startDate))}</span><span class="pill">${escapeHtml(dateLabel(cycle.endDate))}</span></div>`}
    </div>`;
  })).join("");
}
function renderPeptideCycles() {
  const cycles = [...(state.peptideCycles || [])].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  $("#peptide-cycle-list").innerHTML = cycles.length ? cycles.map((cycle) => {
    const calc = calculateDraw(cycle.peptideId, cycle.vialMg, cycle.diluentMl, cycle.doseMg);
    return `<div class="dose-card">
      <div class="dose-card-head">
        <div>
          <strong>${escapeHtml(compoundName(cycle.peptideId))}</strong>
          <small>${escapeHtml(dateLabel(cycle.startDate))} to ${escapeHtml(dateLabel(cycle.endDate))} / ${fmtDose(cycle.doseMg)}mg per dose</small>
        </div>
        <button class="danger-button" data-delete-cycle="${escapeHtml(cycle.id)}" type="button">Delete</button>
      </div>
      <div class="dose-meta">
        <span class="pill">${escapeHtml(cycleDaysText(cycle.days))}</span>
        ${(cycle.timings || []).map((time) => `<span class="pill">${escapeHtml(timingLabel(time))}</span>`).join("")}
        ${calc.ok && calc.drawMl ? `<span class="pill">${fmtDose(calc.drawMl)}ml${calc.type === "peptide" ? ` / ${fmt(calc.drawUnits)} units` : ""}</span>` : ""}
      </div>
    </div>`;
  }).join("") : `<div class="empty">No peptide cycles saved yet.</div>`;
}
function cycleDaysText(days = []) {
  return days.length ? days.map((day) => WEEK_DAYS[day] || "").filter(Boolean).join(", ") : "No days";
}
function renderPeptideInfo() {
  $("#peptide-info-list").innerHTML = DEFAULT_COMPOUNDS.map((compound) => {
    const components = Array.isArray(compound.components) && compound.components.length
      ? `<ul class="component-list">${compound.components.map((item) => `<li>${escapeHtml(item.name)}: ${fmtDose(item.mg)}mg</li>`).join("")}</ul>`
      : "";
    const fixedWater = fixedBacWaterMl(compound.vialMg, compound.id);
    const meta = compound.type === "oil"
      ? `Concentration from vial label`
      : compound.vialMg
      ? `${fmtDose(compound.vialMg)}mg vial / ${fmtDose(fixedWater)}ml bac water`
      : "Enter vial mg / standard rule, unless NAD+ or Glow Stack";
    return `<div class="compound-card">
      <strong>${escapeHtml(compound.name)}</strong>
      <small>${escapeHtml(compound.info)}</small>
      <div class="compound-meta"><span class="pill">${escapeHtml(meta)}</span></div>
      ${components}
    </div>`;
  }).join("");
}
function renderReconstitution() {
  const resultEl = $("#reconstitution-result");
  if (!resultEl) return;
  const form = $("#reconstitution-form");
  const peptideId = form.elements.peptideId.value;
  const result = calculateFixedReconstitution(peptideId, form.elements.vialMg.value);
  resultEl.classList.toggle("warning", !result.ok);
  if (!result.ok) {
    resultEl.innerHTML = `<strong>${escapeHtml(compoundName(peptideId))}</strong><small>${escapeHtml(result.message)}</small>`;
    return;
  }
  const componentHtml = result.componentDoses?.length
    ? `<div class="formula-note"><strong>Glow stack per 10 units</strong><ul class="component-list">${result.componentDoses.map((item) => `<li>${escapeHtml(item.name)}: ${fmtDose(item.mg)}mg</li>`).join("")}</ul></div>`
    : "";
  resultEl.innerHTML = `<strong>${escapeHtml(compoundName(peptideId))}</strong>
    <div class="calc-callout"><strong>Add ${fmtDose(result.bacWaterMl)}ml bac water</strong><small>${fmtDose(result.strengthMg)}mg vial at ${fmtDose(result.concentrationMgMl)}mg/ml means ${fmt(result.drawUnits)} units (${fmtDose(result.drawMl)}ml) = ${fmtDose(result.mgPerDraw)}mg.</small></div>
    <div class="dose-meta">
      <span class="pill">Vial: ${fmtDose(result.strengthMg)}mg</span>
      <span class="pill">Bac water: ${fmtDose(result.bacWaterMl)}ml</span>
      <span class="pill">10 units = ${fmtDose(result.mgPerDraw)}mg</span>
      <span class="pill">Full vial: ${fmtDose(result.totalDraws, 1)} x 10-unit draws</span>
    </div>
    <div class="formula-note">${escapeHtml(result.ruleNote)}${result.isOverride ? " This override only applies to this compound." : " Example: 10mg vial / 10 = 1ml bac water."}</div>
    ${componentHtml}`;
}
function renderPeptideHistory() {
  const logs = [...(state.peptideLogs || [])].sort((a, b) => {
    const dateCompare = String(b.date).localeCompare(String(a.date));
    return dateCompare || (b.createdAt || 0) - (a.createdAt || 0);
  });
  $("#peptide-log-list").innerHTML = logs.length ? logs.map((log) => {
    const componentHtml = log.componentDoses?.length ? `<ul class="component-list">${log.componentDoses.map((item) => `<li>${escapeHtml(item.name)}: ${fmtDose(item.mg)}mg</li>`).join("")}</ul>` : "";
    return `<div class="history-card">
      <div class="history-head">
        <div>
          <strong>${escapeHtml(log.peptideName || compoundName(log.peptideId))}</strong>
          <small>${escapeHtml(dateLabel(log.date))} / ${escapeHtml(timingLabel(log.timing))} / ${fmtDose(log.doseMg)}mg${log.drawMl ? ` / ${fmtDose(log.drawMl)}ml` : ""}${log.drawUnits ? ` / ${fmt(log.drawUnits)} units` : ""}</small>
        </div>
        <button class="danger-button" data-delete-dose="${escapeHtml(log.id)}" type="button">Delete</button>
      </div>
      ${componentHtml}
      ${log.notes ? `<small>${escapeHtml(log.notes)}</small>` : ""}
    </div>`;
  }).join("") : `<div class="empty">No dosage history yet.</div>`;
}
function renderHistory() {
  renderHistoryCalendar();
  renderProgressCheckins();
  const type = state.settings.historyType || "meals";
  $$(".tabs [data-history]").forEach((button) => button.classList.toggle("active", button.dataset.history === type));
  if (type === "meals") return renderMealHistory();
  if (type === "workouts") return renderWorkoutHistory();
  renderWeightHistory();
}
function renderHistoryCalendar() {
  const strip = $("#history-day-strip");
  if (!strip) return;
  const selected = historySelectedDate();
  const selectedDay = parseDay(selected) || new Date();
  const weekStart = startOfWeek(selectedDay);
  $("#history-week-label").textContent = `Week starting ${dateLabel(dayKey(weekStart))}`;
  $("#history-selected-label").textContent = `Selected ${dateLabel(selected)}`;
  strip.innerHTML = Array.from({ length: 7 }, (_, index) => {
    const day = addDays(weekStart, index);
    const key = dayKey(day);
    const counts = dayHistoryCounts(key);
    return `<button class="history-day${key === selected ? " active" : ""}${counts.total ? " has-data" : ""}" data-history-day="${escapeHtml(key)}" type="button">
      <span>${escapeHtml(WEEK_DAYS[index])}</span>
      <strong>${day.getDate()}</strong>
      <small>${counts.total ? `${counts.meals}M ${counts.workouts}W ${counts.weight}Wt` : ""}</small>
    </button>`;
  }).join("");
}
function renderMealHistory() {
  const date = historySelectedDate();
  const meals = (state.meals[date] || []).map(normalizeMeal).filter(Boolean);
  const t = totals(meals);
  $("#history-list").innerHTML = meals.length
    ? `<div class="history-card"><div class="history-head"><div><strong>${dateLabel(date)}</strong><small>${meals.length} meals / ${fmt(t.calories)} kcal / ${fmt(t.protein)}p</small></div></div><div class="meal-list">${meals.map((meal) => mealCardHtml(meal, `${mealActionButton("Add today", `data-add-meal-date="${escapeHtml(date)}" data-add-meal-id="${escapeHtml(meal.id)}"`, "primary")}${mealActionButton("Save", `data-save-meal-date="${escapeHtml(date)}" data-save-meal-id="${escapeHtml(meal.id)}"`, "secondary")}`)).join("")}</div></div>`
    : `<div class="empty">No meals logged for ${escapeHtml(dateLabel(date))}.</div>`;
}
function renderWorkoutHistory() {
  const date = historySelectedDate();
  const sessions = allWorkoutSessions().filter((workout) => workout.date === date);
  $("#history-list").innerHTML = sessions.length ? sessions.map((workout) => {
    const logs = (workout.exerciseLogs || []).filter((log) => log.sets?.length);
    return `<div class="history-card"><div class="history-head"><div><strong>${escapeHtml(workout.name || workout.planTitle || "Workout")}</strong><small>${dateLabel(workout.date)} / ${fmt(workout.durationMin || 0)} min / ${fmt(workout.caloriesBurned || 0)} kcal</small></div><button class="danger-button" data-delete-workout-date="${escapeHtml(workout.date)}" data-delete-workout-id="${escapeHtml(workout.id)}" type="button">Delete</button></div>${logs.length ? `<ul>${logs.map((log) => `<li><strong>${escapeHtml(log.name)}</strong><span>${escapeHtml(setSummary(log.sets))}</span>${guidanceHtml(log.notes)}${targetDetailsHtml(log.targets)}</li>`).join("")}</ul>` : `<div class="empty">No set detail saved.</div>`}</div>`;
  }).join("") : `<div class="empty">No workouts logged for ${escapeHtml(dateLabel(date))}.</div>`;
}
function renderWeightHistory() {
  const date = historySelectedDate();
  const entries = weightEntriesForDate(date);
  $("#history-list").innerHTML = entries.length ? entries.map((m) => `<div class="history-card"><div class="history-head"><div><strong>${dateLabel(date)}</strong><small>${fmtWeight(m.weightKg || m.weight)} kg${m.fatPercent ? ` / ${m.fatPercent}% fat` : ""}</small></div><button class="danger-button" data-delete-weight="${escapeHtml(m.id)}" type="button">Delete</button></div></div>`).join("") : `<div class="empty">No weight entries for ${escapeHtml(dateLabel(date))}.</div>`;
}
function progressCheckinsForDate(date) {
  return (state.progressCheckins || []).filter((entry) => entry.date === date).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}
function renderProgressCheckins() {
  const list = $("#progress-list");
  const form = $("#progress-form");
  if (!list || !form) return;
  if (!form.elements.date.value) form.elements.date.value = todayKey();
  const date = historySelectedDate();
  const entries = progressCheckinsForDate(date);
  list.innerHTML = entries.length ? entries.map((entry) => `<div class="history-card progress-card">
    <div class="history-head">
      <div>
        <strong>${escapeHtml(dateLabel(entry.date))}</strong>
        <small>${entry.weightKg ? `${fmtWeight(entry.weightKg)}kg` : "No weight"}${entry.waistCm ? ` / ${fmtWeight(entry.waistCm)}cm waist` : ""}${entry.mood ? ` / ${escapeHtml(entry.mood)}` : ""}</small>
      </div>
      <button class="danger-button" data-delete-progress="${escapeHtml(entry.id)}" type="button">Delete</button>
    </div>
    ${entry.photoDataUrl ? `<img class="progress-photo" src="${escapeHtml(entry.photoDataUrl)}" alt="Progress check-in" />` : ""}
    ${entry.notes ? `<p>${escapeHtml(entry.notes)}</p>` : ""}
  </div>`).join("") : `<div class="empty">No progress check-in for ${escapeHtml(dateLabel(date))}.</div>`;
}
function allWorkoutSessions() {
  return Object.entries(state.workouts || {}).flatMap(([date, workouts]) => (workouts || []).map((workout) => ({ ...workout, date }))).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}
function dateLabel(date) {
  const d = new Date(`${date}T12:00:00`);
  return Number.isNaN(d.getTime()) ? String(date || "") : d.toLocaleDateString([], { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}
function renderSummary() {
  const el = $("#data-summary");
  if (!el) return;
  el.textContent = JSON.stringify({
    mealsToday: todayMeals().length,
    savedMeals: state.savedMeals.length,
    mealPlans: state.mealPlans.length,
    macroTargets: state.macroTargets,
    workoutSessions: allWorkoutSessions().length,
    peptideCycles: state.peptideCycles.length,
    peptideDoseLogs: state.peptideLogs.length,
    weightEntries: state.bodyMetrics.length,
    progressCheckins: state.progressCheckins.length,
    workoutSplits: templateKeys().map((key) => splitTitle(key)),
  }, null, 2);
}

function estimateCalories(minutes) {
  const latest = [...state.bodyMetrics].filter((m) => rawNum(m.weightKg || m.weight) > 0).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))[0];
  const weight = rawNum(latest?.weightKg || latest?.weight) || 75;
  return Math.round(((MET.strength * 3.5 * weight) / 200) * minutes);
}
function applyPlan() {
  installDefaultTrainingPlan(state);
  state.settings.selectedSplit = selectedSplit(true);
  state.settings.selectedSplitDate = todayKey();
}
function exportBackup() {
  const blob = new Blob([JSON.stringify({ version: 3, appName: APP_NAME, exportedAt: Date.now(), data: state }, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${BACKUP_PREFIX}-backup-${todayKey()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
function importBackup(raw) {
  const data = BACKUP_APP_NAMES.has(raw?.appName) && raw.data ? raw.data : raw?.data || raw;
  if (!confirm("Import this backup? It replaces the website data on this device.")) return;
  state = merge(data);
  save();
  render();
}
async function importText(text) {
  const clean = String(text || "").trim();
  if (!clean) throw new Error("Paste or choose a backup JSON file first.");
  importBackup(JSON.parse(clean));
}
async function importFile(file) {
  await importText(await file.text());
}
function imageFileToDataUrl(file) {
  if (!file) return Promise.resolve("");
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error || new Error("Could not read image."));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => resolve(String(reader.result || ""));
      image.onload = () => {
        const maxSide = 900;
        const scale = Math.min(1, maxSide / Math.max(image.width, image.height || 1));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(String(reader.result || ""));
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.72));
      };
      image.src = String(reader.result || "");
    };
    reader.readAsDataURL(file);
  });
}
function downloadText(filename, text, type = "text/plain") {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
function reportDates(days = 7) {
  const today = parseDay(todayKey()) || new Date();
  return Array.from({ length: days }, (_, index) => dayKey(addDays(today, index - (days - 1))));
}
function weeklyReportText() {
  const dates = reportDates(7);
  const lines = [
    `${APP_NAME} Weekly Report`,
    `Generated: ${new Date().toLocaleString()}`,
    `Range: ${dateLabel(dates[0])} to ${dateLabel(dates[dates.length - 1])}`,
    "",
  ];
  let workoutDays = 0;
  let mealDays = 0;
  let waterDays = 0;
  let peptideHitDays = 0;
  for (const date of dates) {
    const meals = mealsForDate(date);
    const mealTotal = totals(meals);
    const workouts = workoutsForDate(date);
    const checkin = state.dailyCheckin[date] || {};
    const doses = (state.peptideLogs || []).filter((log) => log.date === date);
    const weight = weightEntriesForDate(date)[0];
    const progress = progressCheckinsForDate(date);
    const adherence = dayAdherence(date);
    if (workouts.length) workoutDays += 1;
    if (meals.length) mealDays += 1;
    if (adherence.water) waterDays += 1;
    if (adherence.peptide) peptideHitDays += 1;
    lines.push(`## ${dateLabel(date)}`);
    lines.push(`Adherence: workout ${adherence.workout === "rest" ? "Rest" : adherence.workout ? "Hit" : "Miss"} / meals ${adherence.meals ? "Hit" : "Miss"} / water ${adherence.water ? "Hit" : "Miss"} / peptides ${adherence.peptide ? "Hit" : "Miss"}`);
    lines.push(`Meals: ${meals.length} / ${fmt(mealTotal.calories)} kcal / ${fmtDose(mealTotal.protein, 1)}p / ${fmtDose(mealTotal.carbs, 1)}c / ${fmtDose(mealTotal.fat, 1)}f`);
    if (meals.length) lines.push(`Meal list: ${meals.map((meal) => meal.name).join(", ")}`);
    lines.push(`Check-in: ${fmtDose(rawNum(checkin.waterMl) / 1000, 1)}L water / ${fmt(checkin.stepCount)} steps / ${checkin.sleepHours || "-"}h sleep / energy ${checkin.energyLevel || "-"}`);
    lines.push(`Workouts: ${workouts.length ? workouts.map((workout) => `${workout.name || workout.planTitle || "Workout"} (${fmt(workout.durationMin)} min)`).join(", ") : "None"}`);
    lines.push(`Peptides: ${doses.length ? doses.map((dose) => `${dose.peptideName || compoundName(dose.peptideId)} ${fmtDose(dose.doseMg)}mg ${timingLabel(dose.timing)}`).join(", ") : "None logged"}`);
    lines.push(`Weight: ${weight ? `${fmtWeight(weight.weightKg || weight.weight)}kg${weight.fatPercent ? ` / ${weight.fatPercent}% fat` : ""}` : "None"}`);
    lines.push(`Body check-ins: ${progress.length}`);
    lines.push("");
  }
  lines.unshift(`Summary: ${workoutDays}/7 workout days, ${mealDays}/7 meal days, ${waterDays}/7 water hits, ${peptideHitDays}/7 peptide adherence days.`);
  return lines.join("\n");
}
function exportWeeklyReport() {
  downloadText(`${BACKUP_PREFIX}-weekly-report-${todayKey()}.txt`, weeklyReportText());
}

function bind() {
  document.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    if (button.dataset.view) setView(button.dataset.view);
    if (button.dataset.logToday !== undefined) { state.settings.selectedSplit = selectedSplit(true); state.settings.selectedSplitDate = todayKey(); setView("log"); render(); }
    if (button.dataset.addSavedMeal) {
      const meal = (state.savedMeals || []).find((item) => item.id === button.dataset.addSavedMeal);
      if (!meal) return;
      addMealToToday(meal);
      save(); render(); setView("today");
    }
    if (button.dataset.addMealDate && button.dataset.addMealId) {
      const meal = (state.meals[button.dataset.addMealDate] || []).find((item) => item.id === button.dataset.addMealId);
      if (!meal) return;
      addMealToToday(meal);
      save(); render(); setView("today");
    }
    if (button.dataset.addMealCombo) {
      const ids = button.dataset.addMealCombo.split(",").filter(Boolean);
      const meals = ids.map((id) => (state.savedMeals || []).find((item) => item.id === id)).filter(Boolean);
      if (!meals.length) return;
      meals.forEach(addMealToToday);
      save(); render(); setView("today");
    }
    if (button.dataset.applyMealPlan) {
      const plan = (state.mealPlans || []).find((item) => item.id === button.dataset.applyMealPlan);
      if (!plan) return;
      (plan.meals || []).forEach(addMealToToday);
      save(); render(); setView("today");
    }
    if (button.dataset.deleteMealPlan) {
      state.mealPlans = (state.mealPlans || []).filter((plan) => plan.id !== button.dataset.deleteMealPlan);
      save(); render();
    }
    if (button.dataset.saveMealDate && button.dataset.saveMealId) {
      const meal = (state.meals[button.dataset.saveMealDate] || []).find((item) => item.id === button.dataset.saveMealId);
      if (!meal) return;
      saveMealToLibrary(meal);
      save(); render();
    }
    if (button.dataset.deleteSavedMeal) {
      state.savedMeals = (state.savedMeals || []).filter((meal) => meal.id !== button.dataset.deleteSavedMeal);
      save(); render();
    }
    if (button.dataset.deleteTodayMeal) {
      const key = todayKey();
      state.meals[key] = (state.meals[key] || []).filter((meal) => meal.id !== button.dataset.deleteTodayMeal);
      if (!state.meals[key].length) delete state.meals[key];
      save(); render();
    }
    if (button.dataset.historyWeek) {
      const current = parseDay(historySelectedDate()) || new Date();
      state.settings.historyDate = dayKey(addDays(current, Number(button.dataset.historyWeek) * 7));
      save(); renderHistory();
    }
    if (button.dataset.historyDay) {
      state.settings.historyDate = button.dataset.historyDay;
      save(); renderHistory();
    }
    if (button.dataset.historyToday !== undefined) {
      state.settings.historyDate = todayKey();
      save(); renderHistory();
    }
    if (button.dataset.checkinAdd) {
      const key = todayKey();
      const c = state.dailyCheckin[key] || {};
      c[button.dataset.checkinAdd] = num(c[button.dataset.checkinAdd]) + num(button.dataset.amount);
      state.dailyCheckin[key] = c;
      save(); render();
    }
    if (button.dataset.logDose) {
      const cycle = (state.peptideCycles || []).find((item) => item.id === button.dataset.logDose);
      const timing = button.dataset.doseTiming || "morning";
      if (!cycle || doseAlreadyLogged(cycle.id, timing)) return;
      const log = doseLogFromCycle(cycle, timing);
      state.peptideLogs = [log, ...(state.peptideLogs || [])];
      save(); renderPeptides(); renderToday();
    }
    if (button.dataset.addSet) {
      const card = button.closest(".exercise-log");
      const draft = ensureDraft(selectedSplit());
      const log = draft.exerciseLogs.find((entry) => entry.exerciseId === button.dataset.addSet);
      if (!card || !log) return;
      const reps = num(card.querySelector('input[name="reps"]').value);
      const weightKg = rawNum(card.querySelector('input[name="weightKg"]').value);
      if (!reps && !weightKg) return;
      const selectedTarget = getTarget(log.targets || [], card.querySelector('select[name="targetId"]')?.value || "");
      log.sets = [...(log.sets || []), { id: uid(), reps, weightKg, targetId: selectedTarget?.id || "", targetLabel: selectedTarget?.label || "Working set", targetDetails: selectedTarget?.details || "", createdAt: Date.now() }];
      openExerciseCards.add(String(log.exerciseId));
      save(); renderWorkoutEditor();
    }
    if (button.dataset.deleteSet) {
      const draft = ensureDraft(selectedSplit());
      const log = draft.exerciseLogs.find((entry) => entry.exerciseId === button.dataset.exerciseId);
      if (log) log.sets = (log.sets || []).filter((set) => set.id !== button.dataset.deleteSet);
      if (log) openExerciseCards.add(String(log.exerciseId));
      save(); renderWorkoutEditor();
    }
    if (button.dataset.cycleDay !== undefined) {
      const day = button.dataset.cycleDay;
      const options = ["rest", ...templateKeys()];
      const current = state.weeklyPlan.assignments[day] || "rest";
      const nextAssign = options[(Math.max(0, options.indexOf(current)) + 1) % options.length];
      state.weeklyPlan.assignments[day] = nextAssign;
      if (nextAssign !== "rest") {
        state.settings.selectedSplit = nextAssign;
        state.settings.selectedSplitDate = todayKey();
      }
      save(); render();
    }
    if (button.id === "apply-plan") {
      if (confirm("Apply the full Julius Trainer training plan? This replaces planner splits but keeps logged history.")) { applyPlan(); save(); render(); }
    }
    if (button.id === "add-split") {
      const title = $("#new-split-name").value.trim() || `Custom ${templateKeys().length + 1}`;
      const next = Math.max(8, ...templateKeys().map((key) => Number((key.match(/^day(\d+)$/) || [])[1] || 0))) + 1;
      state.workoutTemplates[`day${next}`] = { title, exercises: [] };
      $("#new-split-name").value = "";
      save(); render();
    }
    if (button.dataset.addExercise) {
      const key = button.dataset.addExercise;
      const input = button.closest(".split-card")?.querySelector("[data-new-exercise]");
      const name = input?.value.trim();
      if (!name) return;
      state.workoutTemplates[key].exercises.push({ id: `ex-${Date.now()}-${slug(name)}`, name, notes: "", targets: [] });
      input.value = "";
      save(); render();
    }
    if (button.dataset.deleteExercise) {
      const key = button.dataset.deleteExercise;
      state.workoutTemplates[key].exercises = state.workoutTemplates[key].exercises.filter((exercise) => exercise.id !== button.dataset.exerciseId);
      save(); render();
    }
    if (button.dataset.deleteSplit) {
      const key = button.dataset.deleteSplit;
      if (!confirm(`Delete ${splitTitle(key)}? Existing workout history stays saved.`)) return;
      delete state.workoutTemplates[key];
      for (const day of Object.keys(state.weeklyPlan.assignments)) if (state.weeklyPlan.assignments[day] === key) state.weeklyPlan.assignments[day] = "rest";
      save(); render();
    }
    if (button.dataset.history) { state.settings.historyType = button.dataset.history; save(); renderHistory(); }
    if (button.dataset.deleteCycle) {
      if (!confirm("Delete this peptide cycle? Existing dosage history stays saved.")) return;
      state.peptideCycles = (state.peptideCycles || []).filter((cycle) => cycle.id !== button.dataset.deleteCycle);
      save(); renderPeptides(); renderToday();
    }
    if (button.dataset.deleteDose) {
      state.peptideLogs = (state.peptideLogs || []).filter((log) => log.id !== button.dataset.deleteDose);
      save(); renderPeptides(); renderToday();
    }
    if (button.dataset.deleteWorkoutDate) {
      const date = button.dataset.deleteWorkoutDate;
      state.workouts[date] = (state.workouts[date] || []).filter((workout) => workout.id !== button.dataset.deleteWorkoutId);
      save(); render();
    }
    if (button.dataset.deleteWeight) { state.bodyMetrics = state.bodyMetrics.filter((m) => m.id !== button.dataset.deleteWeight); save(); render(); }
    if (button.dataset.deleteProgress) { state.progressCheckins = (state.progressCheckins || []).filter((entry) => entry.id !== button.dataset.deleteProgress); save(); render(); }
  });
  document.addEventListener("input", (event) => {
    const el = event.target;
    if (el.dataset?.splitTitle) state.workoutTemplates[el.dataset.splitTitle].title = el.value;
    if (el.dataset?.exerciseName) {
      const exercise = state.workoutTemplates[el.dataset.exerciseName]?.exercises.find((item) => item.id === el.dataset.exerciseId);
      if (exercise) {
        exercise.name = el.value;
        exercise.targets = deriveTargets(exercise.name, exercise.notes || "");
      }
    }
    if (el.dataset?.exerciseNotes) {
      const exercise = state.workoutTemplates[el.dataset.exerciseNotes]?.exercises.find((item) => item.id === el.dataset.exerciseId);
      if (exercise) {
        exercise.notes = el.value;
        exercise.targets = deriveTargets(exercise.name, exercise.notes);
      }
    }
    if (el.dataset?.splitTitle || el.dataset?.exerciseName || el.dataset?.exerciseNotes) save();
    if (el.closest?.("#reconstitution-form")) renderReconstitution();
    if (el.closest?.("#peptide-cycle-form") && el.name === "vialMg") syncFixedDiluent($("#peptide-cycle-form"));
    if (el.id === "cycle-start" || el.id === "cycle-weeks") {
      const f = $("#peptide-cycle-form");
      if (f.elements.weeks.value !== "custom") f.elements.endDate.value = cycleEndDate(f.elements.startDate.value, f.elements.weeks.value);
    }
  });
  document.addEventListener("toggle", (event) => {
    const card = event.target.closest?.(".exercise-log");
    if (!card) return;
    const id = String(card.dataset.exerciseId || "");
    if (!id) return;
    if (card.open) openExerciseCards.add(id);
    else openExerciseCards.delete(id);
  }, true);
  document.addEventListener("change", (event) => {
    const el = event.target;
    if (el.dataset?.splitTitle || el.dataset?.exerciseName || el.dataset?.exerciseNotes) render();
    if (el.id === "cycle-peptide") applyCompoundDefaults($("#peptide-cycle-form"), el.value, true);
    if (el.id === "calc-peptide") { applyCompoundDefaults($("#reconstitution-form"), el.value, true); renderReconstitution(); }
    if (el.id === "log-peptide") {
      const compound = compoundById(el.value);
      const f = $("#peptide-log-form");
      if (!f.elements.doseMg.value) f.elements.doseMg.value = "";
      f.elements.notes.placeholder = compound.type === "oil" ? "Optional" : "Optional";
    }
    if (el.id === "cycle-start" || el.id === "cycle-weeks") {
      const f = $("#peptide-cycle-form");
      if (f.elements.weeks.value !== "custom") f.elements.endDate.value = cycleEndDate(f.elements.startDate.value, f.elements.weeks.value);
    }
  });
  $("#checkin-form").addEventListener("input", (event) => {
    const f = event.currentTarget;
    state.dailyCheckin[todayKey()] = { waterMl: num(f.elements.waterMl.value), stepCount: num(f.elements.stepCount.value), sleepHours: f.elements.sleepHours.value, energyLevel: f.elements.energyLevel.value };
    save(); renderToday();
  });
  $("#meal-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const f = event.currentTarget;
    const meal = { id: uid(), name: f.elements.name.value.trim() || "Meal", calories: num(f.elements.calories.value), protein: num(f.elements.protein.value), carbs: num(f.elements.carbs.value), fat: num(f.elements.fat.value), createdAt: Date.now() };
    const key = todayKey();
    state.meals[key] = [meal, ...todayMeals()];
    if (f.elements.saveMeal.checked) saveMealToLibrary(meal);
    f.reset();
    f.elements.saveMeal.checked = true;
    save(); render(); setView("today");
  });
  $("#macro-target-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const f = event.currentTarget;
    state.macroTargets = normalizeMacroTargets({
      calories: f.elements.calories.value,
      protein: f.elements.protein.value,
      carbs: f.elements.carbs.value,
      fat: f.elements.fat.value,
    });
    save(); render(); setView("today");
  });
  $("#meal-plan-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const f = event.currentTarget;
    const ids = $$('input[name="mealPlanMeal"]:checked').map((input) => input.value);
    const meals = ids.map((id) => (state.savedMeals || []).find((meal) => meal.id === id)).filter(Boolean).map((meal) => ({ ...meal, id: uid(), createdAt: Date.now() }));
    if (!meals.length) { alert("Tick at least one saved meal for this plan."); return; }
    const plan = normalizeMealPlan({ id: uid(), name: f.elements.name.value.trim() || "Meal plan", meals, createdAt: Date.now() });
    state.mealPlans = [plan, ...(state.mealPlans || []).filter((item) => item.name.toLowerCase() !== plan.name.toLowerCase())];
    f.reset();
    save(); renderPlanner();
  });
  $("#split-select").addEventListener("change", (event) => { state.settings.selectedSplit = event.currentTarget.value; state.settings.selectedSplitDate = todayKey(); save(); renderLog(); });
  $("#workout-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const f = event.currentTarget;
    const split = f.elements.split.value;
    const draft = ensureDraft(split);
    const exerciseLogs = (draft.exerciseLogs || []).map((log) => ({ ...log, sets: (log.sets || []).filter((set) => num(set.reps) || rawNum(set.weightKg)) })).filter((log) => log.sets.length);
    if (!exerciseLogs.length) { alert("Add at least one set before saving this workout."); return; }
    const minutes = num(f.elements.minutes.value || 45);
    const session = { id: uid(), name: splitTitle(split), type: "strength", split, planTitle: splitTitle(split), exerciseLogs, durationMin: minutes, caloriesBurned: num(f.elements.calories.value || estimateCalories(minutes)), createdAt: Date.now() };
    const key = todayKey();
    state.workouts[key] = [session, ...todayWorkouts()];
    delete state.workoutDrafts[`${key}:${split}`];
    f.elements.minutes.value = 45;
    f.elements.calories.value = "";
    save(); render(); setView("today");
  });
  $("#peptide-cycle-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const f = event.currentTarget;
    const days = $$('input[name="cycleDays"]:checked').map((input) => Number(input.value));
    const timings = $$('input[name="cycleTimes"]:checked').map((input) => input.value);
    if (!days.length) { alert("Select at least one dosage day."); return; }
    if (!timings.length) { alert("Select at least one reminder time."); return; }
    const startDate = f.elements.startDate.value || todayKey();
    const weeks = f.elements.weeks.value;
    const endDate = weeks === "custom" ? f.elements.endDate.value : cycleEndDate(startDate, weeks);
    const cycle = normalizeCycle({
      id: uid(),
      peptideId: f.elements.peptideId.value,
      startDate,
      endDate,
      weeks,
      doseMg: f.elements.doseMg.value,
      vialMg: f.elements.vialMg.value,
      diluentMl: f.elements.diluentMl.value,
      days,
      timings,
      createdAt: Date.now(),
    });
    if (!cycle || !cycle.doseMg) { alert("Add the dose in mg before saving the cycle."); return; }
    state.peptideCycles = [cycle, ...(state.peptideCycles || [])];
    f.reset();
    save(); renderPeptides(); renderToday();
  });
  $("#peptide-log-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const f = event.currentTarget;
    const compound = compoundById(f.elements.peptideId.value);
    const calc = calculateDraw(compound.id, compound.vialMg, compound.diluentMl, f.elements.doseMg.value);
    const log = normalizeDoseLog({
      id: uid(),
      peptideId: compound.id,
      peptideName: compound.name,
      date: f.elements.date.value || todayKey(),
      timing: f.elements.timing.value,
      doseMg: f.elements.doseMg.value,
      vialMg: compound.vialMg,
      diluentMl: compound.diluentMl,
      concentrationMgMl: calc.ok ? calc.concentrationMgMl : 0,
      drawMl: calc.ok ? calc.drawMl : 0,
      drawUnits: calc.ok ? calc.drawUnits : 0,
      componentDoses: calc.ok ? calc.componentDoses : [],
      notes: f.elements.notes.value,
      createdAt: Date.now(),
    });
    if (!log || !log.doseMg) { alert("Add the dose in mg before saving the log."); return; }
    state.peptideLogs = [log, ...(state.peptideLogs || [])];
    f.reset();
    save(); renderPeptides(); renderToday();
  });
  $("#weight-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const f = event.currentTarget;
    state.bodyMetrics = [{ id: uid(), weightKg: rawNum(f.elements.weightKg.value), fatPercent: f.elements.fatPercent.value, createdAt: Date.now() }, ...state.bodyMetrics];
    f.reset();
    save(); render();
  });
  $("#progress-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const f = event.currentTarget;
    const date = f.elements.date.value || todayKey();
    const createdAt = parseDay(date)?.getTime?.() || Date.now();
    let photoDataUrl = "";
    try { photoDataUrl = await imageFileToDataUrl(f.elements.photo.files?.[0]); } catch { photoDataUrl = ""; }
    const entry = normalizeProgressCheckin({
      id: uid(),
      date,
      weightKg: f.elements.weightKg.value,
      waistCm: f.elements.waistCm.value,
      mood: f.elements.mood.value,
      notes: f.elements.notes.value,
      photoDataUrl,
      createdAt: Date.now(),
    });
    if (!entry.weightKg && !entry.waistCm && !entry.mood && !entry.notes && !entry.photoDataUrl) { alert("Add at least one check-in detail."); return; }
    state.progressCheckins = [entry, ...(state.progressCheckins || [])];
    if (entry.weightKg) state.bodyMetrics = [{ id: uid(), weightKg: entry.weightKg, fatPercent: "", createdAt }, ...state.bodyMetrics];
    state.settings.historyDate = date;
    f.reset();
    f.elements.date.value = todayKey();
    save(); render();
  });
  $("#backup-button").addEventListener("click", exportBackup);
  $("#backup-now").addEventListener("click", exportBackup);
  $("#weekly-report-button").addEventListener("click", exportWeeklyReport);
  $("#import-button").addEventListener("click", () => $("#import-file").click());
  $("#import-paste-button").addEventListener("click", async () => {
    try {
      await importText($("#import-json-text").value);
      $("#import-json-text").value = "";
    } catch (err) {
      alert(err?.message || "Import failed.");
    }
  });
  $("#import-file").addEventListener("change", async (event) => {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    try { await importFile(file); } catch (err) { alert(err?.message || "Import failed."); } finally { event.currentTarget.value = ""; }
  });
}
function setView(view) {
  $$(".view").forEach((el) => el.classList.toggle("active", el.id === `view-${view}`));
  $$(".tabbar [data-view]").forEach((button) => button.classList.toggle("active", button.dataset.view === view));
  renderHeader();
}

load().then(() => { bind(); render(); save(); });
