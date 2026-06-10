"use strict";

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
const DEFAULT_COMPOUNDS = [
  { id: "retatrutide", name: "Retatrutide", type: "peptide", vialMg: 10, diluentMl: 2, info: "Use the vial label and your prescribed dose. Calculator defaults use a 10mg vial and 2ml diluent." },
  { id: "tesamorelin", name: "Tesamorelin", type: "peptide", vialMg: "", diluentMl: 2, info: "Enter the vial strength from your label and the dose from your protocol." },
  { id: "mots-c", name: "MOTS-c", type: "peptide", vialMg: "", diluentMl: 3, info: "Calculator supports larger diluent volumes if you prefer an easier syringe draw." },
  { id: "nad", name: "NAD+", type: "peptide", vialMg: 500, diluentMl: 5, info: "Calculator defaults use a 500mg vial and 5ml diluent from the attached formula." },
  {
    id: "glow-stack",
    name: "Glow Stack",
    type: "peptide",
    vialMg: 70,
    diluentMl: 5,
    info: "Combined stack total is 70mg. Component breakdown is calculated by vial ratio.",
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
let state = defaults();

function ex(name, notes, targets = []) {
  return { id: `ex-${slug(name)}`, name, notes, targets: targets.length ? expandStoredTargets(targets) : deriveTargets(name, notes) };
}
function defaults() {
  return {
    meals: {},
    workouts: {},
    bodyMetrics: [],
    dailyCheckin: {},
    peptideCycles: [],
    peptideLogs: [],
    weeklyPlan: { assignments: { ...DEFAULT_WEEKLY_ASSIGNMENTS }, doseDays: [] },
    workoutTemplates: clone(DEFAULT_TEMPLATES),
    workoutDrafts: {},
    settings: { activeView: "today", selectedSplit: "", historyType: "meals", trainingPlanVersion: TRAINING_PLAN_VERSION },
    createdAt: Date.now(),
  };
}
function merge(raw) {
  const base = defaults();
  const next = { ...base, ...(raw || {}) };
  next.meals = raw?.meals || base.meals;
  next.workouts = raw?.workouts || base.workouts;
  next.bodyMetrics = Array.isArray(raw?.bodyMetrics) ? raw.bodyMetrics : Array.isArray(raw?.body) ? raw.body : base.bodyMetrics;
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
function selectedSplit() {
  const selected = state.settings.selectedSplit;
  if (selected && selected !== "rest") return selected;
  const today = state.weeklyPlan.assignments[weekdayIndex()] || "day1";
  return today === "rest" ? "day1" : today;
}
function weekdayIndex(date = new Date()) {
  const d = date.getDay();
  return d === 0 ? 6 : d - 1;
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
function calculateDraw(peptideId, vialMg, diluentMl, doseMg, preferredUnits = 0) {
  const compound = compoundById(peptideId);
  const dose = rawNum(doseMg);
  const strength = rawNum(vialMg || compound.vialMg);
  const diluent = rawNum(diluentMl || compound.diluentMl);
  if (!dose || !strength) return { ok: false, message: "Enter dose mg and vial strength to calculate." };
  if (compound.type === "oil") {
    const drawMl = dose / strength;
    return { ok: true, type: "oil", concentrationMgMl: strength, drawMl, drawUnits: drawMl * 100, message: `${fmtDose(drawMl)} ml based on ${fmtDose(strength)} mg/ml.` };
  }
  if (!diluent) return { ok: false, message: "Enter diluent ml to calculate." };
  const concentrationMgMl = strength / diluent;
  const drawMl = dose / concentrationMgMl;
  const drawUnits = drawMl * 100;
  const preferredMl = rawNum(preferredUnits) / 100;
  const idealDiluentMl = preferredMl && dose ? (strength * preferredMl) / dose : 0;
  const componentDoses = Array.isArray(compound.components) && compound.components.length
    ? compound.components.map((component) => ({ name: component.name, mg: dose * (rawNum(component.mg) / compound.components.reduce((sum, item) => sum + rawNum(item.mg), 0)) }))
    : [];
  return { ok: true, type: "peptide", concentrationMgMl, drawMl, drawUnits, idealDiluentMl, componentDoses, lowUnitWarning: drawUnits > 0 && drawUnits < 5 };
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
  $("#screen-title").textContent = active?.dataset.title || "AkyFit";
}
function renderToday() {
  const assign = state.weeklyPlan.assignments[weekdayIndex()] || "rest";
  const template = state.workoutTemplates[assign];
  const exercises = template?.exercises || [];
  $("#today-split").textContent = splitTitle(assign);
  $("#today-detail").textContent = assign === "rest" ? "Rest day" : `${exercises.length} exercises planned`;
  $("#today-exercises").innerHTML = exercises.length ? `<ul>${exercises.map((exercise) => `<li><strong>${escapeHtml(exercise.name)}</strong>${guidanceHtml(exercise.notes)}${targetDetailsHtml(exercise.targets)}</li>`).join("")}</ul>${trainingTermsHtml()}` : `<div class="empty">Rest and recover.</div>`;
  const mealTotal = totals();
  $("#meal-count").textContent = `${todayMeals().length} meals`;
  $("#meal-total").textContent = `${fmt(mealTotal.calories)} kcal`;
  $("#workout-count").textContent = `${todayWorkouts().length} workouts`;
  $("#workout-total").textContent = `${fmt(burned())} kcal burned`;
  renderTodayPeptideReminders();
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
  select.innerHTML = options.map((key) => `<option value="${escapeHtml(key)}">${escapeHtml(splitTitle(key))}</option>`).join("");
  select.value = options.includes(selectedSplit()) ? selectedSplit() : options[0];
  state.settings.selectedSplit = select.value;
  renderWorkoutEditor();
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
function renderPlanner() {
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
function renderPeptides() {
  if (!$("#cycle-peptide")) return;
  hydratePeptideControls();
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
  const selectedCalc = calcSelect.value || selectedCycle;
  const selectedLog = logSelect.value || selectedCycle;
  cycleSelect.innerHTML = compoundOptionsHtml(selectedCycle);
  calcSelect.innerHTML = compoundOptionsHtml(selectedCalc);
  logSelect.innerHTML = compoundOptionsHtml(selectedLog);
  cycleSelect.value = selectedCycle;
  calcSelect.value = selectedCalc;
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
  if ("diluentMl" in form.elements && (overwrite || !form.elements.diluentMl.value)) form.elements.diluentMl.value = compound.diluentMl || "";
  if ("doseMg" in form.elements && overwrite) form.elements.doseMg.value = "";
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
    const meta = compound.type === "oil"
      ? `Concentration from vial label`
      : `${compound.vialMg ? `${fmtDose(compound.vialMg)}mg vial` : "Enter vial mg"}${compound.diluentMl ? ` / ${fmtDose(compound.diluentMl)}ml diluent` : ""}`;
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
  const result = calculateDraw(peptideId, form.elements.vialMg.value, form.elements.diluentMl.value, form.elements.doseMg.value, form.elements.preferredUnits.value);
  resultEl.classList.toggle("warning", !!result.lowUnitWarning);
  if (!result.ok) {
    resultEl.innerHTML = `<strong>${escapeHtml(compoundName(peptideId))}</strong><small>${escapeHtml(result.message)}</small>`;
    return;
  }
  const componentHtml = result.componentDoses?.length ? `<ul class="component-list">${result.componentDoses.map((item) => `<li>${escapeHtml(item.name)}: ${fmtDose(item.mg)}mg in this draw</li>`).join("")}</ul>` : "";
  const preferred = result.idealDiluentMl ? `<span class="pill">Ideal diluent for preferred draw: ${fmtDose(result.idealDiluentMl)}ml</span>` : "";
  const units = result.type === "peptide" ? `<span class="pill">${fmt(result.drawUnits)} U-100 units</span>` : "";
  const warning = result.lowUnitWarning ? `<small>Consider increasing diluent if your protocol allows it; this draw is under 5 units.</small>` : "";
  resultEl.innerHTML = `<strong>${escapeHtml(compoundName(peptideId))}</strong>
    <div class="dose-meta">
      <span class="pill">${fmtDose(result.concentrationMgMl)} mg/ml</span>
      <span class="pill">${fmtDose(result.drawMl)} ml draw</span>
      ${units}
      ${preferred}
    </div>
    ${componentHtml}
    ${warning}`;
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
  const type = state.settings.historyType || "meals";
  $$(".tabs [data-history]").forEach((button) => button.classList.toggle("active", button.dataset.history === type));
  if (type === "meals") return renderMealHistory();
  if (type === "workouts") return renderWorkoutHistory();
  renderWeightHistory();
}
function renderMealHistory() {
  const days = Object.entries(state.meals || {}).filter(([, meals]) => meals?.length).sort(([a], [b]) => b.localeCompare(a));
  $("#history-list").innerHTML = days.length ? days.map(([date, meals]) => {
    const t = totals(meals);
    return `<div class="history-card"><div class="history-head"><div><strong>${dateLabel(date)}</strong><small>${meals.length} meals / ${fmt(t.calories)} kcal / ${fmt(t.protein)}p</small></div></div><ul>${meals.map((m) => `<li><strong>${escapeHtml(m.name)}</strong><span>${fmt(m.calories)} kcal / ${fmt(m.protein)}p / ${fmt(m.carbs)}c / ${fmt(m.fat)}f</span></li>`).join("")}</ul></div>`;
  }).join("") : `<div class="empty">No meal history yet.</div>`;
}
function renderWorkoutHistory() {
  const sessions = allWorkoutSessions();
  $("#history-list").innerHTML = sessions.length ? sessions.map((workout) => {
    const logs = (workout.exerciseLogs || []).filter((log) => log.sets?.length);
    return `<div class="history-card"><div class="history-head"><div><strong>${escapeHtml(workout.name || workout.planTitle || "Workout")}</strong><small>${dateLabel(workout.date)} / ${fmt(workout.durationMin || 0)} min / ${fmt(workout.caloriesBurned || 0)} kcal</small></div><button class="danger-button" data-delete-workout-date="${escapeHtml(workout.date)}" data-delete-workout-id="${escapeHtml(workout.id)}" type="button">Delete</button></div>${logs.length ? `<ul>${logs.map((log) => `<li><strong>${escapeHtml(log.name)}</strong><span>${escapeHtml(setSummary(log.sets))}</span>${guidanceHtml(log.notes)}${targetDetailsHtml(log.targets)}</li>`).join("")}</ul>` : `<div class="empty">No set detail saved.</div>`}</div>`;
  }).join("") : `<div class="empty">No workout history yet.</div>`;
}
function renderWeightHistory() {
  const entries = [...(state.bodyMetrics || [])].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  $("#history-list").innerHTML = entries.length ? entries.map((m) => `<div class="history-card"><div class="history-head"><div><strong>${new Date(m.createdAt).toLocaleDateString()}</strong><small>${fmtWeight(m.weightKg || m.weight)} kg${m.fatPercent ? ` / ${m.fatPercent}% fat` : ""}</small></div><button class="danger-button" data-delete-weight="${escapeHtml(m.id)}" type="button">Delete</button></div></div>`).join("") : `<div class="empty">No weight history yet.</div>`;
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
    workoutSessions: allWorkoutSessions().length,
    peptideCycles: state.peptideCycles.length,
    peptideDoseLogs: state.peptideLogs.length,
    weightEntries: state.bodyMetrics.length,
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
  state.settings.selectedSplit = selectedSplit();
}
function exportBackup() {
  const blob = new Blob([JSON.stringify({ version: 3, appName: "AkyFit", exportedAt: Date.now(), data: state }, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `akyfit-backup-${todayKey()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
async function importFile(file) {
  const raw = JSON.parse(await file.text());
  const data = raw?.appName === "AkyFit" && raw.data ? raw.data : raw?.data || raw;
  if (!confirm("Import this backup? It replaces the website data on this device.")) return;
  state = merge(data);
  save();
  render();
}

function bind() {
  document.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    if (button.dataset.view) setView(button.dataset.view);
    if (button.dataset.logToday !== undefined) { state.settings.selectedSplit = selectedSplit(); setView("log"); render(); }
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
      state.weeklyPlan.assignments[day] = options[(Math.max(0, options.indexOf(current)) + 1) % options.length];
      save(); render();
    }
    if (button.id === "apply-plan") {
      if (confirm("Apply the full Aky training plan? This replaces planner splits but keeps logged history.")) { applyPlan(); save(); render(); }
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
    f.reset();
    save(); render(); setView("today");
  });
  $("#split-select").addEventListener("change", (event) => { state.settings.selectedSplit = event.currentTarget.value; save(); renderLog(); });
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
  $("#backup-button").addEventListener("click", exportBackup);
  $("#backup-now").addEventListener("click", exportBackup);
  $("#import-button").addEventListener("click", () => $("#import-file").click());
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
