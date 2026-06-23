"use strict";

const APP_NAME = "Just.Train";
const BACKUP_PREFIX = "just-train";
const BACKUP_APP_NAMES = new Set([APP_NAME, "AkyFit"]);
const STORE_KEY = "akyfit.website.shadow.v2";
const IDB_NAME = "akyfit.website.v2";
const IDB_STORE = "state";
const IDB_KEY = "main";
const SUPABASE_URL = "https://cylvclmnpzsdiqsneuoj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_eVDJFuMUWYgVgXGc9dVjMw_H5uB-NGC";
const CLOUD_TABLE = "user_app_state";
const CLOUD_PROFILE_TABLE = "user_profiles";
const CLOUD_SESSION_KEY = "just.train.cloud.session.v1";
const LEGACY_CLOUD_SESSION_KEY = ["julius", "trainer", "cloud", "session", "v1"].join(".");
const WELCOME_SEEN_PREFIX = "just.train.welcome.seen.";

const TRAINING_PLAN_VERSION = "aky-training-plan-targets-v8-motra-log-rename";
const TOP_DROPDOWN_LIMIT = 4;
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
const MOTRA_EXERCISE_NAMES = [
  "Machine Incline Chest Press", "Machine Chest Press", "Machine Decline Chest Press", "Pec Deck Fly", "Seated Chest Press", "Hammer Strength Incline Press", "Hammer Strength Chest Press", "Plate-Loaded Chest Press", "Single Arm Chest Press Machine",
  "Flat Bench Press", "Incline Bench Press", "Decline Bench Press", "Close Grip Bench Press", "Reverse Grip Bench Press", "Guillotine Press",
  "Flat Dumbbell Press", "Incline Dumbbell Press", "Decline Dumbbell Press", "Dumbbell Fly", "Incline Dumbbell Fly", "Dumbbell Pullover", "Squeeze Press",
  "Push Up", "Incline Push Up", "Decline Push Up", "Wide Grip Push Up", "Diamond Push Up", "Chest Dips",
  "Lat Pulldown", "Close Grip Lat Pulldown", "Seated Cable Row", "Chest Supported Row", "Iso-Lateral Row", "Machine High Row", "Assisted Pull Up", "Assisted Chin Up",
  "Bent Over Row", "Pendlay Row", "T-Bar Row", "Deadlift", "Rack Pull",
  "Single Arm Row", "Chest Supported Dumbbell Row", "Renegade Row",
  "Pull Up", "Chin Up", "Neutral Grip Pull Up", "Inverted Row",
  "Machine Shoulder Press", "Machine Lateral Raise", "Reverse Pec Deck", "Smith Machine Shoulder Press",
  "Shoulder Press", "Arnold Press", "Lateral Raise", "Front Raise", "Rear Delt Fly", "Upright Row", "Cuban Press",
  "Overhead Press", "Push Press", "Behind Neck Press",
  "Bicep Curl Machine", "Preacher Curl Machine", "Cable Curl", "Rope Hammer Curl", "Bayesian Curl", "High Cable Curl",
  "Alternating Curl", "Hammer Curl", "Incline Curl", "Concentration Curl", "Zottman Curl", "Spider Curl",
  "Barbell Curl", "EZ Bar Curl", "Drag Curl", "Preacher Curl",
  "Tricep Dip Machine", "Assisted Dip Machine", "Rope Pushdown", "Straight Bar Pushdown", "Overhead Rope Extension", "Single Arm Pushdown",
  "Overhead Extension", "Skull Crusher", "Kickback", "Tate Press", "JM Press", "Lying Tricep Extension",
  "Bench Dips", "Parallel Bar Dips", "Diamond Push Ups",
  "Leg Press", "Hack Squat", "Leg Extension", "Pendulum Squat", "Belt Squat", "Smith Machine Squat",
  "Back Squat", "Front Squat", "Zercher Squat", "Box Squat",
  "Goblet Squat", "Bulgarian Split Squat", "Walking Lunge", "Step Up",
  "Seated Leg Curl", "Lying Leg Curl", "Standing Leg Curl", "Nordic Curl Machine",
  "Romanian Deadlift", "Stiff Leg Deadlift", "Good Morning",
  "Single Leg RDL", "Nordic Curl", "Glute Ham Raise",
  "Hip Thrust Machine", "Glute Kickback Machine", "Abductor Machine", "Adductor Machine", "Smith Machine Hip Thrust",
  "Barbell Hip Thrust", "Sumo Deadlift", "Walking Lunges", "Step Ups",
  "Cable Kickback", "Cable Pull Through",
  "Standing Calf Raise", "Seated Calf Raise", "Leg Press Calf Raise", "Donkey Calf Raise", "Single Leg Calf Raise",
  "Ab Crunch Machine", "Rotary Torso Machine", "Cable Crunch", "Woodchopper", "Pallof Press",
  "Crunch", "Sit Up", "Leg Raise", "Hanging Leg Raise", "Reverse Crunch", "Plank", "Side Plank", "Bicycle Crunch", "Mountain Climber", "Russian Twist", "V-Up", "Hollow Hold", "Dead Bug", "Flutter Kicks",
  "Wrist Curl", "Reverse Wrist Curl", "Farmer's Walk", "Wrist Roller", "Plate Pinch Hold", "Reverse Curl",
  "Clean", "Power Clean", "Clean & Press", "Snatch", "Thruster", "Kettlebell Swing", "Burpee", "Turkish Get Up",
  "Dumbbell Bicep Curl", "Smith Machine Shrug", "Cable Bar Straight Arm Pull Down", "Cable Face Pull",
];
const MOTRA_EXERCISE_ALIASES = [
  ["Machine Incline Chest Press", "Machine Incline Bench Press", "Prime incline press", "High incline smith press", "High incline smith machine press", "Hammer Strength Incline Press", "Incline machine press"],
  ["Machine Chest Press", "Machine Hammer-Grip Seated Chest Press", "Flex leverage press", "Prime flat machine chest press", "Seated Chest Press", "Hammer Strength Chest Press", "Plate-Loaded Chest Press", "Flat machine chest press"],
  ["Machine Decline Chest Press", "Decline machine chest press"],
  ["Pec Deck Fly", "Machine Fly (Pec Dec)", "Pec deck", "Pec dec", "Machine fly", "Machine pec fly"],
  ["Lat Pulldown", "Cable Lat Pull Down V-Grip (Narrow Hammer)", "Close Grip Lat Pulldown", "Single arm prone cable pulldown", "Upper back bias cable pulldown", "Cable lat pulldown", "Lat pull down"],
  ["Seated Cable Row", "Cable V-Handle Seated Row", "Single arm seated row", "Prime pin stack row", "Nautilus leverage row", "Single arm Nautilus row", "Cable row", "V-handle seated row"],
  ["T-Bar Row", "Upper back bias T-bar row", "T bar row"],
  ["Seated Leg Curl", "Seated hamstring curl"],
  ["Lying Leg Curl", "Lying hamstring curl"],
  ["Reverse Pec Deck", "Machine Rear Delt (Reverse) Fly", "Reverse pec dec", "Rear delt machine"],
  ["Lateral Raise", "Dumbbell Lateral Raise", "Dumbbell side lateral", "Single arm cuffed lateral", "Side lateral raise"],
  ["Machine Lateral Raise", "Lateral raise machine"],
  ["Machine Shoulder Press", "Shoulder press machine"],
  ["Smith Machine Shoulder Press", "Dead stop smith machine shoulder press"],
  ["Overhead Press", "Barbell Overhead Press / Military Press", "Barbell overhead press", "Military press"],
  ["Skull Crusher", "EZ-Bar Skull Crusher", "EZ bar incline skull crusher", "EZ bar skull crusher", "Incline skull crusher"],
  ["Dumbbell Bicep Curl", "Seated single arm dumbbell drag bicep curl", "Single arm dumbbell drag bicep curl", "DB bicep curl"],
  ["Cable Curl", "Cable Bar Bicep Curl", "Cable Rope Bicep Curl", "Bar cable bicep curl", "Rope bicep curl"],
  ["Straight Bar Pushdown", "Cable Bar Tricep Pushdown / Extension", "Cable bar tricep pushdown", "Tricep pushdown", "Straight bar tricep pushdown"],
  ["Rope Pushdown", "Cable Rope Tricep Pushdown / Extension", "Cable rope tricep pushdown", "Rope tricep pushdown"],
  ["Single Arm Pushdown", "Cable V-Bar Tricep Pushdown / Extension", "V-bar tricep pushdown"],
  ["Overhead Rope Extension", "Cable Rope Overhead Tricep Extension High", "Rope overhead tricep extension", "Overhead tricep extension"],
  ["Assisted Dip Machine", "Dip machine / assisted dips", "Dip machine", "Assisted dips"],
  ["Dumbbell Pullover", "Dumbell pullover"],
  ["Leg Press", "Cybex squat leg press", "Leg hip press"],
  ["Leg Extension", "Leg extension superset with pendulum", "Leg extension giant digressive set"],
  ["Walking Lunge", "DB walking lunges", "Dumbbell walking lunges", "Lunges"],
  ["Romanian Deadlift", "BB RDL", "DB RDL", "Barbell RDL", "Dumbbell RDL"],
  ["Single Leg RDL", "Single leg Romanian deadlift"],
  ["Hip Thrust Machine", "Glute drive / hip thrust machine", "Glute drive", "Hip thrust machine"],
  ["Adductor Machine", "Adductors", "Adductor"],
  ["Leg Press Calf Raise", "Toe press superset with standing calf raise", "Toe press", "Toe press on leg press"],
  ["Seated Calf Raise", "Seated calf machine"],
  ["Ab Crunch Machine", "Machine Ab Crunch"],
  ["Cable Bar Straight Arm Pull Down", "Rope pullover", "Cable pullover", "Straight arm pulldown", "Straight arm pull down"],
  ["Cable Face Pull", "Rear delt pulldown with D handles", "Rear delt pulldown", "Face pull"],
  ["Smith Machine Shrug", "Smith machine shrugs", "Smith machine shrug", "Machine shrug", "Barbell shrug"],
];
const MOTRA_FINAL_EXERCISE_NAMES = [
  "Leg / Hamstring Curl Seated", "Hack Squat (Facing Out)", "Machine Leg Press (Moving Chair)", "Machine Leg Extension superset with Machine Pendulum Squat", "Dumbbell Walking Lunge",
  "Machine Leg / Hamstring Curl Prone", "Machine Pendulum Squat", "Machine Leg Press", "Machine Leg Extension",
  "Machine Rear Delt (Reverse) Fly", "Machine Incline Bench Press", "Smith Machine Incline Bench Press", "Machine Tricep Press", "Machine Fly (Pec Dec)", "Machine Lateral Raise",
  "Dumbbell Lateral Raise", "Machine Seated Chest Press", "Machine Assisted Dip", "Cable Single-Arm Lateral Raise",
  "Cable Rope Straight Arm Pull Down", "Cable Lat Pull Down Single-Arm", "Cable Single-Arm Row", "Cable Lat Pull Down Wide-Grip", "Machine T-Bar Row", "Barbell Deadlift", "Cable Upright Rear Delt Fly",
  "Barbell Romanian Deadlift", "Machine Row", "Machine Wide-Grip Row", "Machine High Row (MTS Row)",
  "Leg Press Calf Raise", "Bodyweight Calf Raise", "Machine Seated Calf Raise", "Dumbbell Romanian Deadlift", "Machine Hip Adduction", "Machine Hip Thrust (Glute Bridge)",
  "Smith Machine Shoulder Press", "EZ-Bar Skull Crusher", "Dumbbell Drag Curl", "Cable Single-Arm Bicep Curl", "Bayesian Cable Curl", "Cable Rope Tricep Pushdown / Extension", "Machine Alternate Arm Curl", "Cable Single-Arm Overhead Tricep Extension Low",
];
const MOTRA_FINAL_EXERCISE_ALIASES = [
  ["Leg / Hamstring Curl Seated", "Seated leg curl", "Seated hamstring curl", "Leg / Hamstring Curl Seated"],
  ["Hack Squat (Facing Out)", "Hack squat", "Hack Squat (Facing Out)"],
  ["Machine Leg Press (Moving Chair)", "Cybex squat leg press", "Machine Leg Press (Moving Chair)"],
  ["Machine Leg Extension superset with Machine Pendulum Squat", "Leg extension superset with pendulum", "Machine Leg Extension superset with Machine Pendulum Squat"],
  ["Dumbbell Walking Lunge", "DB walking lunges", "Dumbbell walking lunges", "Lunges", "Dumbbell Walking Lunge"],
  ["Machine Leg / Hamstring Curl Prone", "Lying leg curl", "Lying hamstring curl", "Machine Leg / Hamstring Curl Prone"],
  ["Machine Pendulum Squat", "Pendulum squat", "Machine Pendulum Squat"],
  ["Machine Leg Press", "Leg hip press", "Machine Leg Press"],
  ["Machine Leg Extension", "Leg extension giant digressive set", "Machine Leg Extension"],
  ["Machine Rear Delt (Reverse) Fly", "Reverse pec deck", "Machine Rear Delt (Reverse) Fly"],
  ["Machine Incline Bench Press", "Prime incline press", "Machine Incline Bench Press"],
  ["Smith Machine Incline Bench Press", "High incline smith press", "High incline smith machine press", "Smith Machine Incline Bench Press"],
  ["Machine Tricep Press", "Flex leverage press", "Machine Tricep Press"],
  ["Machine Fly (Pec Dec)", "Pec deck", "Pec dec", "Machine Fly (Pec Dec)"],
  ["Machine Lateral Raise", "Lateral raise machine", "Machine Lateral Raise"],
  ["Dumbbell Lateral Raise", "Dumbbell side lateral", "Dumbbell Lateral Raise"],
  ["Machine Seated Chest Press", "Prime flat machine chest press", "Machine Seated Chest Press"],
  ["Machine Assisted Dip", "Dip machine / assisted dips", "Assisted dip machine", "Machine Assisted Dip"],
  ["Cable Single-Arm Lateral Raise", "Single arm cuffed lateral", "Cable Single-Arm Lateral Raise"],
  ["Cable Rope Straight Arm Pull Down", "Rope pullover", "Cable Rope Straight Arm Pull Down"],
  ["Cable Lat Pull Down Single-Arm", "Single arm prone cable pulldown", "Cable Lat Pull Down Single-Arm"],
  ["Cable Single-Arm Row", "Single arm seated row", "Cable Single-Arm Row"],
  ["Cable Lat Pull Down Wide-Grip", "Upper back bias cable pulldown", "Cable Lat Pull Down Wide-Grip"],
  ["Machine T-Bar Row", "Upper back bias T-bar row", "Machine T-Bar Row"],
  ["Barbell Deadlift", "Deadlift", "Barbell Deadlift"],
  ["Cable Upright Rear Delt Fly", "Rear delt pulldown with D handles", "Cable Upright Rear Delt Fly"],
  ["Barbell Romanian Deadlift", "BB RDL", "Barbell RDL", "Barbell Romanian Deadlift"],
  ["Machine Row", "Prime pin stack row", "Machine Row"],
  ["Machine Wide-Grip Row", "Nautilus leverage row", "Machine Wide-Grip Row"],
  ["Machine High Row (MTS Row)", "Single arm Nautilus row", "Machine High Row (MTS Row)"],
  ["Smith Machine Shrug", "Smith machine shrugs", "Smith Machine Shrug"],
  ["Leg Press Calf Raise", "Toe press superset with standing calf raise", "Toe press", "Toe press on leg press", "Leg Press Calf Raise"],
  ["Bodyweight Calf Raise", "Standing bodyweight calf raise", "Bodyweight Calf Raise"],
  ["Machine Seated Calf Raise", "Seated calf machine", "Machine Seated Calf Raise"],
  ["Dumbbell Romanian Deadlift", "DB RDL", "Dumbbell RDL", "Dumbbell Romanian Deadlift"],
  ["Machine Hip Adduction", "Adductors", "Adductor", "Machine Hip Adduction"],
  ["Machine Hip Thrust (Glute Bridge)", "Glute drive / hip thrust machine", "Glute drive", "Machine Hip Thrust (Glute Bridge)"],
  ["Smith Machine Shoulder Press", "Dead stop smith machine shoulder press", "Smith Machine Shoulder Press"],
  ["EZ-Bar Skull Crusher", "EZ bar incline skull crusher", "EZ-Bar Skull Crusher"],
  ["Dumbbell Drag Curl", "Seated single arm dumbbell drag bicep curl", "Dumbbell Drag Curl"],
  ["Cable Single-Arm Bicep Curl", "Single arm cable curl facing the stack", "Cable Single-Arm Bicep Curl"],
  ["Bayesian Cable Curl", "Single arm cable curl face away from stack", "Bayesian Cable Curl"],
  ["Cable Rope Tricep Pushdown / Extension", "Dual rope tricep push down", "Cable Rope Tricep Pushdown / Extension"],
  ["Machine Alternate Arm Curl", "Single arm Nautilus machine", "Machine Alternate Arm Curl"],
  ["Cable Single-Arm Overhead Tricep Extension Low", "Single arm cable overhead extension", "Cable Single-Arm Overhead Tricep Extension Low"],
];
const MOTRA_EXERCISE_ALIAS_MAP = Object.fromEntries([
  ...MOTRA_EXERCISE_NAMES.map((name) => [slug(name), name]),
  ...MOTRA_FINAL_EXERCISE_NAMES.map((name) => [slug(name), name]),
  ...MOTRA_EXERCISE_ALIASES.flatMap(([motraName, ...aliases]) => [motraName, ...aliases].map((name) => [slug(name), motraName])),
  ...MOTRA_FINAL_EXERCISE_ALIASES.flatMap(([motraName, ...aliases]) => [motraName, ...aliases].map((name) => [slug(name), motraName])),
]);
const EXERCISE_MATCH_GROUPS = [
  ["Leg Press", "Machine Leg Press", "Machine Leg Press (Moving Chair)"],
  ["Leg Extension", "Machine Leg Extension", "Machine Leg Extension superset with Machine Pendulum Squat"],
  ["Walking Lunge", "Dumbbell Walking Lunge"],
  ["Machine Incline Chest Press", "Machine Incline Bench Press", "Smith Machine Incline Bench Press"],
  ["Machine Chest Press", "Machine Tricep Press", "Machine Seated Chest Press"],
  ["Pec Deck Fly", "Machine Fly (Pec Dec)"],
  ["Lateral Raise", "Machine Lateral Raise", "Dumbbell Lateral Raise", "Cable Single-Arm Lateral Raise"],
  ["Cable Bar Straight Arm Pull Down", "Cable Rope Straight Arm Pull Down"],
  ["Lat Pulldown", "Cable Lat Pull Down Single-Arm", "Cable Lat Pull Down Wide-Grip"],
  ["Seated Cable Row", "Cable Single-Arm Row", "Machine Row", "Machine Wide-Grip Row", "Machine High Row (MTS Row)"],
  ["T-Bar Row", "Machine T-Bar Row"],
  ["Cable Face Pull", "Cable Upright Rear Delt Fly"],
  ["Romanian Deadlift", "Barbell Romanian Deadlift", "Dumbbell Romanian Deadlift"],
  ["Seated Calf Raise", "Machine Seated Calf Raise"],
  ["Adductor Machine", "Machine Hip Adduction"],
  ["Hip Thrust Machine", "Machine Hip Thrust (Glute Bridge)"],
  ["Skull Crusher", "EZ-Bar Skull Crusher"],
  ["Dumbbell Bicep Curl", "Dumbbell Drag Curl"],
];
const EXERCISE_MATCH_EQUIVALENTS = (() => {
  const map = new Map();
  for (const group of EXERCISE_MATCH_GROUPS) {
    const keys = group.map((name) => slug(motraExerciseName(name)));
    for (const key of keys) map.set(key, new Set([...(map.get(key) || []), ...keys]));
  }
  return map;
})();

const DEFAULT_TEMPLATES = {
  day1: { title: "Legs A", exercises: [
    ex("Leg / Hamstring Curl Seated", "8-10 with 2 sec contraction pause; 12-15 with 3 sec stretch pause; 6x4 cluster with 10-15 sec rest."),
    ex("Hack Squat (Facing Out)", "6-9; then 10-15 with 2 sec pause at the bottom."),
    ex("Machine Leg Press (Moving Chair)", "10-12; then 12-15 rest-pause: 20 sec rest to failure, then 40 sec rest to failure."),
    ex("Machine Leg Extension superset with Machine Pendulum Squat", "Leg extension 10-12 x 3 with 2 sec contraction pause; pendulum add 20kg, no lockout, 3/4 reps to failure."),
    ex("Dumbbell Walking Lunge", "Use a challenging weight that keeps balance. Full-length track lunges with 2 sec pause on each lunge."),
  ] },
  day2: { title: "Legs B", exercises: [
    ex("Machine Leg / Hamstring Curl Prone", "8-10 with 2 sec contraction pause; 12-15 with 3 sec stretch pause; 6x4 cluster with 10-15 sec rest."),
    ex("Machine Pendulum Squat", "8-10; then 4x5 cluster using a weight you could do for around 15 reps."),
    ex("Machine Leg Press", "8-10 x 2. Second set: 8-10, 45 sec rest max reps, 30 sec max reps, 15 sec max reps, 30 sec max reps, 45 sec max reps."),
    ex("Machine Leg Extension", "2 rounds: 8-10; drop 20-30% max reps with 6 sec negative; drop 20-30% max reps with 6 sec positive; drop 20-30% iso hold mid range. Rest 90-120 sec."),
    ex("Dumbbell Walking Lunge", "Use a challenging weight that keeps balance. Full-length track lunges with 2 sec pause on each lunge."),
  ] },
  day3: { title: "Push A", exercises: [
    ex("Machine Rear Delt (Reverse) Fly", "12-15 x 2; then 6x4 cluster with 10-15 sec rest."),
    ex("Machine Incline Bench Press", "8-10 x 3. Set 1 middle pin, set 2 bottom pin, set 3 top pin. Try to keep load the same."),
    ex("Smith Machine Incline Bench Press", "8-10; then 12-15 rest-pause set."),
    ex("Machine Tricep Press", "8-10; then 5x4 cluster. Tricep bias: elbows stop in line with torso, pause each rep in the hole."),
    ex("Machine Fly (Pec Dec)", "12-15 reps x 2. 1st rep 6 second hold; 2nd rep 5 second hold; 3rd rep 4 second hold; 4th rep 3 second hold; 5th rep 2 second hold; then rep out to failure, ideally between 12-15."),
    ex("Machine Lateral Raise", "3 x 12-15 with 2 sec pause on contraction each rep."),
  ] },
  day4: { title: "Push B", exercises: [
    ex("Machine Rear Delt (Reverse) Fly", "12-15 x 2; then 6x4 cluster with 10-15 sec rest."),
    ex("Dumbbell Lateral Raise", "2 sec hold at top. 10-12; 12-15; 15-20 with no pause."),
    ex("Smith Machine Incline Bench Press", "8-10; then 10-12. Use 4 sec eccentrics, deep reps, correct elbow path and posture."),
    ex("Machine Seated Chest Press", "3121 tempo with micro pause in stretch and peak contraction. 8-10; then 10-12."),
    ex("Machine Assisted Dip", "10-12 with 2 sec peak contraction and 1 sec stretch; then 12-15; then 15-20."),
    ex("Cable Single-Arm Lateral Raise", "Micro pause top and bottom. 10-12; then 12-15 rest-pause."),
  ] },
  day5: { title: "Pull A", exercises: [
    ex("Cable Rope Straight Arm Pull Down", "15-20; then 6x4 cluster set."),
    ex("Cable Lat Pull Down Single-Arm", "Lat bias. Do not let shoulder extend; stretch through full arm extension. 10-12 with 2 sec hold; then 12-15 no hold."),
    ex("Cable Single-Arm Row", "Lat bias. Turn torso slightly away from working arm. Micro pause top and bottom. 8-10; then 12-15."),
    ex("Cable Lat Pull Down Wide-Grip", "8-10; then start at same load, 6 reps, drop 1 pin, repeat until 6 drops and 36 reps total."),
    ex("Machine T-Bar Row", "Both sets hold 2 sec stretch and push chest away in stretch. 8-10; then 5x4 cluster."),
    ex("Barbell Deadlift", "10-15."),
    ex("Cable Upright Rear Delt Fly", "Cybex machine. Shoulders in front of ears, no retraction, drive elbows out and round. 10-12; then 12-15 rest-pause, both 3121 tempo."),
  ] },
  day6: { title: "Pull B", exercises: [
    ex("Cable Lat Pull Down Single-Arm", "Lat bias. 12-15 with 2 sec contraction hold; then 12-15 no hold."),
    ex("Barbell Romanian Deadlift", "4 sec eccentrics, 2 sec pause in stretch. Keep 1 rep in reserve; do not take to failure. 8-10."),
    ex("Machine Row", "8-10 with 2 sec contraction hold; then 5x4 cluster with no hold."),
    ex("Machine Wide-Grip Row", "8-10 with 2 sec contraction pause; then 12-15 with 2 sec stretch."),
    ex("Machine High Row (MTS Row)", "Lat bias. 10-12 with 2 sec stretch; then 12-15 with 2 sec contraction."),
    ex("Smith Machine Shrug", "8-10 with 2 sec squeeze; then 10-12 double drop set with no hold."),
  ] },
  day7: { title: "Hamstring / Calves", exercises: [
    ex("Leg Press Calf Raise", "15-20 x 3 with 2 sec squeeze; superset with Bodyweight Calf Raise to failure."),
    ex("Bodyweight Calf Raise", "To failure as the second part of the calf superset."),
    ex("Machine Seated Calf Raise", "20 x 3. First 10 slow with pauses on stretch and squeeze, then 10 quick. Increase weight each set; last set drop set."),
    ex("Machine Leg / Hamstring Curl Prone", "8-10; 12-15; then 5x4 cluster set."),
    ex("Leg / Hamstring Curl Seated", "8-10; then 10-12. Use 2 sec stretch each rep for both sets."),
    ex("Dumbbell Romanian Deadlift", "10-12; then 12-15. Use 2 sec stretch each rep for both sets."),
    ex("Machine Hip Adduction", "10-15 x 2 with 2 sec stretch each rep for both sets."),
    ex("Machine Hip Thrust (Glute Bridge)", "8-10; then 15-20. Micro pause on stretch and squeeze each rep."),
  ] },
  day8: { title: "Delts / Arms", exercises: [
    ex("Machine Lateral Raise", "8-10; 12-15; then start at first-set load, 6 reps, drop 1 pin and repeat until 6 drops and 36 reps total."),
    ex("Smith Machine Shoulder Press", "Set stopper so bar reaches around lip/nose height. 10-12; then 5x4 cluster."),
    ex("EZ-Bar Skull Crusher", "3 sec pause in stretch. Grip just outside shoulder width. 8-10; then 10-12."),
    ex("Dumbbell Drag Curl", "Bench at 65 degrees, torso locked in. Once you fail, hammer curl to failure again. 12-15 x 2."),
    ex("Machine Assisted Dip", "Stay upright with 3 sec in stretch, no leaning forward, all tension on triceps. 10-12; then 12-15."),
    ex("Cable Single-Arm Bicep Curl", "Facing the stack. Both sets 2 second pause in peak contraction. 8-10; then 10-12."),
    ex("Bayesian Cable Curl", "Face away from the stack. 2 second stretch. 10-12."),
    ex("Cable Rope Tricep Pushdown / Extension", "3 sets: 8-10; 10-12; 12-15. All sets hold contraction at top 2 seconds."),
    ex("Machine Alternate Arm Curl", "Perfect reps, no momentum. 3 sets: 8-10; 10-12; 15-20. 2 second hold in peak contraction."),
    ex("Cable Single-Arm Overhead Tricep Extension Low", "2 second pause in stretch every rep. 3 sets: 8-10; 12-15; 15-20."),
  ] },
};

let saveTimer = 0;
let saveFeedbackReady = false;
let saveFeedbackTimer = 0;
let lastSaveTrigger = null;
let lastSaveTriggerAt = 0;
let calendarScrollTimer = 0;
const tabCloseTimers = new WeakMap();
const openExerciseCards = new Set();
let motraImportPreview = [];
let motraImportSourceName = "";
let cloudSession = null;
let cloudUser = null;
let cloudSyncTimer = 0;
let cloudStatusMessage = "Log in or create an account to sync this app across devices.";
let cloudStatusIsError = false;
let cloudLastSyncedAt = "";
let cloudProfile = null;
let cloudProfiles = [];
let masterStatusMessage = "Master dashboard loads for the first account once Supabase user tracking is set up.";
let masterActionMessage = "";
let masterActionIsError = false;
let masterBusy = false;
let authReady = false;
let authBusy = false;
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
const VIEW_IDS = ["today", "log", "planner", "peptides", "history", "settings"];
let state = defaults();
let startupDetailsCollapsed = false;

function ex(name, notes, targets = []) {
  const displayName = motraExerciseName(name);
  return { id: `ex-${slug(name)}`, name: displayName, notes, targets: targets.length ? expandStoredTargets(targets) : deriveTargets(displayName, notes) };
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
    peptideCycles: [],
    peptideLogs: [],
    weeklyPlan: { assignments: { ...DEFAULT_WEEKLY_ASSIGNMENTS }, doseDays: [] },
    workoutTemplates: clone(DEFAULT_TEMPLATES),
    workoutDrafts: {},
    settings: { activeView: "today", selectedSplit: "", selectedSplitDate: "", historyType: "meals", historyDate: todayKey(), peptideReminderDate: todayKey(), trainingPlanVersion: TRAINING_PLAN_VERSION },
    createdAt: Date.now(),
  };
}
function merge(raw) {
  const base = defaults();
  const source = normalizeImportedData(raw || {});
  const sourcePlanVersion = source?.settings?.trainingPlanVersion || "";
  const next = { ...base, ...source };
  next.meals = source?.meals || base.meals;
  next.savedMeals = Array.isArray(source?.savedMeals) ? source.savedMeals.map(normalizeMeal).filter(Boolean) : base.savedMeals;
  next.mealPlans = Array.isArray(source?.mealPlans) ? source.mealPlans.map(normalizeMealPlan).filter(Boolean) : base.mealPlans;
  next.macroTargets = normalizeMacroTargets(source?.macroTargets || source?.targets || source?.goals || base.macroTargets);
  next.workouts = normalizeWorkouts(source?.workouts || base.workouts);
  next.bodyMetrics = Array.isArray(source?.bodyMetrics) ? source.bodyMetrics : Array.isArray(source?.body) ? source.body : base.bodyMetrics;
  next.progressCheckins = Array.isArray(source?.progressCheckins) ? source.progressCheckins.map(normalizeProgressCheckin).filter(Boolean) : base.progressCheckins;
  next.peptideCycles = Array.isArray(source?.peptideCycles) ? source.peptideCycles.map(normalizeCycle).filter(Boolean) : base.peptideCycles;
  next.peptideLogs = Array.isArray(source?.peptideLogs) ? source.peptideLogs.map(normalizeDoseLog).filter(Boolean) : base.peptideLogs;
  next.weeklyPlan = normalizeWeeklyPlan(source?.weeklyPlan || base.weeklyPlan);
  next.workoutTemplates = upgradePlanNotes(normalizeTemplates({ ...base.workoutTemplates, ...(source?.workoutTemplates || {}) }));
  next.workoutDrafts = source?.workoutDrafts || {};
  next.settings = { ...base.settings, ...(source?.settings || {}), trainingPlanVersion: TRAINING_PLAN_VERSION };
  if (source?.workoutTemplates && sourcePlanVersion !== TRAINING_PLAN_VERSION) refreshDefaultTrainingPlan(next);
  next.workouts = migrateLoggedWorkoutExerciseNames(next.workouts, next.workoutTemplates, next.weeklyPlan);
  delete next.dailyCheckin;
  return next;
}
function normalizeImportedData(raw) {
  const wrapped = raw?.data || raw?.state || raw?.backup || raw?.payload || raw;
  const data = wrapped && typeof wrapped === "object" ? { ...wrapped } : {};
  if (data.goals && !data.macroTargets) data.macroTargets = macroTargetsFromGoals(data.goals);
  if (Array.isArray(data.dosages) && !Array.isArray(data.peptideLogs)) data.peptideLogs = data.dosages.map(legacyDosageToLog).filter(Boolean);
  if (Array.isArray(data.progressPhotos) && !Array.isArray(data.progressCheckins)) data.progressCheckins = data.progressPhotos.map(legacyProgressPhotoToCheckin).filter(Boolean);
  return data;
}
function macroTargetsFromGoals(goals = {}) {
  const source = goals.training || goals.rest || goals;
  return normalizeMacroTargets(source);
}
function legacyDosageToLog(log) {
  if (!log || typeof log !== "object") return null;
  const created = rawNum(log.createdAt || log.date || Date.now()) || Date.now();
  const date = isDateKey(log.date) ? log.date : dayKey(new Date(created));
  const peptideId = log.peptideId || log.id || log.compoundId || "retatrutide";
  return normalizeDoseLog({
    id: log.id || uid(),
    peptideId,
    peptideName: log.peptideName || log.name || compoundName(peptideId),
    date,
    timing: log.timing || log.time || "morning",
    doseMg: log.doseMg || log.amountMg || log.amount || 0,
    notes: log.notes || "",
    createdAt: created,
  });
}
function legacyProgressPhotoToCheckin(entry) {
  if (!entry || typeof entry !== "object") return null;
  const created = rawNum(entry.createdAt || Date.now()) || Date.now();
  return normalizeProgressCheckin({
    id: entry.id || uid(),
    date: isDateKey(entry.date) ? entry.date : dayKey(new Date(created)),
    weightKg: entry.weightKg || entry.weight || 0,
    waistCm: entry.waistCm || 0,
    mood: entry.mood || "",
    notes: entry.notes || entry.caption || "",
    photoDataUrl: entry.uri || entry.photoDataUrl || entry.dataUrl || "",
    createdAt: created,
  });
}
function normalizeWeeklyPlan(plan = {}) {
  const assignments = { ...DEFAULT_WEEKLY_ASSIGNMENTS };
  const rawAssignments = Array.isArray(plan.assignments) ? Object.fromEntries(plan.assignments.map((value, index) => [index, value])) : plan.assignments || {};
  for (const [key, value] of Object.entries(rawAssignments)) {
    const index = Number(key);
    if (Number.isInteger(index) && index >= 0 && index <= 6) assignments[index] = String(value || "rest");
  }
  return {
    assignments,
    doseDays: Array.isArray(plan.doseDays) ? plan.doseDays.map(Number).filter((day) => day >= 0 && day <= 6) : [],
  };
}
function normalizeWorkouts(workouts = {}) {
  if (!workouts || typeof workouts !== "object" || Array.isArray(workouts)) return {};
  return Object.fromEntries(Object.entries(workouts).map(([date, list]) => [date, Array.isArray(list) ? list.map((workout) => normalizeWorkout(workout, date)).filter(Boolean) : []]).filter(([, list]) => list.length));
}
function normalizeWorkout(workout, date = todayKey()) {
  if (!workout || typeof workout !== "object") return null;
  const createdAt = rawNum(workout.createdAt) || parseDay(date)?.getTime?.() || Date.now();
  const exerciseLogs = Array.isArray(workout.exerciseLogs)
    ? workout.exerciseLogs.map(normalizeExerciseLog).filter(Boolean)
    : Array.isArray(workout.exercises)
    ? workout.exercises.map(legacyExerciseToLog).filter(Boolean)
    : [];
  return {
    ...workout,
    id: String(workout.id || uid()),
    name: String(workout.name || workout.planTitle || "Workout"),
    type: workout.type || "strength",
    split: workout.split || "",
    planTitle: workout.planTitle || workout.name || "",
    durationMin: num(workout.durationMin || workout.minutes || 0),
    caloriesBurned: num(workout.caloriesBurned || workout.calories || 0),
    createdAt,
    exerciseLogs,
  };
}
function normalizeExerciseLog(log, index = 0) {
  if (!log || typeof log !== "object") return null;
  const name = motraExerciseName(log.name || log.title || `Exercise ${index + 1}`);
  const targets = Array.isArray(log.targets) ? expandStoredTargets(log.targets) : deriveTargets(name, log.notes || "");
  return {
    exerciseId: String(log.exerciseId || log.id || `ex-${exerciseMatchKey(name)}`),
    name,
    notes: String(log.notes || ""),
    targets,
    sets: Array.isArray(log.sets) ? log.sets.map(normalizeLoggedSet).filter(Boolean) : [],
  };
}
function legacyExerciseToLog(exercise, index = 0) {
  const name = motraExerciseName(exercise?.name || `Exercise ${index + 1}`);
  const reps = num(exercise?.reps);
  const weightKg = rawNum(exercise?.weightKg);
  const setCount = Math.max(1, num(exercise?.sets || 1));
  return {
    exerciseId: String(exercise?.id || `ex-${exerciseMatchKey(name)}`),
    name,
    notes: "",
    targets: reps ? [normalizeTarget({ label: `${reps} reps`, details: `${setCount} set${setCount === 1 ? "" : "s"} from imported workout.` })] : [],
    sets: Array.from({ length: setCount }, (_, setIndex) => normalizeLoggedSet({
      id: `${exercise?.id || slug(name)}-${setIndex}`,
      reps,
      weightKg,
      targetLabel: reps ? `${reps} reps` : "Imported set",
      createdAt: Date.now(),
    })).filter(Boolean),
  };
}
function normalizeLoggedSet(set) {
  if (!set || typeof set !== "object") return null;
  return {
    id: String(set.id || uid()),
    reps: num(set.reps),
    weightKg: rawNum(set.weightKg),
    targetId: String(set.targetId || ""),
    targetLabel: String(set.targetLabel || set.label || "Set"),
    targetDetails: String(set.targetDetails || set.details || ""),
    createdAt: rawNum(set.createdAt) || Date.now(),
  };
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
    const byName = new Map((next[key].exercises || []).map((exercise) => [exerciseMatchKey(exercise.name), exercise]));
    for (const defaultExercise of defaultTemplate.exercises) {
      const existing = byName.get(exerciseMatchKey(defaultExercise.name));
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
function refreshDefaultTrainingPlan(target) {
  const existing = normalizeTemplates(target.workoutTemplates || {});
  const custom = Object.fromEntries(Object.entries(existing).filter(([key]) => !DEFAULT_TEMPLATES[key]));
  target.workoutTemplates = { ...clone(DEFAULT_TEMPLATES), ...custom };
  target.weeklyPlan = normalizeWeeklyPlan(target.weeklyPlan || {});
  target.settings = { ...(target.settings || {}), trainingPlanVersion: TRAINING_PLAN_VERSION };
  if (!target.settings.selectedSplit || !target.workoutTemplates[target.settings.selectedSplit]) {
    target.settings.selectedSplit = DEFAULT_WEEKLY_ASSIGNMENTS[weekdayIndex()] === "rest" ? "day1" : DEFAULT_WEEKLY_ASSIGNMENTS[weekdayIndex()];
  }
  return target;
}
function splitKeyFromWorkout(workout, date = "", templates = DEFAULT_TEMPLATES, weeklyPlan = null) {
  if (workout?.split && templates?.[workout.split]) return workout.split;
  const title = normalizeTitle(workout?.planTitle || workout?.name || workout?.title || "");
  const titleKey = slug(title);
  for (const [key, template] of Object.entries(templates || {})) {
    if (slug(template.title) === titleKey) return key;
  }
  const rawTitle = slug(workout?.planTitle || workout?.name || workout?.title || "");
  for (const [key, template] of Object.entries(templates || {})) {
    const splitSlug = slug(template.title);
    if (rawTitle && splitSlug && (rawTitle.includes(splitSlug) || splitSlug.includes(rawTitle))) return key;
  }
  let best = { key: "", score: 0 };
  for (const [key, template] of Object.entries(templates || {})) {
    const exercises = template.exercises || [];
    const score = (workout?.exerciseLogs || []).reduce((sum, log) => sum + (exercises.some((exercise) => exerciseNamesMatch(log.name, exercise.name)) ? 1 : 0), 0);
    if (score > best.score) best = { key, score };
  }
  if (best.score) return best.key;
  if (date && weeklyPlan?.assignments) {
    const day = parseDay(date);
    const assign = day ? weeklyPlan.assignments[weekdayIndex(day)] : "";
    if (assign && templates?.[assign] && assign !== "rest") return assign;
  }
  return "";
}
function exactPlanNameForLog(log, template, usedIndexes = new Set()) {
  const exercises = template?.exercises || [];
  if (!exercises.length) return motraExerciseName(log?.name || "");
  const normalized = motraExerciseName(log?.name || "");
  const exactIndex = exercises.findIndex((exercise, index) => !usedIndexes.has(index) && exercise.name === normalized);
  if (exactIndex >= 0) {
    usedIndexes.add(exactIndex);
    return exercises[exactIndex].name;
  }
  const candidates = exercises
    .map((exercise, index) => ({ exercise, index }))
    .filter(({ exercise, index }) => !usedIndexes.has(index) && exerciseNamesMatch(normalized, exercise.name));
  const picked = candidates[0] || exercises.map((exercise, index) => ({ exercise, index })).find(({ exercise }) => exerciseNamesMatch(normalized, exercise.name));
  if (!picked) return normalized;
  usedIndexes.add(picked.index);
  return picked.exercise.name;
}
function migrateLoggedWorkoutExerciseNames(workouts = {}, templates = DEFAULT_TEMPLATES, weeklyPlan = null) {
  if (!workouts || typeof workouts !== "object" || Array.isArray(workouts)) return {};
  return Object.fromEntries(Object.entries(workouts).map(([date, list]) => {
    const sessions = (Array.isArray(list) ? list : []).map((workout) => {
      const split = splitKeyFromWorkout(workout, date, templates, weeklyPlan);
      const template = templates?.[split];
      const usedIndexes = new Set();
      const exerciseLogs = (workout.exerciseLogs || []).map((log) => {
        const name = exactPlanNameForLog(log, template, usedIndexes);
        return { ...log, name };
      });
      return { ...workout, split: workout.split || split || "", planTitle: workout.planTitle || (split ? splitTitleForTemplates(split, templates) : workout.planTitle), exerciseLogs };
    });
    return [date, sessions];
  }).filter(([, list]) => list.length));
}
function splitTitleForTemplates(key, templates = DEFAULT_TEMPLATES) {
  if (key === "rest") return "Rest";
  if (key === "cardio") return "Cardio";
  return templates?.[key]?.title || key;
}
function normalizeExercise(exercise, index) {
  if (typeof exercise === "string") {
    const name = motraExerciseName(exercise);
    return { id: `ex-${index}-${exerciseMatchKey(name)}`, name, notes: "", targets: deriveTargets(name, "") };
  }
  const name = motraExerciseName(exercise?.name || exercise?.title || `Exercise ${index + 1}`);
  const notes = String(exercise?.notes || "");
  const targets = Array.isArray(exercise?.targets) && exercise.targets.length ? expandStoredTargets(exercise.targets) : deriveTargets(name, notes);
  return { ...exercise, id: String(exercise?.id || `ex-${index}-${exerciseMatchKey(name)}`), name, notes, targets };
}
function normalizeTitle(title) {
  if (title === "Pull A - Lat Focus") return "Pull A";
  if (title === "Pull B - Upper Back Bias") return "Pull B";
  return String(title || "");
}
function slug(v) {
  return String(v || "item").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "item";
}
function motraExerciseName(name) {
  const raw = String(name || "").trim();
  return MOTRA_EXERCISE_ALIAS_MAP[slug(raw)] || raw;
}
function exerciseMatchKey(name) {
  return slug(motraExerciseName(name));
}
function exerciseMatchKeys(name) {
  const key = exerciseMatchKey(name);
  return new Set([key, ...(EXERCISE_MATCH_EQUIVALENTS.get(key) || [])]);
}
function exerciseNamesMatch(a, b) {
  const aKeys = exerciseMatchKeys(a);
  const bKeys = exerciseMatchKeys(b);
  for (const key of aKeys) if (bKeys.has(key)) return true;
  return false;
}
function escapeHtml(v) {
  return String(v ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}
function guidanceHtml(notes) {
  if (!notes) return "";
  return `<div class="exercise-guidance"><span>Target reps / notes</span><p>${escapeHtml(notes)}</p></div>`;
}
function logNotesDropdownHtml(notes) {
  if (!notes) return "";
  return `<details class="log-dropdown">
    <summary>Target reps / notes</summary>
    <div class="log-dropdown-body"><p>${escapeHtml(notes)}</p></div>
  </details>`;
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
function logTargetDetailsHtml(targets = []) {
  if (!targets.length) return "";
  return `<details class="log-dropdown">
    <summary>Set targets</summary>
    <div class="log-dropdown-body">${targets.map((item) => `<p><strong>${escapeHtml(item.label)}</strong> ${escapeHtml(item.details)}</p>`).join("")}</div>
  </details>`;
}
function targetListHtml(targets = []) {
  if (!targets.length) return `<div class="empty">No target reps saved for this exercise.</div>`;
  return `<div class="target-list">${targets.map((item) => `<p><strong>${escapeHtml(item.label)}</strong> ${escapeHtml(item.details)}</p>`).join("")}</div>`;
}
function getTarget(targets = [], id = "") {
  return targets.find((item) => item.id === id) || targets[0] || null;
}
function isExplicitSetTarget(target) {
  return /^set\s*\d+\s*:/i.test(target?.label || "") || /^set\s*\d+\s+of\s+\d+/i.test(target?.details || "");
}
function targetCountsAsSet(target, hasExplicitSets = false) {
  const label = String(target?.label || "");
  const details = String(target?.details || "");
  const combined = `${label} ${details}`.toLowerCase();
  const setRepPattern = /(\d+\s*[-/]\s*\d+|\d+)\s*(?:reps?|rep\b)/i;
  const repRangePattern = /\b\d+\s*[-/]\s*\d+\b/;
  if (/^rep\s*\d+\s+hold/i.test(label) || /^technique\b/i.test(label)) {
    return setRepPattern.test(details) || repRangePattern.test(details);
  }
  if (isExplicitSetTarget(target)) return true;
  if (hasExplicitSets && /^set\s*\d+$/i.test(label)) return false;
  if (hasExplicitSets && /\bto failure\b/i.test(label)) return false;
  return setRepPattern.test(combined) || repRangePattern.test(combined) || /\b(cluster|rest-pause|rest pause|drop set|drop)\b/i.test(combined);
}
function plannedSetCount(log) {
  const targets = log?.targets || [];
  const explicitCount = targets.filter(isExplicitSetTarget).length;
  const extraCount = targets.filter((target) => !isExplicitSetTarget(target) && targetCountsAsSet(target, explicitCount > 0)).length;
  return Math.max(1, explicitCount + extraCount);
}
function loggedSetCount(log) {
  return (log?.sets || []).filter((set) => num(set.reps) || rawNum(set.weightKg)).length;
}
function exerciseLogStatus(log) {
  const required = plannedSetCount(log);
  const logged = loggedSetCount(log);
  const status = logged <= 0 ? "empty" : logged >= required ? "complete" : "partial";
  const label = status === "complete" ? `${required}/${required} done` : `${Math.min(logged, required)}/${required} sets`;
  return { required, logged, status, label };
}
function setOpenExerciseCard(id = "") {
  openExerciseCards.clear();
  if (id) openExerciseCards.add(String(id));
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
function peptideReminderDate() {
  const today = parseDay(todayKey()) || new Date();
  const min = dayKey(addDays(today, -7));
  const max = dayKey(addDays(today, 7));
  const date = isDateKey(state.settings.peptideReminderDate) ? state.settings.peptideReminderDate : todayKey();
  const safeDate = date < min || date > max ? todayKey() : date;
  state.settings.peptideReminderDate = safeDate;
  return safeDate;
}
function startOfWeek(date = new Date()) {
  const d = new Date(date);
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - weekdayIndex(d));
  return d;
}
function metricDateKey(metric) {
  if (isDateKey(metric?.date)) return metric.date;
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
  const peptideLogs = userCanUsePeptides() ? (state.peptideLogs || []).filter((log) => log.date === date).length : 0;
  const peptideDue = userCanUsePeptides() ? dueDoseSlots(date).length : 0;
  const peptides = Math.max(peptideLogs, peptideDue);
  return { meals, workouts, weight, peptides, total: meals + workouts + weight + peptides };
}
function historyCountSummary(counts) {
  return [
    counts.meals ? `${counts.meals}M` : "",
    counts.workouts ? `${counts.workouts}W` : "",
    counts.peptides ? `${counts.peptides}P` : "",
    counts.weight ? `${counts.weight}Wt` : "",
  ].filter(Boolean).join(" ");
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
function macroRemaining(meals = todayMeals(), targets = state.macroTargets || {}) {
  const target = normalizeMacroTargets(targets);
  const total = totals(meals);
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
    endedAt: isDateKey(cycle.endedAt) ? String(cycle.endedAt) : "",
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
  if (isDateKey(cycle?.endedAt) && String(cycle.endedAt) <= String(date)) return false;
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
  const cycle = (state.peptideCycles || []).find((item) => item.id === cycleId);
  return cycle ? doseLogForSlot({ cycle, timing }, date) : (state.peptideLogs || []).find((log) => log.cycleId === cycleId && log.timing === timing && log.date === date);
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
function flashSaved(button) {
  if (!button) return;
  button.classList.remove("delete-pulse");
  button.classList.remove("saved-pulse");
  void button.offsetWidth;
  button.classList.add("saved-pulse");
}
function flashDeleted(button) {
  if (!button) return;
  button.classList.remove("saved-pulse");
  button.classList.remove("delete-pulse");
  void button.offsetWidth;
  button.classList.add("delete-pulse");
}
function flashMealAdded(button) {
  if (!button) return;
  const card = button.closest(".meal-card");
  button.classList.remove("meal-added-pulse");
  card?.classList.remove("meal-added-card");
  void button.offsetWidth;
  button.textContent = "Added";
  button.disabled = true;
  button.classList.add("meal-added-pulse");
  card?.classList.add("meal-added-card");
}
function runMealLibraryAddFeedback(button, action) {
  if (!button?.closest?.("#saved-meal-list")) {
    action();
    return;
  }
  flashMealAdded(button);
  setTimeout(action, 420);
}
function isDeleteButton(button) {
  if (!button) return false;
  if (button.classList?.contains("danger-button")) return true;
  return Object.keys(button.dataset || {}).some((key) => key.toLowerCase().startsWith("delete"));
}
function showSaveFeedback() {
  if (!saveFeedbackReady) return;
  const trigger = lastSaveTrigger?.isConnected && Date.now() - lastSaveTriggerAt < 3000 ? lastSaveTrigger : null;
  if (trigger) {
    if (isDeleteButton(trigger)) flashDeleted(trigger);
    else flashSaved(trigger);
  }
  clearTimeout(saveFeedbackTimer);
  saveFeedbackTimer = setTimeout(() => {
    trigger?.classList.remove("saved-pulse");
    trigger?.classList.remove("delete-pulse");
  }, 1250);
  lastSaveTrigger = null;
  lastSaveTriggerAt = 0;
}
function flashOpenTab(panel) {
  if (!panel?.matches?.("details")) return;
  clearTimeout(tabCloseTimers.get(panel));
  tabCloseTimers.delete(panel);
  panel.classList.remove("tab-closing");
  panel.classList.remove("tab-open-pulse");
  void panel.offsetWidth;
  panel.classList.add("tab-open-pulse");
  setTimeout(() => {
    if (panel.isConnected) panel.classList.remove("tab-open-pulse");
  }, 1250);
}
function closeTabSmooth(panel) {
  if (!panel?.matches?.("details") || !panel.open || panel.classList.contains("tab-closing")) return;
  panel.classList.remove("tab-open-pulse");
  panel.classList.add("tab-closing");
  clearTimeout(tabCloseTimers.get(panel));
  tabCloseTimers.set(panel, setTimeout(() => {
    panel.open = false;
    panel.classList.remove("tab-closing");
    tabCloseTimers.delete(panel);
  }, 520));
}
function save(options = {}) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch {}
  if (!options.silent) showSaveFeedback();
  if (!options.silent) renderCoachNotes();
  if (!options.skipCloud) scheduleCloudSync();
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
  const view = normalizeView(state.settings?.activeView || activeViewName());
  renderFeatureAccess();
  renderHeader();
  renderToday();
  renderLog();
  renderPlanner();
  renderPeptides();
  renderHistory();
  renderSummary();
  renderMotraImportList();
  renderMotraPreview();
  renderCloudPanel();
  renderMasterDashboard();
  setView(view, { persist: false });
  collapseStartupDetails();
}
function renderFeatureAccess() {
  const canUsePeptides = userCanUsePeptides();
  document.body.classList.toggle("peptides-locked", !canUsePeptides);
  document.querySelectorAll("[data-peptide-feature]").forEach((el) => { el.hidden = !canUsePeptides; });
  if (!canUsePeptides && state.settings.historyType === "peptides") state.settings.historyType = "meals";
  if (!canUsePeptides && state.settings.activeView === "peptides") state.settings.activeView = "today";
  renderPanelLimit();
}
function refreshPeptideAccessUi() {
  renderFeatureAccess();
  renderToday();
  renderPeptides();
  renderHistory();
  renderSummary();
  renderPanelLimit();
  scheduleCalendarScroll();
}
function collapseStartupDetails() {
  if (startupDetailsCollapsed) return;
  document.querySelectorAll("details[open]").forEach((detail) => { detail.open = false; });
  openExerciseCards.clear();
  startupDetailsCollapsed = true;
}
function centerScrollerItem(strip, target) {
  if (!strip || !target || strip.clientWidth <= 0) return false;
  const left = target.offsetLeft - ((strip.clientWidth - target.offsetWidth) / 2);
  strip.scrollTo({ left: Math.max(0, left), behavior: "auto" });
  return true;
}
function centerCalendarScrollers() {
  const pairs = [
    [".peptide-date-strip", ".peptide-date-chip.active, .peptide-date-chip.is-today"],
    [".history-day-strip", ".history-day.active, .history-day.is-today"],
    [".consistency-strip", ".consistency-day.active"],
  ];
  pairs.forEach(([stripSelector, targetSelector]) => {
    document.querySelectorAll(stripSelector).forEach((strip) => centerScrollerItem(strip, strip.querySelector(targetSelector)));
  });
}
function scheduleCalendarScroll() {
  window.cancelAnimationFrame(calendarScrollTimer);
  calendarScrollTimer = window.requestAnimationFrame(() => {
    centerCalendarScrollers();
    setTimeout(centerCalendarScrollers, 120);
  });
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
  $("#today-exercises").innerHTML = exercises.length
    ? `${exercises.map((exercise) => `<details class="today-exercise-card" data-today-exercise="${escapeHtml(exercise.id)}">
        <summary class="today-exercise-summary">
          <span><strong>${escapeHtml(exercise.name)}</strong><small>${escapeHtml(targetRepText(exercise.targets || []))}</small></span>
          <span class="summary-pill">Targets</span>
        </summary>
        <div class="today-exercise-body">
          ${guidanceHtml(exercise.notes)}
          ${targetListHtml(exercise.targets)}
        </div>
      </details>`).join("")}${trainingTermsHtml()}`
    : `<div class="empty">Rest and recover.</div>`;
  $("#meal-count").textContent = `${todayMeals().length} meals`;
  $("#meal-total").textContent = `${fmt(mealTotal.calories)} kcal`;
  $("#workout-count").textContent = `${todayWorkouts().length} workouts`;
  $("#workout-total").textContent = `${fmt(burned())} kcal burned`;
  renderMacroHero(mealTotal);
  renderHomeDashboard(mealTotal);
  renderCoachNotes();
  renderTodayMealList();
  renderMacroSuggestions();
  renderTodayPeptideReminders();
}
function topLevelDropdowns(view) {
  return Array.from(view.children).filter((el) => el.classList?.contains("drop-panel") && !el.hidden);
}
function renderPanelLimit() {
  $$(".view").forEach((view) => {
    const panels = topLevelDropdowns(view);
    const needsToggle = panels.length > TOP_DROPDOWN_LIMIT;
    let button = Array.from(view.children).find((el) => el.classList?.contains("see-more-button"));
    if (!needsToggle) {
      view.classList.remove("show-extra-panels");
      panels.forEach((panel) => panel.classList.remove("extra-drop-panel"));
      button?.remove();
      return;
    }
    const expanded = view.classList.contains("show-extra-panels");
    panels.forEach((panel, index) => panel.classList.toggle("extra-drop-panel", index >= TOP_DROPDOWN_LIMIT && !expanded));
    if (!button) {
      button = document.createElement("button");
      button.className = "see-more-button";
      button.type = "button";
      button.dataset.seeMorePanels = "";
      view.appendChild(button);
    }
    const hiddenCount = panels.length - TOP_DROPDOWN_LIMIT;
    button.textContent = expanded ? "See fewer tabs" : `See more tabs (${hiddenCount})`;
    button.setAttribute("aria-expanded", String(expanded));
  });
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
function macroHistoryStatus(total, target) {
  const normalized = normalizeMacroTargets(target || {});
  if (!hasMacroTargets(normalized)) return { className: "neutral", label: "No macro target", detail: "Set calories and macro targets in Planner." };
  const calorieTarget = rawNum(normalized.calories);
  const calorieGap = calorieTarget - rawNum(total.calories);
  const score = macroCompletion(total, normalized);
  if (!calorieTarget) return { className: score >= 90 ? "hit" : "behind", label: `${score}% complete`, detail: "Based on protein, carbs and fat targets." };
  if (calorieGap > 50) return { className: "behind", label: "Behind target", detail: `${fmt(calorieGap)} kcal left / ${score}% complete` };
  if (calorieGap < -50) return { className: "over", label: "Over target", detail: `${fmt(Math.abs(calorieGap))} kcal over / ${score}% complete` };
  return { className: "hit", label: "Calorie target hit", detail: `${score}% complete across calories and macros` };
}
function historyDropdownHtml(title, subtitle, pill, body, className = "") {
  return `<details class="panel drop-panel history-drop-panel ${className}">
    <summary class="drop-summary">
      <span><strong>${escapeHtml(title)}</strong><small>${escapeHtml(subtitle)}</small></span>
      <span class="drop-pill">${escapeHtml(pill)}</span>
    </summary>
    <div class="drop-body">${body}</div>
  </details>`;
}
function mealHistoryMacroSummaryHtml(date, meals) {
  const total = totals(meals);
  const target = normalizeMacroTargets(state.macroTargets || {});
  const status = macroHistoryStatus(total, target);
  const keys = ["calories", "protein", "carbs", "fat"];
  const stats = keys.map((key) => {
    const value = key === "calories" ? fmt(total[key]) : fmtDose(total[key], 1);
    const targetValue = rawNum(target[key]);
    const targetText = targetValue ? `Target ${key === "calories" ? fmt(targetValue) : fmtDose(targetValue, 1)}${macroUnit(key)}` : "No target";
    return `<div class="macro-stat"><span>${escapeHtml(macroName(key))}</span><strong>${value}${key === "calories" ? "" : "g"}</strong><small>${escapeHtml(targetText)}</small></div>`;
  }).join("");
  return historyDropdownHtml("Meals Macros", `${dateLabel(date)} / ${status.detail}`, "Macros", `
    <div class="history-mini-head">
      <strong>${escapeHtml(dateLabel(date))} totals</strong>
      <span class="history-status-pill ${status.className}">${escapeHtml(status.label)}</span>
    </div>
    <div class="macro-stat-grid">${stats}</div>
    <div class="macro-bars">${keys.map((key) => macroBarHtml(key, total, target)).join("")}</div>
  `, `macro-history-card ${status.className}`);
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
  if (!userCanUsePeptides()) return [];
  return (state.peptideCycles || [])
    .filter((cycle) => cycleDueOn(cycle, date))
    .flatMap((cycle) => (cycle.timings || []).map((timing) => ({ cycle, timing })));
}
function doseLogForSlot(slot, date = todayKey()) {
  if (!slot?.cycle) return null;
  return (state.peptideLogs || []).find((log) => {
    if (log.date !== date || log.timing !== slot.timing) return false;
    if (log.cycleId === slot.cycle.id) return true;
    return !log.cycleId && log.peptideId === slot.cycle.peptideId;
  }) || null;
}
function doseLoggedForSlot(slot, date = todayKey()) {
  return Boolean(doseLogForSlot(slot, date));
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
  const previousWeight = rawNum(previous.weightKg || previous.weight);
  const previousDate = metricDateKey(previous);
  const diff = latestWeight - previousWeight;
  const sign = diff > 0 ? "+" : "";
  const recent = daysBetween(latestDate, todayKey()) <= 7;
  return {
    label: `${fmtWeight(latestWeight)}kg`,
    detail: `${sign}${fmtWeight(diff)}kg vs ${fmtWeight(previousWeight)}kg on ${dateLabel(previousDate)}`,
    recent,
    score: recent ? 100 : 65,
  };
}
function readinessData(total = totals()) {
  const target = normalizeMacroTargets(state.macroTargets || {});
  const assign = plannedAssignForDate();
  const restDay = assign === "rest";
  const due = dueDoseSlots();
  const loggedDoses = due.filter((slot) => doseLoggedForSlot(slot)).length;
  const weight = latestWeightTrend();
  const metrics = [
    { key: "macros", label: "Macros", value: hasMacroTargets(target) ? `${macroCompletion(total, target)}%` : "Set", detail: hasMacroTargets(target) ? `${fmt(total.calories)} / ${fmt(target.calories)} kcal` : "Add targets", score: hasMacroTargets(target) ? macroCompletion(total, target) : 40 },
    { key: "workout", label: "Workout", value: restDay ? "Rest" : todayWorkouts().length ? "Done" : "Due", detail: splitTitle(assign), score: restDay || todayWorkouts().length ? 100 : 0 },
    { key: "weight", label: "Weight", value: weight.label, detail: weight.detail, score: weight.score },
  ];
  if (userCanUsePeptides()) metrics.splice(2, 0, { key: "peptides", label: "Peptides", value: due.length ? `${loggedDoses}/${due.length}` : "None", detail: due.length ? "Due today" : "No dose due", score: due.length ? clamp((loggedDoses / due.length) * 100) : 100 });
  const weights = userCanUsePeptides() ? { macros: 35, workout: 25, peptides: 20, weight: 20 } : { macros: 40, workout: 35, weight: 25 };
  const score = Math.round(metrics.reduce((sum, item) => sum + (item.score * (weights[item.key] || 10)), 0) / metrics.reduce((sum, item) => sum + (weights[item.key] || 10), 0));
  const summary = score >= 85 ? "Strong day. Keep the boxes green." : score >= 65 ? "Good base. Finish the remaining targets." : "Focus on the next easy win first.";
  return { score, summary, metrics };
}
function scoreRowsHtml(rows = []) {
  return `<div class="score-detail-rows">${rows.map((row) => `<div class="score-detail-row">
    <span>${escapeHtml(row.label)}</span>
    <strong>${escapeHtml(row.value)}</strong>
    ${row.detail ? `<small>${escapeHtml(row.detail)}</small>` : ""}
  </div>`).join("")}</div>`;
}
function scoreMiniListHtml(items = [], empty = "No detail saved yet.") {
  return items.length
    ? `<div class="score-mini-list">${items.map((item) => `<div><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.detail)}</small></div>`).join("")}</div>`
    : `<div class="empty">${escapeHtml(empty)}</div>`;
}
function dailyScoreDetailHtml(item, total = totals()) {
  const target = normalizeMacroTargets(state.macroTargets || {});
  if (item.key === "macros") {
    if (!hasMacroTargets(target)) {
      return `${scoreRowsHtml([{ label: "Targets", value: "Not set", detail: "Add your calories, protein, carbs and fat in Planner." }])}
        <button class="secondary wide-button" data-view="planner" type="button">Set macro targets</button>`;
    }
    const remaining = macroRemaining(todayMeals(), target);
    return `<div class="macro-bars score-macro-bars">${["calories", "protein", "carbs", "fat"].map((key) => macroBarHtml(key, total, target)).join("")}</div>
      <div class="formula-note">Remaining today: ${escapeHtml(macroRemainingText(remaining))}.</div>`;
  }
  if (item.key === "workout") {
    const assign = plannedAssignForDate();
    const template = state.workoutTemplates[assign];
    const planned = template?.exercises || [];
    const sessions = todayWorkouts();
    return `${scoreRowsHtml([
      { label: "Plan", value: splitTitle(assign), detail: assign === "rest" ? "Rest day from your weekly planner." : `${planned.length} exercises planned today.` },
      { label: "Logged", value: sessions.length ? `${sessions.length} session${sessions.length === 1 ? "" : "s"}` : "Not logged", detail: sessions.length ? `${fmt(burned(sessions))} kcal burned / ${fmt(sessions.reduce((sum, session) => sum + num(session.durationMin), 0))} minutes.` : "Log your sets after training so overload and history update." },
    ])}${sessions.length
      ? scoreMiniListHtml(sessions.map((session) => ({ title: session.name || session.planTitle || "Workout", detail: `${fmt((session.exerciseLogs || []).reduce((sum, log) => sum + loggedSetCount(log), 0))} sets saved` })))
      : scoreMiniListHtml(planned.slice(0, 5).map((exercise) => ({ title: exercise.name, detail: targetRepText(exercise.targets || []) })), "No exercises planned today.")}`;
  }
  if (item.key === "peptides") {
    const due = dueDoseSlots();
    if (!due.length) {
      return scoreRowsHtml([{ label: "Today", value: "None due", detail: "No peptide reminders scheduled for today." }]);
    }
    const logged = due.filter((slot) => doseLoggedForSlot(slot)).length;
    return `${scoreRowsHtml([{ label: "Progress", value: `${logged}/${due.length} logged`, detail: logged === due.length ? "All due doses are logged." : `${due.length - logged} dose${due.length - logged === 1 ? "" : "s"} still due today.` }])}
      ${scoreMiniListHtml(due.map((slot) => {
        const calc = calculateDraw(slot.cycle.peptideId, slot.cycle.vialMg, slot.cycle.diluentMl, slot.cycle.doseMg);
        const draw = calc.ok && calc.drawUnits ? ` / ${fmt(calc.drawUnits)} units` : "";
        return {
          title: `${compoundName(slot.cycle.peptideId)} / ${timingLabel(slot.timing)}`,
          detail: `${doseLoggedForSlot(slot) ? "Logged" : "Due"} / ${fmtDose(slot.cycle.doseMg)}mg${draw}`,
        };
      }))}`;
  }
  if (item.key === "weight") {
    const entries = [...(state.bodyMetrics || [])]
      .filter((entry) => rawNum(entry.weightKg || entry.weight) > 0)
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    const latest = entries[0];
    const previous = entries[1];
    if (!latest) return scoreRowsHtml([{ label: "Latest", value: "No weight yet", detail: "Add your first weight entry in History." }]);
    const latestWeight = rawNum(latest.weightKg || latest.weight);
    const latestDate = metricDateKey(latest);
    const previousWeight = previous ? rawNum(previous.weightKg || previous.weight) : 0;
    const previousDate = previous ? metricDateKey(previous) : "";
    const diff = previous ? latestWeight - previousWeight : 0;
    return scoreRowsHtml([
      { label: "Latest", value: `${fmtWeight(latestWeight)}kg`, detail: dateLabel(latestDate) },
      { label: "Trend", value: previous ? `${diff > 0 ? "+" : ""}${fmtWeight(diff)}kg` : "First entry", detail: previous ? `Previous ${fmtWeight(previousWeight)}kg on ${dateLabel(previousDate)}.` : "Add another weigh-in to show trend." },
    ]);
  }
  return `<div class="empty">No detail available.</div>`;
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
  metricsEl.innerHTML = data.metrics.map((item) => `<details class="dash-card score-detail-card ${item.score >= 90 ? "done" : item.score >= 60 ? "mid" : "low"}" data-score-section="${escapeHtml(item.key)}">
    <summary class="score-detail-summary">
      <span>${escapeHtml(item.label)}</span>
      <strong>${escapeHtml(item.value)}</strong>
      <small>${escapeHtml(item.detail)}</small>
    </summary>
    <div class="score-detail-body">${dailyScoreDetailHtml(item, total)}</div>
  </details>`).join("");
}
function dayAdherence(date) {
  const meals = mealsForDate(date);
  const total = totals(meals);
  const due = dueDoseSlots(date);
  const peptideDone = due.length ? due.every((slot) => doseLoggedForSlot(slot, date)) : true;
  return {
    meals: meals.length > 0 && (!hasMacroTargets() || macroCompletion(total) >= 75),
    workout: plannedAssignForDate(date) === "rest" ? "rest" : workoutsForDate(date).length > 0,
    peptide: peptideDone,
  };
}
function renderConsistencyCalendar() {
  const el = $("#consistency-calendar");
  if (!el) return;
  const today = parseDay(todayKey()) || new Date();
  const canUsePeptides = userCanUsePeptides();
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
        ${canUsePeptides ? `<i class="${data.peptide ? "hit" : "miss"}" title="Peptides"></i>` : ""}
      </div>
    </div>`;
  }).join("");
  scheduleCalendarScroll();
}
function coachNotes() {
  const notes = [];
  const remaining = macroRemaining();
  if (hasMacroTargets()) {
    const protein = Math.max(0, rawNum(remaining.protein));
    const carbs = Math.max(0, rawNum(remaining.carbs));
    notes.push(protein || carbs ? `Macros are still short: ${fmtDose(protein, 1)}g protein and ${fmtDose(carbs, 1)}g carbs. The app cannot eat for you. Pick a saved meal and fix it.` : "Macros are behaving today. Rare bit of discipline. Keep the next meal clean.");
  } else {
    notes.push("Set macro targets in Planner. Guessing macros is just dieting with a blindfold.");
  }
  const trend = exerciseTrendNote();
  if (trend) notes.push(trend);
  const due = dueDoseSlots();
  const loggedDoses = due.filter((slot) => doseLoggedForSlot(slot)).length;
  if (userCanUsePeptides() && due.length && loggedDoses < due.length) notes.push(`Peptides due today: ${loggedDoses}/${due.length} logged. If it is due, log it. Future-you does not need mystery dosing.`);
  else if (todayWorkouts().length) notes.push("Today's workout is logged. Now use the overload notes so next time is not copy-paste suffering.");
  else notes.push("Today's workout is still blank. Open Log and put numbers in before the excuses get comfortable.");
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
function macroGapOpen(remaining) {
  return ["calories", "protein", "carbs", "fat"].some((key) => rawNum(remaining[key]) > (key === "calories" ? 50 : 5));
}
function macroRemainingLabel(key, value) {
  const amount = Math.abs(rawNum(value));
  const formatted = key === "calories" ? fmt(amount) : fmtDose(amount, 1);
  return `${formatted}${key === "calories" ? " kcal" : `g ${macroName(key).toLowerCase()}`} ${rawNum(value) >= 0 ? "left" : "over"}`;
}
function macroRemainingText(remaining) {
  return ["calories", "protein", "carbs", "fat"].map((key) => macroRemainingLabel(key, remaining[key])).join(" / ");
}
function remainingAfterMeal(meal, remaining) {
  return {
    calories: rawNum(remaining.calories) - num(meal.calories),
    protein: rawNum(remaining.protein) - rawNum(meal.protein),
    carbs: rawNum(remaining.carbs) - rawNum(meal.carbs),
    fat: rawNum(remaining.fat) - rawNum(meal.fat),
  };
}
function mealFitsRemaining(meal, remaining) {
  if (rawNum(state.macroTargets?.calories) <= 0) return true;
  const calorieNeed = rawNum(remaining.calories);
  const mealCalories = num(meal.calories);
  if (calorieNeed <= 50) return mealCalories <= Math.max(50, calorieNeed);
  return mealCalories <= calorieNeed + Math.max(100, calorieNeed * 0.15);
}
function mealSuggestionScore(meal, remaining) {
  const weights = { calories: 1, protein: 1.5, carbs: 0.7, fat: 0.5 };
  const target = normalizeMacroTargets(state.macroTargets || {});
  return ["calories", "protein", "carbs", "fat"].reduce((score, key) => {
    if (rawNum(target[key]) <= 0) return score;
    const need = rawNum(remaining[key]);
    const value = rawNum(meal[key]);
    if (need <= 0) {
      const targetValue = Math.max(rawNum(target[key]), 1);
      return score - Math.min(value / targetValue, 1) * weights[key] * 0.35;
    }
    const coverage = Math.min(value, need) / need;
    const overshoot = value > need ? (value - need) / Math.max(need, 1) : 0;
    const penalty = key === "calories" ? 0.9 : 0.35;
    return score + (coverage * weights[key]) - Math.min(overshoot, 1.5) * weights[key] * penalty;
  }, 0);
}
function suggestedMeals(limit = 3, remaining = macroRemaining()) {
  if (!macroGapOpen(remaining)) return [];
  return [...(state.savedMeals || [])]
    .map(normalizeMeal)
    .filter((meal) => meal && (meal.calories || meal.protein || meal.carbs || meal.fat))
    .map((meal) => ({ meal, score: mealSuggestionScore(meal, remaining) }))
    .filter((item) => item.score > 0 && mealFitsRemaining(item.meal, remaining))
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
function suggestedMealCombos(limit = 3, remaining = macroRemaining()) {
  if (!macroGapOpen(remaining)) return [];
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
    .filter((item) => item && item.score > 0 && mealFitsRemaining(item.combo, remaining))
    .sort((a, b) => b.score - a.score || num(a.combo.calories) - num(b.combo.calories))
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
  const currentMeals = todayMeals().map(normalizeMeal).filter(Boolean);
  const remaining = macroRemaining(currentMeals);
  if (!macroGapOpen(remaining)) {
    el.innerHTML = `<div class="empty">You are on or above today's targets.</div>`;
    return;
  }
  const suggestions = suggestedMealCombos(3, remaining);
  if (!suggestions.length) {
    el.innerHTML = `<div class="formula-note">Remaining after today's logged meals: ${escapeHtml(macroRemainingText(remaining))}.</div><div class="empty">No saved meals fit the remaining calories and macros. Save a lighter meal or adjust today's target.</div>`;
    return;
  }
  const gap = `<div class="formula-note">Remaining after today's logged meals: ${escapeHtml(macroRemainingText(remaining))}.</div>`;
  el.innerHTML = `${gap}${suggestions.map((meal) => {
    const buttonAttr = meal.meals?.length > 1 ? `data-add-meal-combo="${escapeHtml(meal.id)}"` : `data-add-saved-meal="${escapeHtml(meal.id)}"`;
    const after = remainingAfterMeal(meal, remaining);
    const parts = [meal.meals?.length > 1 ? `${meal.meals.length} saved meals` : "", `Leaves ${macroRemainingText(after)}`].filter(Boolean).join(" / ");
    const extra = parts;
    return mealCardHtml(meal, mealActionButton("Add today", buttonAttr, "primary"), extra);
  }).join("")}`;
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
  renderMealLibrary();
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
      const progress = exerciseLogStatus(log);
      const isOpen = openExerciseCards.has(String(log.exerciseId));
      const startedClass = isOpen && progress.status !== "complete" ? " is-started" : "";
      return `<details class="exercise-log status-${escapeHtml(progress.status)}${startedClass}" data-exercise-id="${escapeHtml(log.exerciseId)}"${isOpen ? " open" : ""}>
        <summary class="exercise-summary">
          <span>
            <strong>${escapeHtml(log.name)}</strong>
            <small>${previous ? `Previous ${previous.date}: ${escapeHtml(setSummary(previous.sets))}` : "No previous sets saved"}</small>
          </span>
          <span class="summary-pill">${escapeHtml(progress.label)}</span>
        </summary>
        <div class="exercise-log-body">
          ${logNotesDropdownHtml(log.notes)}
          ${logTargetDetailsHtml(log.targets)}
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
  const sessions = allWorkoutSessions();
  for (const workout of sessions) {
    if ((workout.createdAt || 0) >= before) continue;
    const log = (workout.exerciseLogs || []).find((entry) => exerciseNamesMatch(entry.name, name) && entry.sets?.length);
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
  return allWorkoutSessions()
    .filter((workout) => (workout.createdAt || 0) < before)
    .flatMap((workout) => (workout.exerciseLogs || [])
      .filter((log) => exerciseNamesMatch(log.name, name) && log.sets?.length)
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
  return `<details class="log-dropdown overload-dropdown">
    <summary>Progressive overload</summary>
    <div class="log-dropdown-body">
      <div class="overload-card">
        <div class="overload-head"><strong>Progressive overload</strong><small>${escapeHtml(overloadSuggestion(log, before))}</small></div>
        <div class="overload-grid">
          <span><small>Last weight</small><strong>${last ? `${fmtWeight(last.weightKg)}kg` : "-"}</strong></span>
          <span><small>Best weight</small><strong>${best ? `${fmtWeight(best.weightKg)}kg` : "-"}</strong></span>
          <span><small>Last reps</small><strong>${last ? fmt(last.reps) : "-"}</strong></span>
          <span><small>Target reps</small><strong>${escapeHtml(targetRepText(log.targets || []))}</strong></span>
        </div>
      </div>
    </div>
  </details>`;
}
function personalRecords(limit = 10) {
  const grouped = new Map();
  for (const workout of allWorkoutSessions()) {
    for (const log of workout.exerciseLogs || []) {
      const key = exerciseMatchKey(log.name);
      if (!key || !log.sets?.length) continue;
      const current = grouped.get(key) || { name: motraExerciseName(log.name), bestSet: null, bestReps: 0, bestVolume: 0, bestEst1rm: 0, dates: [] };
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
  el.innerHTML = records.length ? records.map((record) => `<details class="pr-card pr-accordion" data-pr-exercise="${escapeHtml(exerciseMatchKey(record.name))}">
    <summary class="pr-summary">
      <span><strong>${escapeHtml(record.name)}</strong><small>${record.bestSet ? `Best set ${fmtWeight(record.bestSet.weightKg)}kg x ${fmt(record.bestSet.reps)}` : "No best set yet"}</small></span>
      <span class="summary-pill">PRs</span>
    </summary>
    <div class="pr-metrics">
      <span><small>Best set</small><b>${record.bestSet ? `${fmtWeight(record.bestSet.weightKg)}kg x ${fmt(record.bestSet.reps)}` : "-"}</b></span>
      <span><small>Volume</small><b>${fmtWeight(record.bestVolume)}kg</b></span>
      <span><small>Est. 1RM</small><b>${fmtWeight(record.bestEst1rm)}kg</b></span>
    </div>
  </details>`).join("") : `<div class="empty">Save workout sets to start earning PR badges.</div>`;
}
function setResultText(set) {
  return `${fmtWeight(set.weightKg)}kg x ${fmt(set.reps)}`;
}
function performanceComparisonNote(name, current, previous, source = "saved") {
  if (!current || !previous) return "";
  const exercise = motraExerciseName(name);
  const currentWeight = rawNum(current.weightKg);
  const previousWeight = rawNum(previous.weightKg);
  const currentReps = num(current.reps);
  const previousReps = num(previous.reps);
  const weightDiff = previousWeight - currentWeight;
  if (weightDiff > 0.24) {
    const prefix = source === "draft" ? "Live warning" : "Brutal truth";
    return `${prefix}: you're getting weaker on ${exercise}. Previous best was ${setResultText(previous)}, this one is ${setResultText(current)}. That is ${fmtWeight(weightDiff)}kg missing. Stop donating strength back to the gym and match the old lift next time.`;
  }
  if (currentWeight === previousWeight && currentReps < previousReps) {
    const repDiff = previousReps - currentReps;
    return `Hard truth: ${exercise} stayed at ${fmtWeight(currentWeight)}kg but dropped ${fmt(repDiff)} rep${repDiff === 1 ? "" : "s"} from last time. Same weight, less output. Eat, rest, and win those reps back.`;
  }
  if (currentWeight > previousWeight || (currentWeight === previousWeight && currentReps > previousReps)) {
    return `Good. ${exercise} beat the previous log: ${setResultText(previous)} became ${setResultText(current)}. Finally, numbers moving the right way. Keep the form honest.`;
  }
  return "";
}
function draftExerciseTrendNote() {
  const split = selectedSplit();
  const draft = state.workoutDrafts?.[`${todayKey()}:${split}`];
  if (!draft?.exerciseLogs?.length) return "";
  for (const log of draft.exerciseLogs) {
    const current = summarizeExerciseLog({ log }).bestSet;
    if (!current) continue;
    const previousSession = exerciseSessions(log.name, draft.startedAt || Date.now())[0];
    const previous = previousSession ? summarizeExerciseLog(previousSession).bestSet : null;
    const note = performanceComparisonNote(log.name, current, previous, "draft");
    if (note) return note;
  }
  return "";
}
function latestWorkoutPerformanceNote() {
  const latestWorkout = allWorkoutSessions()[0];
  if (!latestWorkout?.exerciseLogs?.length) return "";
  const before = latestWorkout.createdAt || Date.now();
  for (const log of latestWorkout.exerciseLogs) {
    const current = summarizeExerciseLog({ log }).bestSet;
    if (!current) continue;
    const previousSession = exerciseSessions(log.name, before)[0];
    const previous = previousSession ? summarizeExerciseLog(previousSession).bestSet : null;
    const note = performanceComparisonNote(log.name, current, previous, "saved");
    if (note) return note;
  }
  return "";
}
function exerciseTrendNote() {
  const liveNote = draftExerciseTrendNote();
  if (liveNote) return liveNote;
  const latestNote = latestWorkoutPerformanceNote();
  if (latestNote) return latestNote;
  const records = personalRecords(30);
  for (const record of records) {
    const sessions = exerciseSessions(record.name).slice(0, 3).map((entry) => summarizeExerciseLog(entry));
    if (sessions.length < 2) continue;
    const latest = sessions[0].bestSet;
    const previous = sessions[1].bestSet;
    if (!latest || !previous) continue;
    if (rawNum(latest.weightKg) > rawNum(previous.weightKg) || (rawNum(latest.weightKg) === rawNum(previous.weightKg) && num(latest.reps) > num(previous.reps))) {
      return `${record.name} is actually moving forward. Keep the same form standard and do not turn the next session into a sightseeing tour.`;
    }
    if (sessions.length >= 3 && sessions.every((session) => session.bestSet && rawNum(session.bestSet.weightKg) <= rawNum(previous.weightKg))) {
      return `${record.name} is stuck across recent logs. The numbers are not impressed. Match last week's load first, then steal another rep.`;
    }
  }
  return allWorkoutSessions().length ? "Keep logging proper set detail. Vague workouts get vague advice, and nobody needs that nonsense." : "Log your first full workout. Until there are numbers, the coach is just judging the empty page.";
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
function mealLibraryBlock(title, subtitle, content) {
  return `<section class="meal-library-block">
    <div class="meal-library-head"><strong>${escapeHtml(title)}</strong><small>${escapeHtml(subtitle)}</small></div>
    ${content}
  </section>`;
}
function renderMealLibrary() {
  const el = $("#saved-meal-list");
  if (!el) return;
  const savedMeals = (state.savedMeals || []).map(normalizeMeal).filter(Boolean);
  const recentMeals = uniqueRecentMeals(12);
  const savedHtml = savedMeals.length
    ? savedMeals.map((meal) => mealCardHtml(meal, `${mealActionButton("Add today", `data-add-saved-meal="${escapeHtml(meal.id)}"`, "primary")}${mealActionButton("Delete", `data-delete-saved-meal="${escapeHtml(meal.id)}"`, "danger-button")}`)).join("")
    : `<div class="empty">No saved meals yet. Log a meal and keep Save meal ticked.</div>`;
  const recentHtml = recentMeals.length
    ? recentMeals.map((meal) => mealCardHtml(meal, `${mealActionButton("Add today", `data-add-meal-date="${escapeHtml(meal.date)}" data-add-meal-id="${escapeHtml(meal.id)}"`, "primary")}${mealActionButton("Save", `data-save-meal-date="${escapeHtml(meal.date)}" data-save-meal-id="${escapeHtml(meal.id)}"`, "secondary")}`, dateLabel(meal.date))).join("")
    : `<div class="empty">Previous logged meals will appear here.</div>`;
  el.innerHTML = [
    mealLibraryBlock("Saved Meals", "Favourites you have chosen to keep", savedHtml),
    mealLibraryBlock("Previous Meals", "Unique meals from past days", recentHtml),
  ].join("");
}
function renderPeptides() {
  if (!$("#cycle-peptide")) return;
  if (!userCanUsePeptides()) return;
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
  const effectiveToday = isDateKey(cycle.endedAt) && cycle.endedAt < today ? cycle.endedAt : today;
  const elapsedDays = clamp(daysBetween(cycle.startDate, effectiveToday) + 1, 0, totalDays);
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
    progress: isDateKey(cycle.endedAt) ? 100 : Math.round((elapsedDays / totalDays) * 100),
    week,
    weeks,
    logs,
    totalMg,
    missed,
    next,
    daysLeft: isDateKey(cycle.endedAt) ? 0 : Math.max(0, daysBetween(today, cycle.endDate) + 1),
  };
}
function renderPeptideDashboard() {
  const el = $("#peptide-dashboard");
  if (!el) return;
  const cycles = [...(state.peptideCycles || [])].sort((a, b) => cycleIsActive(b) - cycleIsActive(a) || (b.createdAt || 0) - (a.createdAt || 0));
  el.innerHTML = cycles.length ? cycles.map((cycle) => {
    const data = cycleDashboardData(cycle);
    const status = isDateKey(cycle.endedAt) ? `Ended ${dateLabel(cycle.endedAt)}` : cycleIsActive(cycle) ? `Week ${data.week} of ${data.weeks}` : String(cycle.startDate) > todayKey() ? "Upcoming" : "Complete";
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
  if (!userCanUsePeptides()) {
    el.innerHTML = "";
    return;
  }
  const selected = peptideReminderDate();
  const isToday = selected === todayKey();
  el.innerHTML = `<button class="secondary wide-button peptide-today-button${isToday ? " active" : ""}" data-peptide-reminder-today type="button">Today</button>${peptideReminderDateStripHtml(selected)}${dueDoseCards(true, selected)}`;
  scheduleCalendarScroll();
}
function renderPeptideDueList() {
  const el = $("#peptide-due-list");
  if (!el) return;
  el.innerHTML = dueDoseCards(false, todayKey());
}
function peptideReminderDateStripHtml(selected = peptideReminderDate()) {
  const today = parseDay(todayKey()) || new Date();
  return `<div class="peptide-date-strip" aria-label="Peptide reminder dates">
    ${Array.from({ length: 15 }, (_, index) => {
      const date = dayKey(addDays(today, index - 7));
      const day = parseDay(date) || today;
      const due = dueDoseSlots(date);
      const logged = due.filter((slot) => doseLoggedForSlot(slot, date)).length;
      const isToday = date === todayKey();
      const active = date === selected;
      return `<button class="peptide-date-chip${active ? " active tab-open-pulse" : ""}${due.length ? " has-data" : ""}${isToday ? " is-today" : ""}" data-peptide-reminder-date="${escapeHtml(date)}" type="button" aria-label="${escapeHtml(dateLabel(date))}">
        <span>${escapeHtml(WEEK_DAYS[weekdayIndex(day)].slice(0, 1))}</span>
        <strong>${day.getDate()}</strong>
        <small>${due.length ? `${logged}/${due.length}` : ""}</small>
      </button>`;
    }).join("")}
  </div>`;
}
function dueDoseCards(compact = false, date = todayKey()) {
  const due = (state.peptideCycles || []).filter((cycle) => cycleDueOn(cycle, date));
  if (!due.length) return `<div class="empty">No peptide doses scheduled for ${escapeHtml(dateLabel(date))}.</div>`;
  return due.flatMap((cycle) => (cycle.timings || []).map((timing) => {
    const logged = doseLogForSlot({ cycle, timing }, date);
    const calc = calculateDraw(cycle.peptideId, cycle.vialMg, cycle.diluentMl, cycle.doseMg);
    const action = logged
      ? `<span class="pill">Logged</span>`
      : date === todayKey()
      ? `<button class="primary" data-log-dose="${escapeHtml(cycle.id)}" data-dose-timing="${escapeHtml(timing)}" type="button">Log</button>`
      : date < todayKey()
      ? `<button class="primary" data-log-history-dose="${escapeHtml(cycle.id)}" data-dose-timing="${escapeHtml(timing)}" data-dose-date="${escapeHtml(date)}" type="button">Add dosage</button>`
      : `<span class="pill">Due</span>`;
    return `<div class="dose-card">
      <div class="dose-card-head">
        <div>
          <strong>${escapeHtml(compoundName(cycle.peptideId))}</strong>
          <small>${escapeHtml(timingLabel(timing))} / ${fmtDose(cycle.doseMg)}mg${calc.ok && calc.drawMl ? ` / ${fmtDose(calc.drawMl)}ml${calc.type === "peptide" ? ` / ${fmt(calc.drawUnits)} units` : ""}` : ""}</small>
        </div>
        ${action}
      </div>
      ${compact ? "" : `<div class="dose-meta"><span class="pill">${escapeHtml(dateLabel(cycle.startDate))}</span><span class="pill">${escapeHtml(dateLabel(cycle.endDate))}</span></div>`}
    </div>`;
  })).join("");
}
function renderPeptideCycles() {
  const cycles = [...(state.peptideCycles || [])].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  $("#peptide-cycle-list").innerHTML = cycles.length ? cycles.map((cycle) => {
    const calc = calculateDraw(cycle.peptideId, cycle.vialMg, cycle.diluentMl, cycle.doseMg);
    const ended = isDateKey(cycle.endedAt);
    return `<div class="dose-card">
      <div class="dose-card-head">
        <div>
          <strong>${escapeHtml(compoundName(cycle.peptideId))}</strong>
          <small>${escapeHtml(dateLabel(cycle.startDate))} to ${escapeHtml(dateLabel(cycle.endDate))} / ${fmtDose(cycle.doseMg)}mg per dose${ended ? ` / Ended ${escapeHtml(dateLabel(cycle.endedAt))}` : ""}</small>
        </div>
        <div class="cycle-actions">
          ${ended ? `<span class="pill">Ended</span>` : `<button class="secondary" data-end-cycle="${escapeHtml(cycle.id)}" type="button">End cycle</button>`}
          <button class="danger-button" data-delete-cycle="${escapeHtml(cycle.id)}" type="button">Delete</button>
        </div>
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
  renderConsistencyCalendar();
  renderProgressCheckins();
  let type = state.settings.historyType || "meals";
  if (type === "peptides" && !userCanUsePeptides()) {
    type = "meals";
    state.settings.historyType = "meals";
  }
  $$(".tabs [data-history]").forEach((button) => button.classList.toggle("active", button.dataset.history === type));
  if (type === "meals") return renderMealHistory();
  if (type === "workouts") return renderWorkoutHistory();
  if (type === "peptides") return renderPeptideDayHistory();
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
    return `<button class="history-day${key === selected ? " active" : ""}${counts.total ? " has-data" : ""}${key === todayKey() ? " is-today" : ""}" data-history-day="${escapeHtml(key)}" type="button">
      <span>${escapeHtml(WEEK_DAYS[index])}</span>
      <strong>${day.getDate()}</strong>
      <small>${escapeHtml(historyCountSummary(counts))}</small>
    </button>`;
  }).join("");
  scheduleCalendarScroll();
}
function renderMealHistory() {
  const date = historySelectedDate();
  const meals = (state.meals[date] || []).map(normalizeMeal).filter(Boolean);
  const t = totals(meals);
  const mealsLogged = meals.length
    ? `<div class="meal-list">${meals.map((meal) => mealCardHtml(meal)).join("")}</div>`
    : `<div class="empty">No meals logged for ${escapeHtml(dateLabel(date))}.</div>`;
  $("#history-list").innerHTML = meals.length
    ? `${mealHistoryMacroSummaryHtml(date, meals)}${historyDropdownHtml("Meals Logged", `${dateLabel(date)} / ${meals.length} meals / ${fmt(t.calories)} kcal / ${fmt(t.protein)}p`, "Meals", mealsLogged, "meals-logged-card")}`
    : `${mealHistoryMacroSummaryHtml(date, meals)}${historyDropdownHtml("Meals Logged", `${dateLabel(date)} / 0 meals`, "Meals", mealsLogged, "meals-logged-card")}`;
}
function renderWorkoutHistory() {
  const date = historySelectedDate();
  const sessions = allWorkoutSessions().filter((workout) => workout.date === date);
  const workoutBody = sessions.length ? sessions.map((workout) => {
    const logs = (workout.exerciseLogs || []).filter((log) => log.sets?.length);
    return `<div class="history-card"><div class="history-head"><div><strong>${escapeHtml(workout.name || workout.planTitle || "Workout")}</strong><small>${dateLabel(workout.date)} / ${fmt(workout.durationMin || 0)} min / ${fmt(workout.caloriesBurned || 0)} kcal</small></div><button class="danger-button" data-delete-workout-date="${escapeHtml(workout.date)}" data-delete-workout-id="${escapeHtml(workout.id)}" type="button">Delete</button></div>${logs.length ? `<ul>${logs.map((log) => `<li><strong>${escapeHtml(log.name)}</strong><span>${escapeHtml(setSummary(log.sets))}</span>${guidanceHtml(log.notes)}${targetDetailsHtml(log.targets)}</li>`).join("")}</ul>` : `<div class="empty">No set detail saved.</div>`}</div>`;
  }).join("") : `<div class="empty">No workouts logged for ${escapeHtml(dateLabel(date))}.</div>`;
  $("#history-list").innerHTML = historyDropdownHtml(
    "Workouts Logged",
    `${dateLabel(date)} / ${sessions.length} workout${sessions.length === 1 ? "" : "s"}`,
    "Logs",
    workoutBody,
    "workouts-logged-card"
  );
}
function renderPeptideDayHistory() {
  if (!userCanUsePeptides()) return renderMealHistory();
  const date = historySelectedDate();
  const slots = dueDoseSlots(date);
  const logs = (state.peptideLogs || [])
    .filter((log) => log.date === date)
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  const matchedLogIds = new Set();
  const scheduledTaken = slots.filter((slot) => {
    const log = doseLogForSlot(slot, date);
    if (log?.id) matchedLogIds.add(log.id);
    return Boolean(log);
  }).length;
  const missedCount = slots.filter((slot) => !doseLogForSlot(slot, date) && String(date) < todayKey()).length;
  const totalMg = logs.reduce((sum, log) => sum + rawNum(log.doseMg), 0);
  const overview = `<div class="history-card peptide-history-overview ${missedCount ? "missed" : scheduledTaken || logs.length ? "taken" : "neutral"}">
    <div class="history-head">
      <div>
        <strong>${escapeHtml(dateLabel(date))} peptide history</strong>
        <small>${fmt(logs.length)} dose${logs.length === 1 ? "" : "s"} logged / ${fmt(missedCount)} missed</small>
      </div>
      <span class="history-status-pill ${missedCount ? "missed" : scheduledTaken || logs.length ? "hit" : "neutral"}">${missedCount ? "Missed dose" : scheduledTaken || logs.length ? "Logged" : "No doses"}</span>
    </div>
    <div class="macro-stat-grid">
      <div class="macro-stat"><span>Scheduled</span><strong>${fmt(slots.length)}</strong><small>Due this day</small></div>
      <div class="macro-stat"><span>Taken</span><strong>${fmt(scheduledTaken)}</strong><small>Matched to cycle</small></div>
      <div class="macro-stat"><span>Missed</span><strong>${fmt(missedCount)}</strong><small>Past due only</small></div>
      <div class="macro-stat"><span>Total mg</span><strong>${fmtDose(totalMg, 2)}</strong><small>Logged dose amount</small></div>
    </div>
  </div>`;
  const scheduledHtml = slots.length ? slots.map((slot) => {
    const log = doseLogForSlot(slot, date);
    if (log?.id) matchedLogIds.add(log.id);
    const missed = !log && String(date) < todayKey();
    const status = log ? "taken" : missed ? "missed" : "due";
    const calc = calculateDraw(slot.cycle.peptideId, slot.cycle.vialMg, slot.cycle.diluentMl, slot.cycle.doseMg);
    const draw = calc.ok && calc.drawMl ? ` / ${fmtDose(calc.drawMl)}ml${calc.type === "peptide" ? ` / ${fmt(calc.drawUnits)} units` : ""}` : "";
    return `<div class="dose-card peptide-history-card ${status}">
      <div class="dose-card-head">
        <div>
          <strong>${escapeHtml(compoundName(slot.cycle.peptideId))}</strong>
          <small>${escapeHtml(timingLabel(slot.timing))} / planned ${fmtDose(slot.cycle.doseMg)}mg${draw}</small>
          ${log ? `<small>Taken: ${fmtDose(log.doseMg)}mg${log.drawMl ? ` / ${fmtDose(log.drawMl)}ml` : ""}${log.drawUnits ? ` / ${fmt(log.drawUnits)} units` : ""}</small>` : `<small>${missed ? "This dose was scheduled but not logged." : "Scheduled for this day."}</small>`}
        </div>
        <span class="history-status-pill ${status === "taken" ? "hit" : status}">${status === "taken" ? "Taken" : status === "missed" ? "Missed" : "Due"}</span>
      </div>
      ${log?.notes ? `<small>${escapeHtml(log.notes)}</small>` : ""}
      ${log
        ? `<button class="danger-button" data-delete-dose="${escapeHtml(log.id)}" type="button">Delete log</button>`
        : `<button class="primary wide-button" data-log-history-dose="${escapeHtml(slot.cycle.id)}" data-dose-timing="${escapeHtml(slot.timing)}" data-dose-date="${escapeHtml(date)}" type="button">Add dosage</button>`}
    </div>`;
  }).join("") : `<div class="empty">No peptide doses scheduled for ${escapeHtml(dateLabel(date))}.</div>`;
  const extraLogs = logs.filter((log) => !matchedLogIds.has(log.id));
  const extraHtml = extraLogs.length ? `<div class="history-card">
    <div class="history-head"><div><strong>Extra dosage logs</strong><small>Logged on this date but not matched to a cycle reminder</small></div></div>
    <div class="dose-list">${extraLogs.map((log) => {
      const componentHtml = log.componentDoses?.length ? `<ul class="component-list">${log.componentDoses.map((item) => `<li>${escapeHtml(item.name)}: ${fmtDose(item.mg)}mg</li>`).join("")}</ul>` : "";
      return `<div class="dose-card peptide-history-card taken">
        <div class="dose-card-head">
          <div>
            <strong>${escapeHtml(log.peptideName || compoundName(log.peptideId))}</strong>
            <small>${escapeHtml(timingLabel(log.timing))} / ${fmtDose(log.doseMg)}mg${log.drawMl ? ` / ${fmtDose(log.drawMl)}ml` : ""}${log.drawUnits ? ` / ${fmt(log.drawUnits)} units` : ""}</small>
          </div>
          <button class="danger-button" data-delete-dose="${escapeHtml(log.id)}" type="button">Delete</button>
        </div>
        ${componentHtml}
        ${log.notes ? `<small>${escapeHtml(log.notes)}</small>` : ""}
      </div>`;
    }).join("")}</div>
  </div>` : "";
  $("#history-list").innerHTML = historyDropdownHtml(
    "Peptide Dosage",
    `${dateLabel(date)} / ${fmt(logs.length)} logged / ${fmt(missedCount)} missed`,
    "Dose",
    `${overview}${scheduledHtml}${extraHtml}`,
    `peptide-dosage-card ${missedCount ? "missed" : scheduledTaken || logs.length ? "taken" : "neutral"}`
  );
}
function renderWeightHistory() {
  const date = historySelectedDate();
  const entries = weightEntriesForDate(date);
  $("#history-list").innerHTML = entries.length ? entries.map((m) => `<div class="history-card"><div class="history-head"><div><strong>${dateLabel(date)}</strong><small>${fmtWeight(m.weightKg || m.weight)} kg${rawNum(m.fatPercent) ? ` / ${fmtWeight(m.fatPercent)}% fat` : ""}</small></div><button class="danger-button" data-delete-weight="${escapeHtml(m.id)}" type="button">Delete</button></div></div>`).join("") : `<div class="empty">No weight entries for ${escapeHtml(dateLabel(date))}.</div>`;
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
  const summary = {
    mealsToday: todayMeals().length,
    savedMeals: state.savedMeals.length,
    mealPlans: state.mealPlans.length,
    macroTargets: state.macroTargets,
    workoutSessions: allWorkoutSessions().length,
    weightEntries: state.bodyMetrics.length,
    progressCheckins: state.progressCheckins.length,
    workoutSplits: templateKeys().map((key) => splitTitle(key)),
  };
  if (userCanUsePeptides()) {
    summary.peptideCycles = state.peptideCycles.length;
    summary.peptideDoseLogs = state.peptideLogs.length;
  }
  el.textContent = JSON.stringify(summary, null, 2);
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
function setImportStatus(message = "", isError = false) {
  const el = $("#import-status");
  if (!el) return;
  el.textContent = message;
  el.classList.toggle("error", Boolean(isError));
}
function parseBackupText(text) {
  const clean = String(text || "").replace(/^\uFEFF/, "").trim();
  if (!clean) throw new Error("Choose a backup file or paste backup JSON first.");
  const candidates = [clean];
  const objectStart = clean.indexOf("{");
  const objectEnd = clean.lastIndexOf("}");
  if (objectStart >= 0 && objectEnd > objectStart) candidates.push(clean.slice(objectStart, objectEnd + 1));
  const arrayStart = clean.indexOf("[");
  const arrayEnd = clean.lastIndexOf("]");
  if (arrayStart >= 0 && arrayEnd > arrayStart) candidates.push(clean.slice(arrayStart, arrayEnd + 1));
  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate);
      return typeof parsed === "string" ? JSON.parse(parsed) : parsed;
    } catch {}
  }
  throw new Error("That file is not readable JSON. Choose the backup .json file exported from the old app.");
}
function importStats(data) {
  return {
    meals: Object.values(data.meals || {}).reduce((sum, meals) => sum + (Array.isArray(meals) ? meals.length : 0), 0),
    workouts: Object.values(data.workouts || {}).reduce((sum, workouts) => sum + (Array.isArray(workouts) ? workouts.length : 0), 0),
    savedMeals: Array.isArray(data.savedMeals) ? data.savedMeals.length : 0,
    splits: data.workoutTemplates && typeof data.workoutTemplates === "object" ? Object.keys(data.workoutTemplates).length : 0,
    peptideLogs: Array.isArray(data.peptideLogs) ? data.peptideLogs.length : Array.isArray(data.dosages) ? data.dosages.length : 0,
  };
}
function hasImportableData(data) {
  const stats = importStats(data);
  return stats.meals || stats.workouts || stats.savedMeals || stats.splits || stats.peptideLogs || data.weeklyPlan || data.macroTargets || data.goals;
}
function backupPayload(raw) {
  if (raw?.data && typeof raw.data === "object" && (raw.appName || raw.version || raw.exportedAt)) return raw.data;
  return raw;
}
function importBackup(raw) {
  const data = normalizeImportedData(backupPayload(raw));
  if (!hasImportableData(data)) throw new Error("This backup did not contain meals, workouts, planner data, saved meals or usable logs.");
  const stats = importStats(data);
  const summary = [
    `${stats.meals} meals`,
    `${stats.workouts} workouts`,
    `${stats.savedMeals} saved meals`,
    `${stats.splits} workout splits`,
    ...(userCanUsePeptides() ? [`${stats.peptideLogs} peptide logs`] : []),
  ].join(", ");
  if (!confirm(`Import this backup? It replaces the website data on this device.\n\nFound: ${summary}.`)) {
    setImportStatus("Import cancelled.");
    return;
  }
  state = merge(data);
  save();
  render();
  setImportStatus(`Imported ${summary}.`);
}
async function importText(text) {
  importBackup(parseBackupText(text));
}
async function importFile(file) {
  if (!file) throw new Error("Choose a backup file first.");
  await importText(await file.text());
}
function setAuthGateStatus(message = "", isError = false) {
  const el = $("#auth-gate-status");
  if (!el) return;
  el.textContent = message;
  el.classList.toggle("error", Boolean(isError));
}
function setAuthBusy(busy = false) {
  authBusy = Boolean(busy);
  ["#auth-login-button", "#auth-create-button", "#cloud-login-button", "#cloud-signup-button"].forEach((selector) => {
    const button = $(selector);
    if (button) button.disabled = authBusy;
  });
}
function setMasterBusy(busy = false) {
  masterBusy = Boolean(busy);
  document.querySelectorAll("#master-dashboard-panel button, #master-dashboard-panel input").forEach((el) => { el.disabled = masterBusy; });
}
function setMasterActionStatus(message = "", isError = false) {
  masterActionMessage = message;
  masterActionIsError = Boolean(isError);
  const el = $("#master-action-status");
  if (!el) return;
  el.textContent = message;
  el.classList.toggle("error", Boolean(isError));
}
function setAuthLocked(locked = true) {
  document.body.classList.toggle("auth-locked", Boolean(locked));
  document.body.classList.toggle("auth-ready", !locked);
  if (locked) renderMasterDashboard();
}
function isMasterAccount() {
  return cloudProfile?.role === "master";
}
function profileAllowsPeptides(profile = cloudProfile) {
  if (profile?.role === "master") return true;
  const counts = profile?.data_counts && typeof profile.data_counts === "object" ? profile.data_counts : {};
  return Boolean(counts.allowPeptides || counts.peptidesUnlocked || counts.peptideAccess);
}
function userCanUsePeptides() {
  return profileAllowsPeptides(cloudProfile);
}
function profileDisabled(profile) {
  return Boolean(profile?.data_counts?.disabled || profile?.data_counts?.deletedByMaster);
}
function isPeptideActionButton(button) {
  return Boolean(button?.dataset?.peptideReminderDate || button?.dataset?.peptideReminderToday !== undefined || button?.dataset?.logDose || button?.dataset?.logHistoryDose || button?.dataset?.endCycle || button?.dataset?.deleteCycle || button?.dataset?.deleteDose);
}
function lockDisabledAccount() {
  clearCloudSession();
  state = defaults();
  save({ silent: true, skipCloud: true });
  render();
  setView("today", { persist: false });
  setAuthLocked(true);
  setAuthGateStatus("This account has been deactivated by the master user.", true);
  setCloudStatus("This account has been deactivated by the master user.", true);
}
function isoDisplay(value) {
  if (!value) return "Not yet";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "Not yet" : d.toLocaleString([], { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}
function latestStateActivityIso() {
  const times = [];
  const add = (value) => { const n = rawNum(value); if (n) times.push(n); };
  Object.values(state.meals || {}).flat().forEach((meal) => add(meal.createdAt));
  Object.values(state.workouts || {}).flat().forEach((workout) => add(workout.createdAt));
  (state.peptideLogs || []).forEach((log) => add(log.createdAt));
  (state.bodyMetrics || []).forEach((metric) => add(metric.createdAt));
  (state.progressCheckins || []).forEach((entry) => add(entry.createdAt));
  (state.savedMeals || []).forEach((meal) => add(meal.createdAt));
  return times.length ? new Date(Math.max(...times)).toISOString() : null;
}
function cloudDataCounts(data = state) {
  const meals = Object.values(data.meals || {}).reduce((sum, mealsForDay) => sum + (Array.isArray(mealsForDay) ? mealsForDay.length : 0), 0);
  const workouts = Object.values(data.workouts || {}).reduce((sum, workoutsForDay) => sum + (Array.isArray(workoutsForDay) ? workoutsForDay.length : 0), 0);
  const macroTargets = Object.values(data.macroTargets || {}).filter((value) => rawNum(value)).length;
  return {
    meals,
    workouts,
    savedMeals: Array.isArray(data.savedMeals) ? data.savedMeals.length : 0,
    mealPlans: Array.isArray(data.mealPlans) ? data.mealPlans.length : 0,
    peptideCycles: Array.isArray(data.peptideCycles) ? data.peptideCycles.length : 0,
    peptideLogs: Array.isArray(data.peptideLogs) ? data.peptideLogs.length : 0,
    weights: Array.isArray(data.bodyMetrics) ? data.bodyMetrics.length : 0,
    checkins: Array.isArray(data.progressCheckins) ? data.progressCheckins.length : 0,
    macroTargets,
  };
}
function hasCloudUserData(data = state) {
  return Object.values(cloudDataCounts(data)).some((count) => count > 0);
}
function cloudCountSummary(data = state) {
  const counts = cloudDataCounts(data);
  return userCanUsePeptides()
    ? `${fmt(counts.meals)} meals, ${fmt(counts.workouts)} workouts, ${fmt(counts.peptideLogs)} doses, ${fmt(counts.weights)} weights`
    : `${fmt(counts.meals)} meals, ${fmt(counts.workouts)} workouts, ${fmt(counts.weights)} weights`;
}
function cloudSessionExpiresAt(session) {
  if (!session) return 0;
  if (session.expires_at) return Number(session.expires_at) * 1000;
  return rawNum(session.expiresAt);
}
function saveCloudSession(session, syncEnabled = cloudSession?.syncEnabled || false) {
  if (!session?.access_token) return;
  const expiresAt = session.expires_at ? Number(session.expires_at) * 1000 : Date.now() + (rawNum(session.expires_in) || 3600) * 1000;
  cloudSession = {
    access_token: session.access_token,
    refresh_token: session.refresh_token || cloudSession?.refresh_token || "",
    expiresAt,
    user: session.user || cloudSession?.user || null,
    syncEnabled: Boolean(syncEnabled),
  };
  cloudUser = cloudSession.user;
  try { localStorage.setItem(CLOUD_SESSION_KEY, JSON.stringify(cloudSession)); } catch {}
}
function loadCloudSession() {
  try { cloudSession = JSON.parse(localStorage.getItem(CLOUD_SESSION_KEY) || "null"); } catch { cloudSession = null; }
  if (!cloudSession?.access_token) {
    try {
      cloudSession = JSON.parse(localStorage.getItem(LEGACY_CLOUD_SESSION_KEY) || "null");
      if (cloudSession?.access_token) localStorage.setItem(CLOUD_SESSION_KEY, JSON.stringify(cloudSession));
    } catch { cloudSession = null; }
  }
  cloudUser = cloudSession?.user || null;
}
function clearCloudSession() {
  cloudSession = null;
  cloudUser = null;
  cloudLastSyncedAt = "";
  cloudProfile = null;
  cloudProfiles = [];
  try {
    localStorage.removeItem(CLOUD_SESSION_KEY);
    localStorage.removeItem(LEGACY_CLOUD_SESSION_KEY);
  } catch {}
}
function enableCloudAutoSync() {
  if (!cloudSession) return;
  cloudSession.syncEnabled = true;
  try { localStorage.setItem(CLOUD_SESSION_KEY, JSON.stringify(cloudSession)); } catch {}
}
function cloudAutoSyncReady() {
  return Boolean(cloudUser?.id && cloudSession?.access_token && cloudSession?.syncEnabled);
}
function setCloudStatus(message = "", isError = false) {
  cloudStatusMessage = message || (cloudUser ? "Cloud sync ready." : "Log in or create an account to sync this app across devices.");
  cloudStatusIsError = Boolean(isError);
  renderCloudPanel();
}
function renderCloudPanel() {
  renderFeatureAccess();
  const card = $("#cloud-status-card");
  const email = cloudUser?.email || "";
  const signedIn = Boolean(cloudUser?.id);
  const syncReady = cloudAutoSyncReady();
  if (card) {
    card.classList.toggle("signed-in", signedIn);
    card.innerHTML = `<div>
      <span>${signedIn ? "Logged in" : "Not logged in"}</span>
      <strong>${escapeHtml(signedIn ? email || "Account connected" : "Cloud sync off")}</strong>
      <small>${escapeHtml(signedIn ? `${cloudProfile?.role === "master" ? "Master account. " : ""}${syncReady ? "Future saves sync automatically." : "Choose upload or pull to start automatic sync."}` : "Create an account or log in to use your data on another device.")}</small>
    </div>
    <div>
      <span>This device</span>
      <strong>${escapeHtml(cloudCountSummary())}</strong>
      <small>${escapeHtml(cloudLastSyncedAt ? `Last synced ${cloudLastSyncedAt}` : "Saved locally on this device")}</small>
    </div>`;
  }
  const form = $("#cloud-auth-form");
  if (form) form.hidden = signedIn;
  const logout = $("#cloud-logout-button");
  if (logout) logout.hidden = !signedIn;
  const upload = $("#cloud-upload-button");
  const pull = $("#cloud-pull-button");
  if (upload) upload.disabled = !signedIn;
  if (pull) pull.disabled = !signedIn;
  const status = $("#cloud-sync-status");
  if (status) {
    status.textContent = cloudStatusMessage;
    status.classList.toggle("error", cloudStatusIsError);
  }
  renderMasterDashboard();
}
function friendlyCloudError(error) {
  const text = String(error?.message || error || "Cloud sync failed.");
  if (/rate limit|too many|429|over.*limit|email.*limit/i.test(text)) return "Supabase email limit hit. Wait around 1 hour, turn off email confirmation for manual password accounts, or set up custom SMTP before adding more users.";
  if (/relation .*user_app_state|does not exist|404/i.test(text)) return "Cloud table is not ready yet. Run the Supabase SQL setup first, then try again.";
  if (/relation .*user_profiles|does not exist|user_profiles|profile/i.test(text)) return "Master user tracking is not ready yet. Run the updated Supabase SQL setup first.";
  if (/invalid login|invalid.*credentials/i.test(text)) return "Login failed. Check the email and password.";
  if (/email not confirmed/i.test(text)) return "Check your email and confirm the account, then log in.";
  if (/jwt|expired|unauthorized|invalid token|401/i.test(text)) return "Cloud login expired. Log in again.";
  return text;
}
async function cloudRequest(path, options = {}) {
  const { method = "GET", body = null, auth = true, headers = {} } = options;
  if (auth) await ensureCloudSession();
  const requestHeaders = {
    apikey: SUPABASE_PUBLISHABLE_KEY,
    ...headers,
  };
  if (body !== null) requestHeaders["Content-Type"] = "application/json";
  if (auth && cloudSession?.access_token) requestHeaders.Authorization = `Bearer ${cloudSession.access_token}`;
  const response = await fetch(`${SUPABASE_URL}${path}`, {
    method,
    headers: requestHeaders,
    body: body === null ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  let data = null;
  if (text) {
    try { data = JSON.parse(text); } catch { data = text; }
  }
  if (!response.ok) {
    const message = data?.msg || data?.message || data?.error_description || data?.error || response.statusText;
    throw new Error(message || `Cloud request failed (${response.status}).`);
  }
  return data;
}
async function ensureCloudSession() {
  if (!cloudSession?.access_token) throw new Error("Log in before using cloud sync.");
  if (cloudSessionExpiresAt(cloudSession) > Date.now() + 60000) return cloudSession;
  if (!cloudSession.refresh_token) throw new Error("Cloud login expired. Log in again.");
  const refreshed = await cloudRequest("/auth/v1/token?grant_type=refresh_token", {
    method: "POST",
    auth: false,
    body: { refresh_token: cloudSession.refresh_token },
  });
  saveCloudSession(refreshed, cloudSession.syncEnabled);
  return cloudSession;
}
function cloudAuthValues(form = $("#cloud-auth-form")) {
  const email = form?.elements.email.value.trim() || "";
  const password = form?.elements.password.value || "";
  if (!email || !password) throw new Error("Enter your email and password first.");
  if (password.length < 6) throw new Error("Password must be at least 6 characters.");
  return { email, password };
}
function welcomeSeenKey(email = cloudUser?.email || "") {
  return `${WELCOME_SEEN_PREFIX}${String(cloudUser?.id || email || "local").toLowerCase()}`;
}
function welcomeAlreadyShown(email = cloudUser?.email || "") {
  try { return localStorage.getItem(welcomeSeenKey(email)) === "true"; } catch { return false; }
}
function markWelcomeShown(email = cloudUser?.email || "") {
  try { localStorage.setItem(welcomeSeenKey(email), "true"); } catch {}
}
function showSignupWelcomePopup(options = {}) {
  const { force = false, email = cloudUser?.email || "" } = options;
  if (!force && welcomeAlreadyShown(email)) return;
  markWelcomeShown(email);
  setTimeout(() => {
    $("#signup-welcome-modal")?.remove();
    const modal = document.createElement("div");
    modal.id = "signup-welcome-modal";
    modal.className = "signup-welcome-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-label", "Welcome to Just.Train");
    modal.innerHTML = `<div class="signup-welcome-card">
      <div class="signup-welcome-logo"><img src="assets/logo.svg" alt="" /></div>
      <span class="brand-kicker">Just.Train</span>
      <h2>Welcome to Just.Train</h2>
      <div class="welcome-fatty" aria-label="Fatty">Fatty</div>
      <p>Let's get to work.</p>
      <button class="primary wide-button" data-close-welcome type="button">Start training</button>
    </div>`;
    const close = () => {
      modal.classList.add("leaving");
      setTimeout(() => modal.remove(), 360);
    };
    modal.addEventListener("click", (event) => { if (event.target === modal) close(); });
    modal.querySelector("[data-close-welcome]")?.addEventListener("click", close);
    document.body.appendChild(modal);
    requestAnimationFrame(() => modal.classList.add("show"));
  }, 250);
}
function showWelcomeIfFirstLogin(email = cloudUser?.email || "") {
  showSignupWelcomePopup({ email });
}
async function cloudSignIn(email, password) {
  setCloudStatus("Logging in...");
  setAuthGateStatus("Logging in...");
  const session = await cloudRequest("/auth/v1/token?grant_type=password", {
    method: "POST",
    auth: false,
    body: { email, password },
  });
  saveCloudSession(session, false);
  $("#cloud-auth-form")?.reset();
  $("#auth-gate-form")?.reset();
  setAuthLocked(false);
  setAuthGateStatus("Logged in.");
  await cloudAfterLogin();
  showWelcomeIfFirstLogin(email);
}
async function cloudSignUp(email, password) {
  setCloudStatus("Creating account...");
  setAuthGateStatus("Creating account...");
  const result = await cloudRequest("/auth/v1/signup", {
    method: "POST",
    auth: false,
    body: { email, password },
  });
  if (result?.access_token) {
    saveCloudSession(result, false);
    $("#cloud-auth-form")?.reset();
    $("#auth-gate-form")?.reset();
    setAuthLocked(false);
    setAuthGateStatus("Account created.");
    showSignupWelcomePopup({ force: true, email });
    await cloudAfterLogin();
    return;
  }
  setCloudStatus("Account created. If Supabase asks for email confirmation, confirm it first, then log in.");
  setAuthGateStatus("Account created. Check your email if confirmation is required, then log in.");
  showSignupWelcomePopup({ force: true, email });
}
async function cloudSignOut() {
  try { if (cloudSession?.access_token) await cloudRequest("/auth/v1/logout", { method: "POST" }); } catch {}
  clearCloudSession();
  state = defaults();
  save({ silent: true, skipCloud: true });
  render();
  setView("today", { persist: false });
  setAuthLocked(true);
  setAuthGateStatus("Logged out. Log in to open your account.");
  setCloudStatus("Logged out. The local copy on this device was cleared for privacy.");
  renderCloudPanel();
}
async function upsertCloudProfile(fields = {}) {
  if (!cloudUser?.id) return null;
  const existingCounts = cloudProfile?.data_counts && typeof cloudProfile.data_counts === "object" ? cloudProfile.data_counts : {};
  const payload = {
    user_id: cloudUser.id,
    email: cloudUser.email || "",
    last_seen_at: new Date().toISOString(),
    data_counts: { ...existingCounts, ...cloudDataCounts() },
    last_data_at: latestStateActivityIso(),
    ...fields,
  };
  const rows = await cloudRequest(`/rest/v1/${CLOUD_PROFILE_TABLE}?on_conflict=user_id`, {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    body: payload,
  });
  cloudProfile = Array.isArray(rows) ? rows[0] || cloudProfile : cloudProfile;
  return cloudProfile;
}
async function refreshCloudProfile() {
  if (!cloudUser?.id) return null;
  try {
    const rows = await cloudRequest(`/rest/v1/${CLOUD_PROFILE_TABLE}?select=*&user_id=eq.${encodeURIComponent(cloudUser.id)}`);
    cloudProfile = Array.isArray(rows) ? rows[0] || null : null;
    if (!cloudProfile) cloudProfile = await upsertCloudProfile();
    if (profileDisabled(cloudProfile) && !isMasterAccount()) {
      lockDisabledAccount();
      return cloudProfile;
    }
    refreshPeptideAccessUi();
    return cloudProfile;
  } catch (error) {
    setCloudStatus(friendlyCloudError(error), true);
    return null;
  }
}
async function refreshMasterProfiles() {
  if (!isMasterAccount()) {
    cloudProfiles = [];
    renderMasterDashboard();
    return [];
  }
  try {
    const rows = await cloudRequest(`/rest/v1/${CLOUD_PROFILE_TABLE}?select=*&order=created_at.asc`);
    cloudProfiles = Array.isArray(rows) ? rows : [];
    masterStatusMessage = "";
  } catch (error) {
    cloudProfiles = [];
    masterStatusMessage = friendlyCloudError(error);
  }
  renderMasterDashboard();
  return cloudProfiles;
}
function masterProfileCounts(user = {}) {
  return user.data_counts && typeof user.data_counts === "object" ? user.data_counts : {};
}
function masterUserProtected(user = {}, userId = "") {
  const id = user?.user_id || userId;
  return Boolean(id && id === cloudUser?.id) || user?.role === "master";
}
function masterUserDeleted(user = {}) {
  const counts = masterProfileCounts(user);
  return Boolean(counts.deletedByMaster || counts.hiddenFromMaster);
}
async function masterCreateUser(email, password) {
  if (!isMasterAccount()) throw new Error("Only the master account can create users.");
  const cleanEmail = String(email || "").trim().toLowerCase();
  if (!cleanEmail || !password) throw new Error("Enter the new user's email and password.");
  if (String(password).length < 6) throw new Error("Password must be at least 6 characters.");
  const result = await cloudRequest("/auth/v1/signup", {
    method: "POST",
    auth: false,
    body: { email: cleanEmail, password },
  });
  const createdUserId = result?.user?.id || result?.id || "";
  let profileNote = "";
  if (createdUserId) {
    try {
      await cloudRequest(`/rest/v1/${CLOUD_PROFILE_TABLE}?on_conflict=user_id`, {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
        body: {
          user_id: createdUserId,
          email: cleanEmail,
          role: "user",
          data_counts: { createdByMaster: true, createdByMasterAt: new Date().toISOString() },
        },
      });
    } catch (error) {
      profileNote = ` The login was created, but it will appear in the Master list after the user logs in, or after you run the master admin SQL update.`;
    }
  }
  setMasterActionStatus(`Created login for ${cleanEmail}. If email confirmation is switched on, they must confirm the email before logging in.${profileNote}`);
  setTimeout(refreshMasterProfiles, 900);
}
async function masterPatchProfile(userId, patch = {}) {
  if (!isMasterAccount()) throw new Error("Only the master account can update users.");
  await cloudRequest(`/rest/v1/${CLOUD_PROFILE_TABLE}?user_id=eq.${encodeURIComponent(userId)}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: patch,
  });
}
async function masterSetUserDisabled(userId, disabled) {
  if (!isMasterAccount()) throw new Error("Only the master account can update users.");
  const user = (cloudProfiles || []).find((item) => item.user_id === userId) || {};
  if (masterUserProtected(user, userId)) throw new Error("The master account is protected and cannot be deactivated or deleted.");
  const counts = { ...masterProfileCounts(user), disabled: Boolean(disabled), disabledAt: disabled ? new Date().toISOString() : null };
  if (!disabled) {
    delete counts.disabled;
    delete counts.disabledAt;
    delete counts.deletedByMaster;
    delete counts.deletedAt;
    delete counts.hiddenFromMaster;
  }
  await masterPatchProfile(userId, { data_counts: counts });
  setMasterActionStatus(`${disabled ? "Deactivated" : "Reactivated"} ${user.email || "user"}.`);
  await refreshMasterProfiles();
}
async function masterSetPeptideAccess(userId, allowed) {
  if (!isMasterAccount()) throw new Error("Only the master account can update users.");
  const user = (cloudProfiles || []).find((item) => item.user_id === userId) || {};
  if (masterUserProtected(user, userId)) throw new Error("The master account always has peptide access and cannot be changed here.");
  const counts = { ...masterProfileCounts(user), allowPeptides: Boolean(allowed), peptideAccessUpdatedAt: new Date().toISOString() };
  if (!allowed) delete counts.allowPeptides;
  await masterPatchProfile(userId, { data_counts: counts });
  setMasterActionStatus(`${allowed ? "Unlocked" : "Locked"} peptide features for ${user.email || "user"}.`);
  await refreshMasterProfiles();
}
async function masterDeleteUser(userId) {
  if (!isMasterAccount()) throw new Error("Only the master account can delete user data.");
  const user = (cloudProfiles || []).find((item) => item.user_id === userId) || {};
  if (masterUserProtected(user, userId)) throw new Error("The master account is protected and cannot be deactivated or deleted.");
  await cloudRequest(`/rest/v1/${CLOUD_TABLE}?user_id=eq.${encodeURIComponent(userId)}`, {
    method: "DELETE",
    headers: { Prefer: "return=minimal" },
  });
  await masterPatchProfile(userId, {
    data_counts: { ...masterProfileCounts(user), disabled: true, deletedByMaster: true, hiddenFromMaster: true, deletedAt: new Date().toISOString() },
    last_data_at: null,
    last_synced_at: null,
  });
  setMasterActionStatus(`Deleted ${user.email || "user"} from the Master dashboard and blocked their app access. Their Supabase Auth login still exists.`);
  await refreshMasterProfiles();
}
function renderMasterDashboard() {
  const panel = $("#master-dashboard-panel");
  const master = isMasterAccount();
  if (panel) panel.hidden = !master;
  const summary = $("#master-summary");
  const list = $("#master-user-list");
  const status = $("#master-action-status");
  if (status) {
    status.textContent = masterActionMessage;
    status.classList.toggle("error", masterActionIsError);
  }
  if (!summary || !list) return;
  if (!master) {
    summary.innerHTML = "";
    list.innerHTML = "";
    return;
  }
  const now = Date.now();
  const dayMs = 86400000;
  const users = (cloudProfiles || []).filter((user) => masterUserProtected(user) || !masterUserDeleted(user));
  const activeToday = users.filter((user) => user.last_seen_at && now - new Date(user.last_seen_at).getTime() <= dayMs).length;
  const syncedWeek = users.filter((user) => user.last_synced_at && now - new Date(user.last_synced_at).getTime() <= dayMs * 7).length;
  const enteredWeek = users.filter((user) => user.last_data_at && now - new Date(user.last_data_at).getTime() <= dayMs * 7).length;
  summary.innerHTML = [
    `<div class="dash-card done"><span>Total users</span><strong>${fmt(users.length)}</strong><small>Created accounts with profiles</small></div>`,
    `<div class="dash-card ${activeToday ? "done" : "mid"}"><span>Active today</span><strong>${fmt(activeToday)}</strong><small>Opened the app in the last 24h</small></div>`,
    `<div class="dash-card ${syncedWeek ? "done" : "mid"}"><span>Synced this week</span><strong>${fmt(syncedWeek)}</strong><small>Cloud save updated in 7 days</small></div>`,
    `<div class="dash-card ${enteredWeek ? "done" : "mid"}"><span>Data entered</span><strong>${fmt(enteredWeek)}</strong><small>Logged data in 7 days</small></div>`,
  ].join("");
  if (masterStatusMessage) {
    list.innerHTML = `<div class="empty">${escapeHtml(masterStatusMessage)}</div>`;
    return;
  }
  list.innerHTML = users.length ? users.map((user) => {
    const counts = user.data_counts || {};
    const disabled = profileDisabled(user);
    const protectedUser = masterUserProtected(user);
    const peptideAllowed = profileAllowsPeptides(user);
    const userStatus = user.role === "master" ? "Master account" : disabled ? "Deactivated account" : "User account";
    return `<details class="history-card user-activity-card master-user-card">
      <summary class="master-user-summary">
        <div>
          <strong>${escapeHtml(user.email || "User")}</strong>
          <small>${escapeHtml(userStatus)} / Peptides ${peptideAllowed ? "unlocked" : "locked"}</small>
        </div>
        <span class="user-role-pill ${disabled ? "disabled" : ""}">${escapeHtml(disabled ? "inactive" : user.role || "user")}</span>
      </summary>
      <div class="master-user-detail">
        <div class="activity-grid">
          <div><span>Created</span><strong>${escapeHtml(isoDisplay(user.created_at))}</strong></div>
          <div><span>Last opened</span><strong>${escapeHtml(isoDisplay(user.last_seen_at))}</strong></div>
          <div><span>Last sync</span><strong>${escapeHtml(isoDisplay(user.last_synced_at))}</strong></div>
          <div><span>Last data</span><strong>${escapeHtml(isoDisplay(user.last_data_at))}</strong></div>
        </div>
        <small class="activity-note">${fmt(counts.meals || 0)} meals / ${fmt(counts.workouts || 0)} workouts / ${fmt(counts.peptideLogs || 0)} doses / ${fmt(counts.weights || 0)} weights</small>
        ${protectedUser ? `<div class="protected-master-note">Master account protected. This account always has peptide access and cannot be deleted here.</div>` : `<div class="master-user-actions">
          <button class="secondary" data-master-toggle-peptides="${escapeHtml(user.user_id)}" data-allowed="${peptideAllowed ? "true" : "false"}" type="button">${peptideAllowed ? "Lock peptides" : "Unlock peptides"}</button>
          <button class="secondary" data-master-toggle-user="${escapeHtml(user.user_id)}" data-disabled="${disabled ? "true" : "false"}" type="button">${disabled ? "Reactivate" : "Deactivate"}</button>
          <button class="danger-button wide" data-master-delete-user="${escapeHtml(user.user_id)}" type="button">Delete user</button>
        </div>`}
      </div>
    </details>`;
  }).join("") : `<div class="empty">No user profiles found yet.</div>`;
}
async function fetchCloudState() {
  if (!cloudUser?.id) throw new Error("Log in before using cloud sync.");
  const rows = await cloudRequest(`/rest/v1/${CLOUD_TABLE}?select=data,updated_at&user_id=eq.${encodeURIComponent(cloudUser.id)}`);
  return Array.isArray(rows) ? rows[0] || null : null;
}
async function uploadCloudState() {
  if (!cloudUser?.id) throw new Error("Log in before uploading cloud data.");
  await cloudRequest(`/rest/v1/${CLOUD_TABLE}?on_conflict=user_id`, {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: {
      user_id: cloudUser.id,
      data: clone(state),
      updated_at: new Date().toISOString(),
    },
  });
  try { await upsertCloudProfile({ last_synced_at: new Date().toISOString() }); } catch (error) { setCloudStatus(friendlyCloudError(error), true); }
  enableCloudAutoSync();
  cloudLastSyncedAt = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  setCloudStatus("Cloud saved. Future changes will sync automatically.");
  if (isMasterAccount()) refreshMasterProfiles();
}
async function pullCloudState(confirmFirst = true) {
  const row = await fetchCloudState();
  if (!row?.data) {
    setCloudStatus("No cloud data found yet. Tap Upload this device to create your cloud save.");
    return false;
  }
  if (confirmFirst && hasCloudUserData(state) && !confirm("Pull cloud data onto this device? This replaces the current local data on this device, but your cloud data will stay saved.")) {
    setCloudStatus("Cloud pull cancelled.");
    return false;
  }
  const currentView = activeViewName();
  state = merge(row.data);
  state.settings.activeView = currentView;
  enableCloudAutoSync();
  cloudLastSyncedAt = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  save({ silent: true, skipCloud: true });
  render();
  setCloudStatus(`Cloud data loaded: ${cloudCountSummary()}.`);
  return true;
}
async function cloudAfterLogin() {
  renderCloudPanel();
  try {
    await refreshCloudProfile();
    if (!cloudUser?.id || (profileDisabled(cloudProfile) && !isMasterAccount())) return;
    if (isMasterAccount()) refreshMasterProfiles();
    const row = await fetchCloudState();
    if (row?.data) {
      if (hasCloudUserData(state)) {
        setCloudStatus("Logged in. Cloud data exists. Choose Pull cloud data or Upload this device to start automatic sync.");
      } else {
        await pullCloudState(false);
      }
    } else if (hasCloudUserData(state)) {
      setCloudStatus("Logged in. Tap Upload this device once to move this data into your account.");
    } else {
      enableCloudAutoSync();
      setCloudStatus("Logged in. Start adding data and it will sync automatically.");
    }
  } catch (error) {
    setCloudStatus(friendlyCloudError(error), true);
  }
}
function scheduleCloudSync() {
  if (!cloudAutoSyncReady()) return;
  clearTimeout(cloudSyncTimer);
  cloudSyncTimer = setTimeout(async () => {
    try {
      await uploadCloudState();
    } catch (error) {
      setCloudStatus(friendlyCloudError(error), true);
    }
  }, 1400);
}
async function initCloud() {
  loadCloudSession();
  renderCloudPanel();
  if (!cloudSession?.access_token) {
    authReady = true;
    setAuthLocked(true);
    setAuthGateStatus("Log in or create an account to open Just.Train.");
    return;
  }
  try {
    setAuthGateStatus("Restoring saved login...");
    await ensureCloudSession();
    if (!cloudUser && cloudSession?.access_token) {
      const user = await cloudRequest("/auth/v1/user");
      cloudUser = user;
      saveCloudSession({ ...cloudSession, user }, cloudSession.syncEnabled);
    }
    authReady = true;
    setAuthLocked(false);
    setAuthGateStatus("Logged in.");
    await refreshCloudProfile();
    if (!cloudUser?.id || (profileDisabled(cloudProfile) && !isMasterAccount())) return;
    if (isMasterAccount()) refreshMasterProfiles();
    if (cloudAutoSyncReady() && !hasCloudUserData(state)) await pullCloudState(false);
    else setCloudStatus(cloudAutoSyncReady() ? "Logged in. Future saves sync automatically." : "Logged in. Choose upload or pull to start automatic sync.");
    showWelcomeIfFirstLogin();
  } catch (error) {
    clearCloudSession();
    authReady = true;
    setAuthLocked(true);
    setAuthGateStatus(friendlyCloudError(error), true);
    setCloudStatus(friendlyCloudError(error), true);
  }
}
function setMotraImportStatus(message = "", isError = false) {
  const el = $("#motra-import-status");
  if (!el) return;
  el.textContent = message;
  el.classList.toggle("error", Boolean(isError));
}
function xmlDoc(text) {
  return new DOMParser().parseFromString(text, "application/xml");
}
function columnIndex(cellRef = "") {
  const letters = String(cellRef).replace(/[^A-Z]/gi, "").toUpperCase();
  return letters.split("").reduce((sum, letter) => (sum * 26) + letter.charCodeAt(0) - 64, 0) - 1;
}
async function inflateZipBytes(bytes) {
  if (!("DecompressionStream" in window)) throw new Error("This browser cannot read Excel files directly. Copy the sheet rows and paste them instead.");
  for (const format of ["deflate-raw", "deflate"]) {
    try {
      const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream(format));
      return new Uint8Array(await new Response(stream).arrayBuffer());
    } catch {}
  }
  throw new Error("This Excel file could not be decompressed. Export from Motra as CSV, or copy and paste the rows.");
}
async function unzipEntries(buffer) {
  const bytes = new Uint8Array(buffer);
  const view = new DataView(buffer);
  let eocd = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 66000); i -= 1) {
    if (view.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error("This does not look like a readable .xlsx file.");
  const total = view.getUint16(eocd + 10, true);
  let offset = view.getUint32(eocd + 16, true);
  const decoder = new TextDecoder();
  const entries = {};
  for (let i = 0; i < total; i += 1) {
    if (view.getUint32(offset, true) !== 0x02014b50) break;
    const method = view.getUint16(offset + 10, true);
    const compressedSize = view.getUint32(offset + 20, true);
    const nameLength = view.getUint16(offset + 28, true);
    const extraLength = view.getUint16(offset + 30, true);
    const commentLength = view.getUint16(offset + 32, true);
    const localOffset = view.getUint32(offset + 42, true);
    const name = decoder.decode(bytes.slice(offset + 46, offset + 46 + nameLength));
    const localNameLength = view.getUint16(localOffset + 26, true);
    const localExtraLength = view.getUint16(localOffset + 28, true);
    const start = localOffset + 30 + localNameLength + localExtraLength;
    const compressed = bytes.slice(start, start + compressedSize);
    if (!name.endsWith("/")) entries[name] = method === 0 ? compressed : method === 8 ? await inflateZipBytes(compressed) : null;
    offset += 46 + nameLength + extraLength + commentLength;
  }
  return entries;
}
function sharedStringsFromXml(text) {
  const doc = xmlDoc(text);
  return Array.from(doc.getElementsByTagName("si")).map((item) => item.textContent || "");
}
function rowsFromWorksheetXml(text, sharedStrings = []) {
  const doc = xmlDoc(text);
  return Array.from(doc.getElementsByTagName("row")).map((row) => {
    const values = [];
    Array.from(row.getElementsByTagName("c")).forEach((cell) => {
      const index = columnIndex(cell.getAttribute("r") || "");
      const type = cell.getAttribute("t") || "";
      const raw = cell.getElementsByTagName("v")[0]?.textContent || "";
      const inline = cell.getElementsByTagName("t")[0]?.textContent || "";
      values[index] = type === "s" ? sharedStrings[Number(raw)] || "" : type === "inlineStr" ? inline : raw;
    });
    return values.map((value) => value ?? "");
  });
}
async function xlsxRowsFromFile(file) {
  const entries = await unzipEntries(await file.arrayBuffer());
  const sheetName = Object.keys(entries).find((name) => /^xl\/worksheets\/sheet\d+\.xml$/i.test(name));
  if (!sheetName || !entries[sheetName]) throw new Error("No worksheet was found in this Excel file.");
  const decoder = new TextDecoder();
  const shared = entries["xl/sharedStrings.xml"] ? sharedStringsFromXml(decoder.decode(entries["xl/sharedStrings.xml"])) : [];
  return rowsFromWorksheetXml(decoder.decode(entries[sheetName]), shared);
}
function parseDelimitedLine(line, delimiter) {
  const cells = [];
  let current = "";
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (quoted && line[i + 1] === '"') { current += '"'; i += 1; }
      else quoted = !quoted;
    } else if (char === delimiter && !quoted) {
      cells.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  cells.push(current);
  return cells;
}
function parseLooseMotraLine(line) {
  const clean = String(line || "").trim();
  if (!clean) return [""];
  const meta = clean.match(/^(Workout Start|Workout End|Total Duration \(seconds\)|Total Sets|Burned Calories|Total TVL \(kgs\))\s+(.+)$/i);
  if (meta) return [meta[1], meta[2]];
  if (/^all sets$/i.test(clean)) return ["All Sets"];
  if (/^exercise\s+weight/i.test(clean)) return ["Exercise", "Weight (kgs)", "Reps", "Time (seconds)", "Distance (m)", "Rest Time (seconds)", "Primary Muscle Groups", "Note"];
  const set = clean.match(/^(.+?)\s+(-?\d+(?:\.\d+)?)\s+(\d+)\s+(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)(?:\s+(.+?))?(?:\s{2,}(.+))?$/);
  if (set) return [set[1], set[2], set[3], set[4], set[5], set[6], set[7] || "", set[8] || ""];
  return [clean];
}
function parseMotraTextRows(text) {
  const normalized = String(text || "").replace(/\u00a0/g, " ").replace(/\u2028|\u2029/g, "\n").replace(/\r/g, "");
  const lines = normalized.split("\n");
  const tabRows = lines.filter((line) => line.includes("\t")).length;
  const commaRows = lines.filter((line) => parseDelimitedLine(line, ",").length >= 4).length;
  const looksLikeCsv = commaRows >= 2 || lines.some((line) => /^exercise\s*,\s*weight/i.test(line));
  if (tabRows || looksLikeCsv) {
    const delimiter = tabRows ? "\t" : ",";
    return lines.map((line) => parseDelimitedLine(line, delimiter));
  }
  return lines.map(parseLooseMotraLine);
}
function flattenedMotraSetRows(text) {
  const tokens = String(text || "").trim().split(/\s+/).filter(Boolean);
  const muscleGroups = new Set(["abs", "back", "biceps", "calves", "chest", "core", "forearms", "glutes", "hamstrings", "lats", "quads", "shoulders", "traps", "triceps"]);
  const isNumber = (value) => /^-?\d+(?:\.\d+)?$/.test(value);
  const rows = [];
  let index = 0;
  while (index < tokens.length) {
    let numberIndex = -1;
    for (let cursor = index + 1; cursor < tokens.length - 5; cursor += 1) {
      if (isNumber(tokens[cursor]) && /^\d+$/.test(tokens[cursor + 1]) && isNumber(tokens[cursor + 2]) && isNumber(tokens[cursor + 3]) && isNumber(tokens[cursor + 4])) {
        numberIndex = cursor;
        break;
      }
    }
    if (numberIndex < 0) break;
    const row = [
      tokens.slice(index, numberIndex).join(" "),
      tokens[numberIndex],
      tokens[numberIndex + 1],
      tokens[numberIndex + 2],
      tokens[numberIndex + 3],
      tokens[numberIndex + 4],
    ];
    let cursor = numberIndex + 5;
    const muscles = [];
    while (cursor < tokens.length) {
      const clean = tokens[cursor].replace(/,$/, "").toLowerCase();
      if (muscleGroups.has(clean)) {
        muscles.push(clean);
        cursor += 1;
        continue;
      }
      if (tokens[cursor] === ",") {
        cursor += 1;
        continue;
      }
      break;
    }
    row.push(muscles.join(", "));
    row.push("");
    rows.push(row);
    index = cursor;
  }
  return rows;
}
function parseFlattenedMotraWorkouts(text) {
  const clean = String(text || "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
  if (!clean || clean.includes("\n") || clean.includes("\t")) return [];
  const dayNames = "Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday";
  const blockPattern = new RegExp(`([\\s\\S]*?)\\s+Workout Start\\s+(\\d{4}-\\d{2}-\\d{2}\\s+\\d{2}:\\d{2}:\\d{2})\\s+Workout End\\s+(\\d{4}-\\d{2}-\\d{2}\\s+\\d{2}:\\d{2}:\\d{2})\\s+Total Duration \\(seconds\\)\\s+(\\d+(?:\\.\\d+)?)\\s+Total Sets\\s+(\\d+(?:\\.\\d+)?)\\s+Burned Calories\\s+(\\d+(?:\\.\\d+)?)\\s+Total TVL \\(kgs\\)\\s+(\\d+(?:\\.\\d+)?)[\\s\\S]*?All Sets\\s+Exercise\\s+Weight \\(kgs\\)\\s+Reps\\s+Time \\(seconds\\)\\s+Distance \\(m\\)\\s+Rest Time \\(seconds\\)\\s+Primary Muscle Groups\\s+Note\\s+([\\s\\S]*?)(?=\\s+(?:${dayNames})\\s+[^0-9]+?\\s+Workout Start\\s+\\d{4}-\\d{2}-\\d{2}\\s+\\d{2}:\\d{2}:\\d{2}|$)`, "g");
  const workouts = [];
  let match;
  while ((match = blockPattern.exec(clean))) {
    const sets = flattenedMotraSetRows(match[8]).map(parseMotraSetRow).filter(Boolean);
    if (!sets.length) continue;
    workouts.push({
      title: match[1].trim() || "Motra Workout",
      start: match[2],
      end: match[3],
      durationSeconds: rawNum(match[4]),
      totalSets: num(match[5]),
      caloriesBurned: num(match[6]),
      totalVolume: rawNum(match[7]),
      sets,
    });
  }
  return workouts;
}
function motraWorkoutsFromText(text) {
  const clean = String(text || "").trim();
  if (!clean) throw new Error("The selected Motra file did not contain readable workout text.");
  const rows = parseMotraTextRows(clean);
  const workouts = parseMotraRows(rows);
  if (workouts.length) return workouts;
  const flattened = parseFlattenedMotraWorkouts(clean);
  if (flattened.length) return flattened;
  throw new Error(`No Motra workouts found in this file. I read ${rows.length} rows, but could not find Workout Start and All Sets together.`);
}
function cleanCell(value) {
  return String(value ?? "").trim();
}
function motraFirst(row) {
  return cleanCell(row?.[0]);
}
function motraRowHasOnlyFirst(row) {
  return Boolean(motraFirst(row)) && (row || []).slice(1).every((cell) => !cleanCell(cell));
}
function isMotraTitleRow(rows, index) {
  return motraRowHasOnlyFirst(rows[index]) && /^workout start$/i.test(motraFirst(rows[index + 1]));
}
function isMotraSetHeader(row) {
  return /^exercise$/i.test(motraFirst(row)) && /weight/i.test(cleanCell(row?.[1])) && /reps/i.test(cleanCell(row?.[2]));
}
function parseMotraSetRow(row) {
  const exercise = motraFirst(row);
  if (!exercise || /^(all sets|exercise|heart rate zones|zone \d)$/i.test(exercise)) return null;
  const reps = num(row?.[2]);
  const weightKg = rawNum(row?.[1]);
  const seconds = rawNum(row?.[3]);
  const distanceM = rawNum(row?.[4]);
  const restSeconds = rawNum(row?.[5]);
  if (!reps && !weightKg && !seconds && !distanceM) return null;
  return {
    exercise,
    weightKg,
    reps,
    seconds,
    distanceM,
    restSeconds,
    muscleGroups: cleanCell(row?.[6]),
    note: cleanCell(row?.[7]),
  };
}
function parseMotraRows(rows) {
  const workouts = [];
  for (let i = 0; i < rows.length; i += 1) {
    if (!isMotraTitleRow(rows, i)) continue;
    const workout = { title: motraFirst(rows[i]) || "Motra Workout", meta: {}, sets: [] };
    i += 1;
    for (; i < rows.length; i += 1) {
      if (isMotraTitleRow(rows, i)) { i -= 1; break; }
      const first = motraFirst(rows[i]);
      const second = cleanCell(rows[i]?.[1]);
      if (/^workout start$/i.test(first)) workout.start = second;
      else if (/^workout end$/i.test(first)) workout.end = second;
      else if (/^total duration/i.test(first)) workout.durationSeconds = rawNum(second);
      else if (/^burned calories$/i.test(first)) workout.caloriesBurned = num(second);
      else if (/^total sets$/i.test(first)) workout.totalSets = num(second);
      else if (/^total tvl/i.test(first)) workout.totalVolume = rawNum(second);
      else if (isMotraSetHeader(rows[i])) {
        for (i += 1; i < rows.length; i += 1) {
          if (isMotraTitleRow(rows, i)) { i -= 1; break; }
          const set = parseMotraSetRow(rows[i]);
          if (set) workout.sets.push(set);
        }
      }
    }
    if (workout.sets.length || workout.start) workouts.push(workout);
  }
  if (!workouts.length) {
    const headerIndex = rows.findIndex(isMotraSetHeader);
    if (headerIndex >= 0) {
      const workout = { title: "Motra Imported Workout", start: todayKey(), meta: {}, sets: [] };
      for (let i = headerIndex + 1; i < rows.length; i += 1) {
        const set = parseMotraSetRow(rows[i]);
        if (set) workout.sets.push(set);
      }
      if (workout.sets.length) workouts.push(workout);
    }
  }
  return workouts;
}
function parseMotraDate(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  const raw = cleanCell(value);
  const numeric = Number(raw);
  if (numeric > 30000) return new Date((numeric - 25569) * 86400000);
  const parsed = new Date(raw.includes("T") ? raw : raw.replace(" ", "T"));
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}
function motraWorkoutKey(workout) {
  return `${cleanCell(workout.start)}|${slug(workout.title)}|${workout.sets.length}|${fmt(workout.totalVolume || 0)}`;
}
function motraSessionFromWorkout(workout, batchId, sourceName = "") {
  const started = parseMotraDate(workout.start);
  const ended = workout.end ? parseMotraDate(workout.end) : null;
  const date = dayKey(started);
  const durationMin = workout.durationSeconds ? Math.round(workout.durationSeconds / 60) : ended ? Math.max(1, Math.round((ended - started) / 60000)) : 0;
  const byExercise = new Map();
  for (const set of workout.sets || []) {
    const name = motraExerciseName(set.exercise);
    const key = exerciseMatchKey(name);
    if (!byExercise.has(key)) byExercise.set(key, { exerciseId: `motra-${key}`, name, notes: set.muscleGroups ? `Motra muscle groups: ${set.muscleGroups}` : "", targets: [], sets: [] });
    const log = byExercise.get(key);
    const parts = [
      set.seconds ? `${fmtDose(set.seconds, 1)} sec` : "",
      set.restSeconds ? `${fmt(set.restSeconds)} sec rest` : "",
      set.distanceM ? `${fmtDose(set.distanceM, 1)}m` : "",
      set.muscleGroups ? `Muscles: ${set.muscleGroups}` : "",
      set.note,
    ].filter(Boolean);
    log.sets.push(normalizeLoggedSet({
      id: uid(),
      reps: set.reps,
      weightKg: set.weightKg,
      targetLabel: `Motra set ${log.sets.length + 1}`,
      targetDetails: parts.join(" / "),
      createdAt: started.getTime() + log.sets.length,
    }));
  }
  return normalizeWorkout({
    id: `motra-${batchId}-${slug(workout.title)}-${started.getTime()}`,
    name: workout.title || "Motra Workout",
    type: "strength",
    split: "",
    planTitle: workout.title || "Motra Workout",
    durationMin,
    caloriesBurned: workout.caloriesBurned || 0,
    createdAt: started.getTime(),
    source: "motra",
    importBatchId: batchId,
    importSourceName: sourceName || "Motra import",
    motraKey: motraWorkoutKey(workout),
    motraMeta: { totalSets: workout.totalSets || workout.sets.length, totalVolume: workout.totalVolume || 0 },
    exerciseLogs: Array.from(byExercise.values()),
  }, date);
}
function decodePdfLiteral(value = "") {
  let text = String(value).slice(1, -1);
  text = text.replace(/\\([0-7]{1,3})/g, (_, octal) => String.fromCharCode(Number.parseInt(octal, 8)));
  return text.replace(/\\([nrtbf()\\])/g, (_, char) => ({
    n: "\n",
    r: "\r",
    t: "\t",
    b: "\b",
    f: "\f",
    "(": "(",
    ")": ")",
    "\\": "\\",
  })[char] || char);
}
function decodePdfHex(value = "") {
  const hex = String(value).replace(/[<>\s]/g, "");
  const bytes = [];
  for (let index = 0; index < hex.length; index += 2) bytes.push(Number.parseInt(hex.slice(index, index + 2).padEnd(2, "0"), 16));
  if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) {
    let out = "";
    for (let index = 2; index < bytes.length; index += 2) out += String.fromCharCode(((bytes[index] || 0) << 8) + (bytes[index + 1] || 0));
    return out;
  }
  if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) {
    let out = "";
    for (let index = 2; index < bytes.length; index += 2) out += String.fromCharCode((bytes[index] || 0) + ((bytes[index + 1] || 0) << 8));
    return out;
  }
  return new TextDecoder("iso-8859-1").decode(new Uint8Array(bytes));
}
function extractPdfTextOperators(pdfChunk = "") {
  const text = [];
  const blocks = String(pdfChunk).match(/BT[\s\S]*?ET/g) || [];
  for (const block of blocks) {
    const literals = block.match(/\((?:\\.|[^\\)])*\)/g) || [];
    const hexStrings = block.match(/<([0-9A-Fa-f\s]{4,})>/g) || [];
    text.push(...literals.map(decodePdfLiteral), ...hexStrings.map(decodePdfHex));
  }
  return text.join("\n");
}
function streamStringToBytes(value = "") {
  const bytes = new Uint8Array(value.length);
  for (let index = 0; index < value.length; index += 1) bytes[index] = value.charCodeAt(index) & 255;
  return bytes;
}
async function inflatePdfStream(streamBytes) {
  if (typeof DecompressionStream === "undefined") return "";
  for (const format of ["deflate", "deflate-raw"]) {
    try {
      const inflated = await new Response(new Blob([streamBytes]).stream().pipeThrough(new DecompressionStream(format))).arrayBuffer();
      return new TextDecoder("iso-8859-1").decode(inflated);
    } catch {}
  }
  return "";
}
async function pdfTextFromFile(file) {
  const raw = new TextDecoder("iso-8859-1").decode(await file.arrayBuffer());
  const parts = [extractPdfTextOperators(raw)];
  const streamPattern = /<<[\s\S]*?\/FlateDecode[\s\S]*?>>\s*stream\r?\n?([\s\S]*?)\r?\n?endstream/g;
  for (const match of raw.matchAll(streamPattern)) {
    const inflated = await inflatePdfStream(streamStringToBytes(match[1]));
    if (inflated) parts.push(extractPdfTextOperators(inflated));
  }
  const text = parts.join("\n").replace(/\s+\n/g, "\n").trim();
  if (!text) throw new Error("This PDF did not contain readable Motra text. Export from Motra as Excel, CSV, TSV or TXT, then choose that file here.");
  return text;
}
async function motraWorkoutsFromFile(file) {
  if (!file) throw new Error("Choose a Motra file from Samsung My Files first.");
  const name = String(file.name || "").toLowerCase();
  const type = String(file.type || "");
  const workouts = name.endsWith(".xlsx") || type.includes("spreadsheetml")
    ? parseMotraRows(await xlsxRowsFromFile(file))
    : name.endsWith(".pdf") || type.includes("pdf")
    ? motraWorkoutsFromText(await pdfTextFromFile(file))
    : motraWorkoutsFromText(await file.text());
  if (!workouts.length) throw new Error("No Motra workout rows were found. On Samsung, try saving the Motra export into My Files as Excel, CSV, TSV or TXT.");
  return workouts;
}
function renderMotraPreview() {
  const el = $("#motra-preview-list");
  if (!el) return;
  el.innerHTML = motraImportPreview.length ? `<div class="history-card">
    <div class="history-head"><div><strong>Preview ready</strong><small>${motraImportPreview.length} workouts / ${fmt(motraImportPreview.reduce((sum, workout) => sum + workout.sets.length, 0))} sets</small></div></div>
    <ul>${motraImportPreview.map((workout) => `<li><strong>${escapeHtml(workout.title)}</strong><span>${escapeHtml(cleanCell(workout.start) || "No date")} / ${fmt(workout.sets.length)} sets</span></li>`).join("")}</ul>
  </div>` : "";
}
function existingMotraKeys() {
  return new Set(allWorkoutSessions().filter((workout) => workout.source === "motra" && workout.motraKey).map((workout) => workout.motraKey));
}
function importMotraPreview() {
  if (!motraImportPreview.length) { alert("Preview Motra data first."); return; }
  const batchId = `motra-${Date.now()}`;
  const sourceName = motraImportSourceName || "Motra file upload";
  const existing = existingMotraKeys();
  let added = 0;
  let skipped = 0;
  for (const workout of motraImportPreview) {
    const key = motraWorkoutKey(workout);
    if (existing.has(key)) { skipped += 1; continue; }
    const session = motraSessionFromWorkout(workout, batchId, sourceName);
    const date = metricDateKey(session);
    state.workouts[date] = [session, ...(state.workouts[date] || [])];
    existing.add(key);
    added += 1;
  }
  motraImportPreview = [];
  motraImportSourceName = "";
  save();
  render();
  setMotraImportStatus(`Imported ${added} Motra workouts${skipped ? `, skipped ${skipped} duplicate${skipped === 1 ? "" : "s"}` : ""}.`);
}
function motraImportedSessions() {
  return allWorkoutSessions().filter((workout) => workout.source === "motra").sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}
function renderMotraImportList() {
  const el = $("#motra-import-list");
  if (!el) return;
  const sessions = motraImportedSessions();
  if (!sessions.length) {
    el.innerHTML = `<div class="empty">No Motra workouts imported yet.</div>`;
    return;
  }
  const batches = new Map();
  for (const session of sessions) {
    const batch = session.importBatchId || "motra-unknown";
    if (!batches.has(batch)) batches.set(batch, []);
    batches.get(batch).push(session);
  }
  el.innerHTML = Array.from(batches.entries()).map(([batchId, list]) => {
    const sourceName = list[0]?.importSourceName || "Imported Motra file";
    const dates = list.map((workout) => workout.date).filter(Boolean).sort();
    const range = dates.length > 1 ? `${dateLabel(dates[0])} to ${dateLabel(dates[dates.length - 1])}` : dateLabel(dates[0] || list[0].date);
    return `<div class="history-card">
    <div class="history-head">
      <div><strong>${escapeHtml(sourceName)}</strong><small>${fmt(list.length)} workouts / ${escapeHtml(range)}</small></div>
      <button class="danger-button" data-delete-motra-batch="${escapeHtml(batchId)}" type="button">Delete batch</button>
    </div>
    <ul>${list.map((workout) => `<li><strong>${escapeHtml(workout.name || "Motra Workout")}</strong><span>${escapeHtml(dateLabel(workout.date))} / ${fmt(workout.durationMin)} min / ${fmt((workout.exerciseLogs || []).reduce((sum, log) => sum + (log.sets?.length || 0), 0))} sets</span><button class="danger-button" data-delete-motra-workout="${escapeHtml(workout.id)}" data-delete-motra-date="${escapeHtml(workout.date)}" type="button">Delete workout</button></li>`).join("")}</ul>
  </div>`;
  }).join("");
}
function deleteMotraWorkout(date, id) {
  state.workouts[date] = (state.workouts[date] || []).filter((workout) => workout.id !== id);
  if (!state.workouts[date].length) delete state.workouts[date];
}
function deleteMotraBatch(batchId) {
  for (const date of Object.keys(state.workouts || {})) {
    state.workouts[date] = (state.workouts[date] || []).filter((workout) => workout.importBatchId !== batchId);
    if (!state.workouts[date].length) delete state.workouts[date];
  }
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
  downloadBlob(filename, new Blob([text], { type }));
}
function downloadBlob(filename, blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}
function reportDates(days = 7) {
  const weekStart = startOfWeek(parseDay(todayKey()) || new Date());
  return Array.from({ length: days }, (_, index) => dayKey(addDays(weekStart, index)));
}
function shortDateLabel(date) {
  const d = new Date(`${date}T12:00:00`);
  return Number.isNaN(d.getTime()) ? String(date || "") : d.toLocaleDateString([], { weekday: "short", day: "numeric", month: "short" });
}
function reportLogoSvg() {
  return `<svg class="report-logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" role="img" aria-label="Just.Train logo">
    <defs>
      <linearGradient id="reportBg" x1="124" y1="90" x2="900" y2="934" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#171923"/>
        <stop offset="0.48" stop-color="#075184"/>
        <stop offset="1" stop-color="#0aa7f2"/>
      </linearGradient>
      <linearGradient id="reportShine" x1="233" y1="224" x2="806" y2="767" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#ffffff" stop-opacity="0.92"/>
        <stop offset="1" stop-color="#74d8dd" stop-opacity="0.94"/>
      </linearGradient>
      <filter id="reportShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="28" stdDeviation="36" flood-color="#080812" flood-opacity="0.32"/>
      </filter>
    </defs>
    <rect width="1024" height="1024" rx="224" fill="url(#reportBg)"/>
    <circle cx="760" cy="208" r="210" fill="#ffffff" opacity="0.08"/>
    <circle cx="236" cy="820" r="250" fill="#74d8dd" opacity="0.1"/>
    <g filter="url(#reportShadow)">
      <rect x="214" y="268" width="596" height="58" rx="29" fill="#ffffff" opacity="0.94"/>
      <rect x="158" y="238" width="48" height="118" rx="24" fill="#74d8dd"/>
      <rect x="818" y="238" width="48" height="118" rx="24" fill="#74d8dd"/>
      <rect x="118" y="258" width="36" height="78" rx="18" fill="#ffffff" opacity="0.86"/>
      <rect x="870" y="258" width="36" height="78" rx="18" fill="#ffffff" opacity="0.86"/>
      <path fill="url(#reportShine)" d="M336 390h108v244c0 79-56 132-139 132-53 0-98-19-132-56l64-76c19 20 40 30 62 30 24 0 37-15 37-43V390Z"/>
      <path fill="#ffffff" d="M512 390h330v96H730v280H622V486H512V390Z"/>
      <path fill="#74d8dd" d="M456 704h108l-36 88H420l36-88Z" opacity="0.95"/>
    </g>
  </svg>`;
}
function weekDoseLogs(dates) {
  if (!userCanUsePeptides()) return [];
  const set = new Set(dates);
  return (state.peptideLogs || []).filter((log) => set.has(log.date));
}
function weightValue(entry) {
  return rawNum(entry?.weightKg || entry?.weight);
}
function weekWeightEntries(dates) {
  return dates.flatMap((date) => weightEntriesForDate(date).map((entry) => ({ ...entry, date }))).filter((entry) => weightValue(entry) > 0);
}
function reportActivityForDate(date) {
  const includePeptides = userCanUsePeptides();
  const adherence = dayAdherence(date);
  const meals = mealsForDate(date);
  const workouts = workoutsForDate(date);
  const doses = includePeptides ? (state.peptideLogs || []).filter((log) => log.date === date) : [];
  const progress = progressCheckinsForDate(date);
  const score = (adherence.meals ? 1 : 0) + (adherence.workout ? 1 : 0) + (includePeptides && adherence.peptide ? 1 : 0) + (progress.length ? 1 : 0);
  return { date, adherence, meals, workouts, doses, progress, score };
}
function reportStatRow(label, value, detail, marker) {
  return `<div class="stat-row">
    <span class="stat-marker">${escapeHtml(marker)}</span>
    <div><small>${escapeHtml(label)}</small><strong>${escapeHtml(value)}</strong></div>
    <em>${escapeHtml(detail)}</em>
  </div>`;
}
function listOrEmpty(items, emptyText) {
  return items.length ? items.map((item) => `<li>${item}</li>`).join("") : `<li class="muted">${escapeHtml(emptyText)}</li>`;
}
function reportWeeklyScore(activities, weights) {
  const includePeptides = userCanUsePeptides();
  const days = Math.max(1, activities.length);
  const mealHits = activities.filter((day) => day.adherence.meals).length;
  const workoutHits = activities.filter((day) => Boolean(day.adherence.workout)).length;
  const peptideHits = includePeptides ? activities.filter((day) => day.adherence.peptide).length : 0;
  const trackingDays = new Set([
    ...activities.filter((day) => day.progress.length).map((day) => day.date),
    ...weights.map((entry) => entry.date),
  ]).size;
  const parts = [
    { label: "Meals", score: clamp((mealHits / days) * 100), detail: `${mealHits}/${days} days hit` },
    { label: "Workout plan", score: clamp((workoutHits / days) * 100), detail: `${workoutHits}/${days} days hit or rest` },
    ...(includePeptides ? [{ label: "Peptides", score: clamp((peptideHits / days) * 100), detail: `${peptideHits}/${days} days complete` }] : []),
    { label: "Body tracking", score: clamp((trackingDays / 2) * 100), detail: `${trackingDays} tracking day${trackingDays === 1 ? "" : "s"}` },
  ];
  const weightsMap = includePeptides ? { Meals: 30, "Workout plan": 35, Peptides: 20, "Body tracking": 15 } : { Meals: 35, "Workout plan": 45, "Body tracking": 20 };
  const score = Math.round(parts.reduce((sum, part) => sum + (part.score * weightsMap[part.label]), 0) / parts.reduce((sum, part) => sum + weightsMap[part.label], 0));
  const label = score >= 85 ? "Excellent week" : score >= 70 ? "Strong week" : score >= 50 ? "Building week" : "Needs attention";
  return { score, label, parts, summary: `${mealHits}/${days} meal days / ${workoutHits}/${days} plan days${includePeptides ? ` / ${peptideHits}/${days} peptide days` : ""}` };
}
function weeklyReportData() {
  const includePeptides = userCanUsePeptides();
  const dates = reportDates(7);
  const range = `${dateLabel(dates[0])} to ${dateLabel(dates[dates.length - 1])}`;
  const activities = dates.map(reportActivityForDate);
  const workoutDays = activities.filter((day) => day.workouts.length).length;
  const mealDays = activities.filter((day) => day.meals.length).length;
  const peptideHitDays = includePeptides ? activities.filter((day) => day.adherence.peptide).length : 0;
  const allMeals = dates.flatMap((date) => mealsForDate(date));
  const mealTotals = totals(allMeals);
  const workouts = dates.flatMap((date) => workoutsForDate(date).map((workout) => ({ ...workout, date })));
  const caloriesBurned = workouts.reduce((sum, workout) => sum + rawNum(workout.caloriesBurned), 0);
  const doses = weekDoseLogs(dates);
  const totalMg = doses.reduce((sum, dose) => sum + rawNum(dose.doseMg), 0);
  const weights = weekWeightEntries(dates).sort((a, b) => (a.createdAt || parseDay(a.date)?.getTime?.() || 0) - (b.createdAt || parseDay(b.date)?.getTime?.() || 0));
  const days = Math.max(1, dates.length);
  const macroAverages = {
    calories: mealTotals.calories / days,
    protein: mealTotals.protein / days,
    carbs: mealTotals.carbs / days,
    fat: mealTotals.fat / days,
  };
  const firstWeight = weights[0];
  const lastWeight = weights[weights.length - 1];
  const weightChange = firstWeight && lastWeight ? weightValue(lastWeight) - weightValue(firstWeight) : 0;
  const lightest = weights.length ? Math.min(...weights.map(weightValue)) : 0;
  const heaviest = weights.length ? Math.max(...weights.map(weightValue)) : 0;
  const weightAverage = weights.length ? weights.reduce((sum, entry) => sum + weightValue(entry), 0) / weights.length : 0;
  const progressCount = activities.reduce((sum, day) => sum + day.progress.length, 0);
  const weeklyScore = reportWeeklyScore(activities, weights);
  const bestDay = [...activities].sort((a, b) => b.score - a.score)[0];
  const leastDay = [...activities].sort((a, b) => a.score - b.score)[0];
  const statRows = [
    { label: "Weekly Score", value: `${weeklyScore.score} / 100`, detail: weeklyScore.summary, marker: "WS" },
    { label: "Workout days", value: `${workoutDays} / 7`, detail: `${fmt(caloriesBurned)} kcal burned`, marker: "WT" },
    { label: "Meal days", value: `${mealDays} / 7`, detail: `${fmt(allMeals.length)} meals logged`, marker: "ML" },
    { label: "Total calories eaten", value: `${fmt(mealTotals.calories)}`, detail: `${fmtDose(mealTotals.protein, 1)}g protein`, marker: "KC" },
    { label: "Calories per day", value: `${fmt(macroAverages.calories)} kcal`, detail: "Monday-Sunday average eaten", marker: "AV" },
    { label: "Macros total", value: `${fmtDose(mealTotals.protein, 1)}P/${fmtDose(mealTotals.carbs, 1)}C/${fmtDose(mealTotals.fat, 1)}F`, detail: "Week total grams", marker: "PR" },
    { label: "Macros per day", value: `${fmtDose(macroAverages.protein, 1)}P/${fmtDose(macroAverages.carbs, 1)}C/${fmtDose(macroAverages.fat, 1)}F`, detail: "Monday-Sunday average grams", marker: "MA" },
    ...(includePeptides ? [
      { label: "Peptide adherence", value: `${peptideHitDays} / 7`, detail: `${doses.length} dose logs`, marker: "PE" },
      { label: "Peptide total used", value: `${fmtDose(totalMg, 2)}mg`, detail: "From logged doses", marker: "MG" },
    ] : []),
    { label: "Weight change", value: weights.length ? `${weightChange >= 0 ? "+" : ""}${fmtWeight(weightChange)}kg` : "No entries", detail: weights.length ? `Light ${fmtWeight(lightest)}kg / heavy ${fmtWeight(heaviest)}kg` : "Add weight in History", marker: "BW" },
    { label: "Average weight", value: weights.length ? `${fmtWeight(weightAverage)}kg` : "No entries", detail: weights.length ? `${weights.length} weigh-in${weights.length === 1 ? "" : "s"} this week` : "Add weight in History", marker: "AW" },
    { label: "Body check-ins", value: `${progressCount}`, detail: "Photos, waist, mood and notes", marker: "CI" },
  ];
  const workoutItems = workouts.slice(0, 8).map((workout) => `${escapeHtml(shortDateLabel(workout.date))}: ${escapeHtml(workout.name || workout.planTitle || "Workout")} <span>${fmt(workout.durationMin)} min / ${fmt(workout.caloriesBurned)} kcal</span>`);
  const peptideItems = doses.slice(0, 8).map((dose) => `${escapeHtml(shortDateLabel(dose.date))}: ${escapeHtml(dose.peptideName || compoundName(dose.peptideId))} <span>${fmtDose(dose.doseMg)}mg / ${escapeHtml(timingLabel(dose.timing))}</span>`);
  const checkinItems = activities.flatMap((day) => day.progress.map((entry) => `${escapeHtml(shortDateLabel(day.date))}: ${entry.weightKg ? `${fmtWeight(entry.weightKg)}kg` : "Body check-in"}${entry.waistCm ? ` / ${fmtWeight(entry.waistCm)}cm waist` : ""}${entry.mood ? ` / ${escapeHtml(entry.mood)}` : ""}`)).slice(0, 8);
  const scoreItems = weeklyScore.parts.map((part) => `${escapeHtml(part.label)} <span>${fmt(part.score)}% / ${escapeHtml(part.detail)}</span>`);
  return {
    dates,
    range,
    activities,
    workouts,
    doses,
    weights,
    macroAverages,
    weightAverage,
    weeklyScore,
    bestDay,
    leastDay,
    statRows,
    workoutItems,
    peptideItems,
    checkinItems,
    scoreItems,
    includePeptides,
  };
}
function weeklyReportHtml() {
  const report = weeklyReportData();
  const { range, activities, weeklyScore, bestDay, leastDay, workoutItems, peptideItems, checkinItems, scoreItems, includePeptides } = report;
  const statRows = report.statRows.map((row) => reportStatRow(row.label, row.value, row.detail, row.marker)).join("");
  const dayRows = activities.map((day) => {
    const mealTotal = totals(day.meals);
    const weight = weightEntriesForDate(day.date)[0];
    const mealNames = day.meals.map((meal) => meal.name).join(", ");
    const workoutText = day.workouts.length ? day.workouts.map((workout) => workout.name || workout.planTitle || "Workout").join(", ") : day.adherence.workout === "rest" ? "Rest day" : "None";
    const doseText = day.doses.length ? day.doses.map((dose) => `${dose.peptideName || compoundName(dose.peptideId)} ${fmtDose(dose.doseMg)}mg`).join(", ") : "None logged";
    return `<tr>
      <td><strong>${escapeHtml(shortDateLabel(day.date))}</strong></td>
      <td>${day.meals.length ? `${day.meals.length} meals / ${fmt(mealTotal.calories)} kcal / ${fmtDose(mealTotal.protein, 1)}g P${mealNames ? `<span>${escapeHtml(mealNames)}</span>` : ""}` : "No meals"}</td>
      <td>${escapeHtml(workoutText)}</td>
      ${includePeptides ? `<td>${escapeHtml(doseText)}</td>` : ""}
      <td>${weight ? `${fmtWeight(weight.weightKg || weight.weight)}kg` : "-"}</td>
      <td>${day.progress.length}</td>
    </tr>`;
  }).join("");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${APP_NAME} Weekly Report</title>
  <style>
    :root { color-scheme: dark; --bg:#05172c; --surface:#071f36; --soft:#0d2c49; --ink:#f7fbff; --muted:#91b7d1; --line:#164263; --cyan:#5fe1ff; --blue:#13a8f5; }
    * { box-sizing: border-box; }
    body { margin: 0; background: radial-gradient(circle at 50% -10%, rgba(19,168,245,.5), transparent 30%), linear-gradient(180deg, #08a7ee 0%, #063d72 34%, #04162a 100%); color: var(--ink); font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    .wrap { width: min(860px, 100%); margin: 0 auto; padding: 24px 14px 44px; }
    .sheet { overflow: hidden; border: 1px solid rgba(95,225,255,.16); border-radius: 30px; background: rgba(7,31,54,.96); box-shadow: 0 26px 70px rgba(0,8,20,.36); }
    .top { display: grid; grid-template-columns: 1fr auto; gap: 18px; align-items: center; padding: 24px; background: linear-gradient(135deg, rgba(9,39,66,.96), rgba(13,92,143,.92)); border-bottom: 1px solid rgba(95,225,255,.16); }
    .brand { display: flex; align-items: center; gap: 14px; min-width: 0; }
    .report-logo { width: 70px; height: 70px; border-radius: 22px; box-shadow: 0 16px 34px rgba(19,168,245,.28); flex: 0 0 70px; }
    .brand small, .title small, .stat-row small, .side h3, .daily h3 { display: block; color: var(--cyan); font-size: 12px; font-weight: 950; letter-spacing: 0; text-transform: uppercase; }
    .brand strong { display: block; font-size: 30px; line-height: 1; }
    .brand span, .title span { color: #c7e8fa; font-size: 14px; line-height: 1.35; }
    .title { text-align: right; }
    .title strong { display: block; font-size: 31px; line-height: 1; }
    .hero { display: grid; grid-template-columns: 1.2fr 1fr 1fr; gap: 12px; padding: 18px 24px; border-bottom: 1px solid rgba(95,225,255,.12); }
    .callout { min-height: 94px; padding: 16px; border-radius: 22px; background: rgba(13,44,73,.78); border: 1px solid rgba(95,225,255,.14); }
    .callout small { color: var(--cyan); font-weight: 950; text-transform: uppercase; }
    .callout strong { display: block; margin-top: 7px; font-size: 20px; }
    .callout em { display: block; margin-top: 6px; color: var(--muted); font-style: normal; font-size: 13px; line-height: 1.35; }
    .score-callout { background: linear-gradient(135deg, rgba(19,168,245,.28), rgba(13,44,73,.88)); border-color: rgba(95,225,255,.28); }
    .score-callout strong { font-size: 50px; line-height: .95; }
    .score-callout strong span { color: var(--muted); font-size: 20px; }
    .main { display: grid; grid-template-columns: minmax(0, 1.35fr) minmax(250px, .85fr); gap: 18px; padding: 18px 24px 24px; }
    .stats { display: grid; gap: 9px; }
    .stat-row { display: grid; grid-template-columns: 48px minmax(0, 1fr) minmax(92px, auto); gap: 12px; align-items: center; min-height: 82px; padding: 14px; border-radius: 20px; background: rgba(13,44,73,.86); border: 1px solid rgba(95,225,255,.12); }
    .stat-marker { display: grid; place-items: center; width: 42px; height: 42px; border-radius: 15px; background: rgba(95,225,255,.13); color: var(--cyan); font-weight: 950; font-size: 12px; }
    .stat-row strong { display: block; margin-top: 3px; font-size: 28px; line-height: 1; overflow-wrap: anywhere; }
    .stat-row em { color: var(--muted); font-style: normal; font-size: 13px; line-height: 1.25; text-align: right; }
    .side { display: grid; gap: 12px; align-content: start; }
    .side-card { padding: 15px; border: 1px solid rgba(95,225,255,.12); border-radius: 20px; background: rgba(3,16,31,.32); }
    .side h3, .daily h3 { margin: 0 0 10px; }
    ul { margin: 0; padding: 0; list-style: none; display: grid; gap: 9px; }
    li { color: #d9f1ff; font-size: 13px; line-height: 1.35; }
    li span, td span { display: block; color: var(--muted); }
    .muted { color: var(--muted); }
    .daily { padding: 0 24px 24px; }
    .table-wrap { overflow-x: auto; border: 1px solid rgba(95,225,255,.12); border-radius: 20px; background: rgba(13,44,73,.65); }
    table { width: 100%; min-width: 760px; border-collapse: collapse; }
    th, td { padding: 12px; border-bottom: 1px solid rgba(95,225,255,.1); text-align: left; vertical-align: top; font-size: 13px; line-height: 1.35; }
    th { color: var(--cyan); font-size: 11px; font-weight: 950; text-transform: uppercase; background: rgba(3,16,31,.32); }
    tr:last-child td { border-bottom: 0; }
    @media (max-width: 720px) {
      .top, .hero, .main { grid-template-columns: 1fr; }
      .title { text-align: left; }
      .brand strong, .title strong { font-size: 26px; }
      .stat-row { grid-template-columns: 42px minmax(0, 1fr); }
      .stat-row em { grid-column: 2; text-align: left; }
    }
  </style>
</head>
<body>
  <main class="wrap">
    <section class="sheet">
      <header class="top">
        <div class="brand">
          ${reportLogoSvg()}
          <div><small>Just.Train</small><strong>Weekly Stats</strong><span>${escapeHtml(range)}</span></div>
        </div>
        <div class="title"><small>Generated</small><strong>${escapeHtml(shortDateLabel(todayKey()))}</strong><span>${escapeHtml(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }))}</span></div>
      </header>
      <section class="hero">
        <div class="callout score-callout"><small>Weekly Score</small><strong>${weeklyScore.score}<span>/100</span></strong><em>${escapeHtml(weeklyScore.label)} / ${escapeHtml(weeklyScore.summary)}</em></div>
        <div class="callout"><small>Most complete day</small><strong>${escapeHtml(shortDateLabel(bestDay?.date))}</strong><span>${bestDay?.score || 0} of ${includePeptides ? 4 : 3} markers hit</span></div>
        <div class="callout"><small>Least complete day</small><strong>${escapeHtml(shortDateLabel(leastDay?.date))}</strong><span>${leastDay?.score || 0} of ${includePeptides ? 4 : 3} markers hit</span></div>
      </section>
      <section class="main">
        <div class="stats">${statRows}</div>
        <aside class="side">
          <div class="side-card"><h3>Score Breakdown</h3><ul>${listOrEmpty(scoreItems, "No score data yet.")}</ul></div>
          <div class="side-card"><h3>Workouts</h3><ul>${listOrEmpty(workoutItems, "No workouts logged this week.")}</ul></div>
          ${includePeptides ? `<div class="side-card"><h3>Peptides</h3><ul>${listOrEmpty(peptideItems, "No peptide doses logged this week.")}</ul></div>` : ""}
          <div class="side-card"><h3>Body Check-Ins</h3><ul>${listOrEmpty(checkinItems, "No body check-ins logged this week.")}</ul></div>
        </aside>
      </section>
      <section class="daily">
        <h3>Daily Breakdown</h3>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Day</th><th>Meals</th><th>Workout</th>${includePeptides ? "<th>Peptides</th>" : ""}<th>Weight</th><th>Check-ins</th></tr></thead>
            <tbody>${dayRows}</tbody>
          </table>
        </div>
      </section>
    </section>
  </main>
</body>
</html>`;
}
function pdfSafeText(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[^\x20-\x7E]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
function pdfEscape(value) {
  return pdfSafeText(value).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}
function pdfWrap(value, limit = 34) {
  const words = pdfSafeText(value).split(" ").filter(Boolean);
  const lines = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > limit && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [""];
}
function pdfRgb(hex) {
  const value = String(hex || "000000").replace("#", "");
  const n = Number.parseInt(value, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255].map((item) => Number(item.toFixed(4)));
}
function pdfByteLength(text) {
  return new TextEncoder().encode(text).length;
}
function createPdfBlob(pageStreams) {
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
  ];
  const pageIds = [];
  for (const stream of pageStreams) {
    const pageId = objects.length + 1;
    const contentId = objects.length + 2;
    pageIds.push(pageId);
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentId} 0 R >>`);
    objects.push(`<< /Length ${pdfByteLength(stream)} >>\nstream\n${stream}endstream`);
  }
  objects[1] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`;
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets[index + 1] = pdfByteLength(pdf);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefAt = pdfByteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let index = 1; index <= objects.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefAt}\n%%EOF`;
  return new Blob([pdf], { type: "application/pdf" });
}
function weeklyReportPdfBlob() {
  const report = weeklyReportData();
  const width = 595;
  const height = 842;
  const margin = 36;
  const gap = 10;
  const pages = [];
  let page = null;
  let y = 0;
  const fill = (hex) => `${pdfRgb(hex).join(" ")} rg`;
  const stroke = (hex) => `${pdfRgb(hex).join(" ")} RG`;
  const write = (cmd) => { page.stream += cmd; };
  const rect = (x, yPos, w, h, color) => write(`q ${fill(color)} ${x} ${yPos} ${w} ${h} re f Q\n`);
  const roundRect = (x, yPos, w, h, r, color) => {
    const k = 0.5522847498;
    const c = r * k;
    write(`q ${fill(color)} ${x + r} ${yPos} m ${x + w - r} ${yPos} l ${x + w - r + c} ${yPos} ${x + w} ${yPos + r - c} ${x + w} ${yPos + r} c ${x + w} ${yPos + h - r} l ${x + w} ${yPos + h - r + c} ${x + w - r + c} ${yPos + h} ${x + w - r} ${yPos + h} c ${x + r} ${yPos + h} l ${x + r - c} ${yPos + h} ${x} ${yPos + h - r + c} ${x} ${yPos + h - r} c ${x} ${yPos + r} l ${x} ${yPos + r - c} ${x + r - c} ${yPos} ${x + r} ${yPos} c f Q\n`);
  };
  const circle = (cx, cy, r, color) => {
    const k = 0.5522847498;
    const c = r * k;
    write(`q ${fill(color)} ${cx + r} ${cy} m ${cx + r} ${cy + c} ${cx + c} ${cy + r} ${cx} ${cy + r} c ${cx - c} ${cy + r} ${cx - r} ${cy + c} ${cx - r} ${cy} c ${cx - r} ${cy - c} ${cx - c} ${cy - r} ${cx} ${cy - r} c ${cx + c} ${cy - r} ${cx + r} ${cy - c} ${cx + r} ${cy} c f Q\n`);
  };
  const line = (x1, y1, x2, y2, color = "164263") => write(`q ${stroke(color)} 1 w ${x1} ${y1} m ${x2} ${y2} l S Q\n`);
  const text = (value, x, yPos, size = 10, bold = false, color = "F7FBFF") => {
    write(`q ${fill(color)} BT /${bold ? "F2" : "F1"} ${size} Tf ${x} ${yPos} Td (${pdfEscape(value)}) Tj ET Q\n`);
  };
  const wrappedText = (value, x, yPos, maxChars, size = 9, bold = false, color = "91B7D1", maxLines = 2, leading = 11) => {
    pdfWrap(value, maxChars).slice(0, maxLines).forEach((item, index) => text(item, x, yPos - (index * leading), size, bold, color));
  };
  const logoPath = (x, yPos, size, ops, color) => {
    const s = (value) => (value / 1024) * size;
    const point = (px, py) => `${x + s(px)} ${yPos + size - s(py)}`;
    let d = "";
    for (const op of ops) {
      if (op[0] === "M") d += `${point(op[1], op[2])} m `;
      if (op[0] === "L") d += `${point(op[1], op[2])} l `;
      if (op[0] === "C") d += `${point(op[1], op[2])} ${point(op[3], op[4])} ${point(op[5], op[6])} c `;
      if (op[0] === "Z") d += "h ";
    }
    write(`q ${fill(color)} ${d}f Q\n`);
  };
  const drawLogo = (x, yPos, size) => {
    const s = (value) => (value / 1024) * size;
    roundRect(x, yPos, size, size, s(224), "075184");
    circle(x + s(760), yPos + size - s(208), s(210), "0A7EBD");
    circle(x + s(236), yPos + size - s(820), s(250), "0AA7F2");
    roundRect(x + s(214), yPos + size - s(326), s(596), s(58), s(29), "F7FBFF");
    roundRect(x + s(158), yPos + size - s(356), s(48), s(118), s(24), "74D8DD");
    roundRect(x + s(818), yPos + size - s(356), s(48), s(118), s(24), "74D8DD");
    roundRect(x + s(118), yPos + size - s(336), s(36), s(78), s(18), "D9F1FF");
    roundRect(x + s(870), yPos + size - s(336), s(36), s(78), s(18), "D9F1FF");
    logoPath(x, yPos, size, [
      ["M", 336, 390], ["L", 444, 390], ["L", 444, 634],
      ["C", 444, 713, 388, 766, 305, 766],
      ["C", 252, 766, 207, 747, 173, 710],
      ["L", 237, 634],
      ["C", 256, 654, 277, 664, 299, 664],
      ["C", 323, 664, 336, 649, 336, 621],
      ["L", 336, 390], ["Z"],
    ], "EAF8FF");
    logoPath(x, yPos, size, [
      ["M", 512, 390], ["L", 842, 390], ["L", 842, 486], ["L", 730, 486],
      ["L", 730, 766], ["L", 622, 766], ["L", 622, 486], ["L", 512, 486], ["Z"],
    ], "FFFFFF");
    logoPath(x, yPos, size, [
      ["M", 456, 704], ["L", 564, 704], ["L", 528, 792], ["L", 420, 792], ["L", 456, 704], ["Z"],
    ], "74D8DD");
  };
  const card = (x, topY, w, h, color = "0D2C49") => {
    roundRect(x, topY - h, w, h, 12, color);
    return topY - h;
  };
  const metricCard = (x, topY, w, h, label, value, detail, marker = "", color = "0D2C49") => {
    const bottom = card(x, topY, w, h, color);
    if (marker) {
      roundRect(x + 10, topY - 34, 30, 24, 7, "092742");
      text(marker, x + 16, topY - 25, 7, true, "5FE1FF");
    }
    const textX = marker ? x + 50 : x + 13;
    const compact = h < 70;
    const valueText = pdfSafeText(value);
    const valueSize = compact && valueText.length > 17 ? 10 : compact ? 12 : 18;
    text(label, textX, topY - 16, 7, true, "5FE1FF");
    wrappedText(valueText, textX, compact ? topY - 33 : topY - 38, Math.floor((w - (marker ? 60 : 22)) / 5.4), valueSize, true, "F7FBFF", 1, 12);
    wrappedText(detail, textX, bottom + 12, Math.floor((w - (marker ? 60 : 22)) / 5.2), 8, false, "91B7D1", h >= 64 ? 2 : compact ? 1 : 2, 10);
  };
  const addPage = (title = "") => {
    page = { stream: "" };
    pages.push(page);
    rect(0, 0, width, height, "05172C");
    rect(0, height - 76, width, 76, "071F36");
    drawLogo(margin, height - 58, 40);
    text("Just.Train", margin + 52, height - 33, 8, true, "5FE1FF");
    text(title || "Weekly Report", margin + 52, height - 54, 18, true);
    text(report.range, width - margin - 146, height - 39, 9, false, "C7E8FA");
    y = height - 104;
  };
  const ensureSpace = (space, title = "Weekly Stats") => {
    if (y - space < 48) addPage(title);
  };
  addPage("Weekly Report");
  text("Weekly Overview", margin, y, 23, true, "F7FBFF");
  text(`Generated ${shortDateLabel(todayKey())}`, width - margin - 128, y + 3, 8, false, "91B7D1");
  y -= 24;
  const contentW = width - (margin * 2);
  const heroW = (contentW - (gap * 2)) / 3;
  metricCard(margin, y, heroW, 74, "Weekly Score", `${report.weeklyScore.score}/100`, `${report.weeklyScore.label} / ${report.weeklyScore.summary}`, "", "0B5D91");
  metricCard(margin + heroW + gap, y, heroW, 74, "Most Complete", shortDateLabel(report.bestDay?.date), `${report.bestDay?.score || 0} of ${report.includePeptides ? 4 : 3} markers hit`);
  metricCard(margin + ((heroW + gap) * 2), y, heroW, 74, "Least Complete", shortDateLabel(report.leastDay?.date), `${report.leastDay?.score || 0} of ${report.includePeptides ? 4 : 3} markers hit`);
  y -= 92;
  text("Weekly Averages", margin, y, 14, true, "5FE1FF");
  y -= 12;
  const averageLabels = new Set(["Calories per day", "Macros per day", "Average weight"]);
  const averageRows = report.statRows.filter((row) => averageLabels.has(row.label));
  averageRows.forEach((row, index) => metricCard(margin + (index * (heroW + gap)), y, heroW, 66, row.label, row.value, row.detail, row.marker));
  y -= 86;
  text("Key Stats", margin, y, 14, true, "5FE1FF");
  y -= 14;
  const skipLabels = new Set(["Weekly Score", ...averageLabels]);
  const stats = report.statRows.filter((row) => !skipLabels.has(row.label));
  const statW = (contentW - gap) / 2;
  const statH = 56;
  for (let index = 0; index < stats.length; index += 1) {
    const col = index % 2;
    if (col === 0) ensureSpace(statH + 8, "Weekly Stats");
    metricCard(margin + (col * (statW + gap)), y, statW, statH, stats[index].label, stats[index].value, stats[index].detail, stats[index].marker);
    if (col === 1) y -= statH + 8;
  }
  addPage("Daily Breakdown");
  text("Daily Breakdown", margin, y, 15, true, "5FE1FF");
  y -= 22;
  const cols = report.includePeptides
    ? [
      { label: "Day", x: margin, w: 70 },
      { label: "Meals", x: margin + 78, w: 150 },
      { label: "Workout", x: margin + 236, w: 106 },
      { label: "Peptides", x: margin + 350, w: 92 },
      { label: "Weight", x: margin + 450, w: 62 },
    ]
    : [
      { label: "Day", x: margin, w: 70 },
      { label: "Meals", x: margin + 82, w: 184 },
      { label: "Workout", x: margin + 276, w: 156 },
      { label: "Weight", x: margin + 444, w: 62 },
    ];
  rect(margin, y - 20, width - (margin * 2), 24, "0D2C49");
  cols.forEach((col) => text(col.label, col.x, y - 12, 8, true, "5FE1FF"));
  y -= 32;
  for (const day of report.activities) {
    ensureSpace(66, "Daily Breakdown");
    const rowY = y - 54;
    const mealTotal = totals(day.meals);
    const weight = weightEntriesForDate(day.date)[0];
    const workoutText = day.workouts.length ? day.workouts.map((workout) => workout.name || workout.planTitle || "Workout").join(", ") : day.adherence.workout === "rest" ? "Rest day" : "None";
    const mealText = day.meals.length ? `${day.meals.length} meals / ${fmt(mealTotal.calories)} kcal / ${fmtDose(mealTotal.protein, 1)}g P` : "No meals";
    rect(margin, rowY, width - (margin * 2), 54, "071F36");
    text(shortDateLabel(day.date), cols[0].x, rowY + 34, 10, true);
    wrappedText(mealText, cols[1].x, rowY + 36, 25, 8, false, "D9F1FF", 3, 10);
    wrappedText(workoutText, cols[2].x, rowY + 36, report.includePeptides ? 18 : 24, 8, false, "D9F1FF", 3, 10);
    if (report.includePeptides) {
      const doseText = day.doses.length ? day.doses.map((dose) => `${dose.peptideName || compoundName(dose.peptideId)} ${fmtDose(dose.doseMg)}mg`).join(", ") : "None";
      wrappedText(doseText, cols[3].x, rowY + 36, 16, 8, false, "D9F1FF", 3, 10);
    }
    const weightCol = report.includePeptides ? cols[4] : cols[3];
    text(weight ? `${fmtWeight(weight.weightKg || weight.weight)}kg` : "-", weightCol.x, rowY + 34, 9, true, weight ? "F7FBFF" : "91B7D1");
    line(margin, rowY, width - margin, rowY, "164263");
    y -= 62;
  }
  pages.forEach((item, index) => {
    item.stream += `q ${fill("91B7D1")} BT /F1 8 Tf ${width - margin - 24} 24 Td (${index + 1}/${pages.length}) Tj ET Q\n`;
  });
  return createPdfBlob(pages.map((item) => item.stream));
}
function exportWeeklyReport() {
  downloadBlob(`${BACKUP_PREFIX}-weekly-report-${todayKey()}.pdf`, weeklyReportPdfBlob());
}

function bind() {
  document.addEventListener("click", async (event) => {
    const button = event.target.closest?.("button");
    if (button) {
      lastSaveTrigger = button;
      lastSaveTriggerAt = Date.now();
    }
  }, true);
  document.addEventListener("click", async (event) => {
    const button = event.target.closest?.("button");
    if (!isDeleteButton(button) || button.dataset.deletePulseDone === "true") return;
    event.preventDefault();
    event.stopImmediatePropagation();
    flashDeleted(button);
    setTimeout(() => {
      if (!button.isConnected) return;
      button.dataset.deletePulseDone = "true";
      button.click();
      delete button.dataset.deletePulseDone;
    }, 260);
  }, true);
  document.addEventListener("submit", (event) => {
    lastSaveTrigger = event.submitter || event.target.querySelector?.('button[type="submit"]') || lastSaveTrigger;
    lastSaveTriggerAt = Date.now();
  }, true);
  document.addEventListener("click", (event) => {
    const summary = event.target.closest?.("summary");
    const panel = summary?.parentElement;
    if (!panel?.matches?.("details") || !panel.open) return;
    event.preventDefault();
    if (panel.classList.contains("tab-closing")) return;
    closeTabSmooth(panel);
  }, true);
  document.addEventListener("click", async (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    if (isPeptideActionButton(button) && !userCanUsePeptides()) return;
    if (button.dataset.seeMorePanels !== undefined) {
      const view = button.closest(".view");
      view?.classList.toggle("show-extra-panels");
      renderPanelLimit();
    }
    if (button.dataset.masterRefresh !== undefined) {
      setMasterActionStatus("Refreshing users...");
      refreshMasterProfiles();
      return;
    }
    if (button.dataset.masterToggleUser) {
      const disabled = button.dataset.disabled === "true";
      if (!confirm(`${disabled ? "Reactivate" : "Deactivate"} this user's app access?`)) return;
      setMasterBusy(true);
      try {
        await masterSetUserDisabled(button.dataset.masterToggleUser, !disabled);
      } catch (err) {
        setMasterActionStatus(friendlyCloudError(err), true);
      } finally {
        setMasterBusy(false);
      }
      return;
    }
    if (button.dataset.masterTogglePeptides) {
      const allowed = button.dataset.allowed === "true";
      if (!confirm(`${allowed ? "Lock" : "Unlock"} peptide features for this user?`)) return;
      setMasterBusy(true);
      try {
        await masterSetPeptideAccess(button.dataset.masterTogglePeptides, !allowed);
      } catch (err) {
        setMasterActionStatus(friendlyCloudError(err), true);
      } finally {
        setMasterBusy(false);
      }
      return;
    }
    if (button.dataset.masterDeleteUser) {
      if (!confirm("Delete this user from the Master dashboard, remove their Just.Train app data and block app access? This does not delete the Supabase Auth login.")) return;
      setMasterBusy(true);
      try {
        await masterDeleteUser(button.dataset.masterDeleteUser);
      } catch (err) {
        setMasterActionStatus(friendlyCloudError(err), true);
      } finally {
        setMasterBusy(false);
      }
      return;
    }
    if (button.dataset.deleteMotraBatch) {
      if (confirm("Delete every workout from this Motra import batch?")) {
        deleteMotraBatch(button.dataset.deleteMotraBatch);
        save(); render();
        setMotraImportStatus("Deleted Motra import batch.");
      }
      return;
    }
    if (button.dataset.deleteMotraWorkout) {
      if (confirm("Delete this imported Motra workout?")) {
        deleteMotraWorkout(button.dataset.deleteMotraDate, button.dataset.deleteMotraWorkout);
        save(); render();
        setMotraImportStatus("Deleted Motra workout.");
      }
      return;
    }
    if (button.dataset.openMotraImport !== undefined) {
      setView("settings");
      const panel = $("#motra-import-panel");
      if (panel) {
        document.querySelectorAll("#view-settings > details[open]").forEach((detail) => { if (detail !== panel) detail.open = false; });
        panel.open = true;
        requestAnimationFrame(() => panel.scrollIntoView({ behavior: "smooth", block: "start" }));
      }
      return;
    }
    if (button.dataset.view) setView(button.dataset.view);
    if (button.dataset.logToday !== undefined) { state.settings.selectedSplit = selectedSplit(true); state.settings.selectedSplitDate = todayKey(); setView("log"); render(); }
    if (button.dataset.addSavedMeal) {
      const meal = (state.savedMeals || []).find((item) => item.id === button.dataset.addSavedMeal);
      if (!meal) return;
      runMealLibraryAddFeedback(button, () => {
        addMealToToday(meal);
        save(); render();
      });
      return;
    }
    if (button.dataset.addMealDate && button.dataset.addMealId) {
      const meal = (state.meals[button.dataset.addMealDate] || []).find((item) => item.id === button.dataset.addMealId);
      if (!meal) return;
      runMealLibraryAddFeedback(button, () => {
        addMealToToday(meal);
        save(); render();
      });
      return;
    }
    if (button.dataset.addMealCombo) {
      const ids = button.dataset.addMealCombo.split(",").filter(Boolean);
      const meals = ids.map((id) => (state.savedMeals || []).find((item) => item.id === id)).filter(Boolean);
      if (!meals.length) return;
      meals.forEach(addMealToToday);
      save(); render();
    }
    if (button.dataset.applyMealPlan) {
      const plan = (state.mealPlans || []).find((item) => item.id === button.dataset.applyMealPlan);
      if (!plan) return;
      (plan.meals || []).forEach(addMealToToday);
      save(); render();
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
    if (button.dataset.peptideReminderDate) {
      state.settings.peptideReminderDate = button.dataset.peptideReminderDate;
      save(); renderTodayPeptideReminders();
    }
    if (button.dataset.peptideReminderToday !== undefined) {
      state.settings.peptideReminderDate = todayKey();
      save(); renderTodayPeptideReminders();
    }
    if (button.dataset.logDose) {
      const cycle = (state.peptideCycles || []).find((item) => item.id === button.dataset.logDose);
      const timing = button.dataset.doseTiming || "morning";
      if (!cycle || doseAlreadyLogged(cycle.id, timing)) return;
      const log = doseLogFromCycle(cycle, timing);
      state.peptideLogs = [log, ...(state.peptideLogs || [])];
      save(); renderPeptides(); renderToday();
    }
    if (button.dataset.logHistoryDose) {
      const cycle = (state.peptideCycles || []).find((item) => item.id === button.dataset.logHistoryDose);
      const timing = button.dataset.doseTiming || "morning";
      const date = isDateKey(button.dataset.doseDate) ? button.dataset.doseDate : historySelectedDate();
      if (!cycle || doseAlreadyLogged(cycle.id, timing, date)) return;
      const log = doseLogFromCycle(cycle, timing, date);
      state.peptideLogs = [log, ...(state.peptideLogs || [])];
      save(); render();
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
      setOpenExerciseCard(log.exerciseId);
      save(); renderWorkoutEditor();
    }
    if (button.dataset.deleteSet) {
      const draft = ensureDraft(selectedSplit());
      const log = draft.exerciseLogs.find((entry) => entry.exerciseId === button.dataset.exerciseId);
      if (log) log.sets = (log.sets || []).filter((set) => set.id !== button.dataset.deleteSet);
      if (log) setOpenExerciseCard(log.exerciseId);
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
      if (confirm("Apply the full Just.Train training plan? This replaces planner splits but keeps logged history.")) { applyPlan(); save(); render(); }
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
      const name = motraExerciseName(input?.value);
      if (!name) return;
      state.workoutTemplates[key].exercises.push({ id: `ex-${Date.now()}-${exerciseMatchKey(name)}`, name, notes: "", targets: [] });
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
    if (button.dataset.endCycle) {
      const cycle = (state.peptideCycles || []).find((item) => item.id === button.dataset.endCycle);
      if (!cycle || !confirm(`End ${compoundName(cycle.peptideId)} cycle? Saved dose history will stay, but reminders will stop.`)) return;
      cycle.endedAt = todayKey();
      save(); render();
    }
    if (button.dataset.deleteCycle) {
      if (!confirm("Delete this peptide cycle? Existing dosage history stays saved.")) return;
      state.peptideCycles = (state.peptideCycles || []).filter((cycle) => cycle.id !== button.dataset.deleteCycle);
      save(); renderPeptides(); renderToday();
    }
    if (button.dataset.deleteDose) {
      state.peptideLogs = (state.peptideLogs || []).filter((log) => log.id !== button.dataset.deleteDose);
      save(); render();
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
        exercise.name = motraExerciseName(el.value);
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
    if (el.closest?.("#reconstitution-form") && userCanUsePeptides()) renderReconstitution();
    if (el.closest?.("#peptide-cycle-form") && el.name === "vialMg" && userCanUsePeptides()) syncFixedDiluent($("#peptide-cycle-form"));
    if (el.id === "cycle-start" || el.id === "cycle-weeks") {
      if (!userCanUsePeptides()) return;
      const f = $("#peptide-cycle-form");
      if (f.elements.weeks.value !== "custom") f.elements.endDate.value = cycleEndDate(f.elements.startDate.value, f.elements.weeks.value);
    }
  });
  document.addEventListener("toggle", (event) => {
    if (event.target?.matches?.("details") && event.target.open) {
      flashOpenTab(event.target);
    }
    const card = event.target.closest?.(".exercise-log");
    if (card) {
      const id = String(card.dataset.exerciseId || "");
      if (!id) return;
      if (card.open) {
        document.querySelectorAll(".exercise-log[open]").forEach((other) => {
          if (other !== card) closeTabSmooth(other);
        });
        setOpenExerciseCard(id);
      } else {
        openExerciseCards.delete(id);
      }
      return;
    }
    const todayCard = event.target.closest?.(".today-exercise-card");
    if (todayCard?.open) {
      document.querySelectorAll(".today-exercise-card[open]").forEach((other) => {
        if (other !== todayCard) closeTabSmooth(other);
      });
      return;
    }
    const prCard = event.target.closest?.(".pr-accordion");
    if (prCard?.open) {
      document.querySelectorAll(".pr-accordion[open]").forEach((other) => {
        if (other !== prCard) closeTabSmooth(other);
      });
      return;
    }
    const masterCard = event.target.closest?.(".master-user-card");
    if (masterCard?.open) {
      document.querySelectorAll(".master-user-card[open]").forEach((other) => {
        if (other !== masterCard) closeTabSmooth(other);
      });
      return;
    }
    const scoreCard = event.target.closest?.(".score-detail-card");
    if (scoreCard?.open) {
      document.querySelectorAll(".score-detail-card[open]").forEach((other) => {
        if (other !== scoreCard) closeTabSmooth(other);
      });
    }
  }, true);
  document.addEventListener("change", (event) => {
    const el = event.target;
    if (el.dataset?.splitTitle || el.dataset?.exerciseName || el.dataset?.exerciseNotes) render();
    if (el.id === "cycle-peptide" && userCanUsePeptides()) applyCompoundDefaults($("#peptide-cycle-form"), el.value, true);
    if (el.id === "calc-peptide" && userCanUsePeptides()) { applyCompoundDefaults($("#reconstitution-form"), el.value, true); renderReconstitution(); }
    if (el.id === "log-peptide") {
      if (!userCanUsePeptides()) return;
      const compound = compoundById(el.value);
      const f = $("#peptide-log-form");
      if (!f.elements.doseMg.value) f.elements.doseMg.value = "";
      f.elements.notes.placeholder = compound.type === "oil" ? "Optional" : "Optional";
    }
    if (el.id === "cycle-start" || el.id === "cycle-weeks") {
      if (!userCanUsePeptides()) return;
      const f = $("#peptide-cycle-form");
      if (f.elements.weeks.value !== "custom") f.elements.endDate.value = cycleEndDate(f.elements.startDate.value, f.elements.weeks.value);
    }
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
    save(); render();
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
    save(); render();
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
    const minutes = 45;
    const session = { id: uid(), name: splitTitle(split), type: "strength", split, planTitle: splitTitle(split), exerciseLogs, durationMin: minutes, caloriesBurned: estimateCalories(minutes), createdAt: Date.now() };
    const key = todayKey();
    state.workouts[key] = [session, ...todayWorkouts()];
    delete state.workoutDrafts[`${key}:${split}`];
    save(); render();
  });
  $("#peptide-cycle-form").addEventListener("submit", (event) => {
    event.preventDefault();
    if (!userCanUsePeptides()) return;
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
    if (!userCanUsePeptides()) return;
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
    state.bodyMetrics = [{ id: uid(), weightKg: rawNum(f.elements.weightKg.value), fatPercent: rawNum(f.elements.fatPercent.value), createdAt: Date.now() }, ...state.bodyMetrics];
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
  $("#backup-now").addEventListener("click", (event) => {
    flashSaved(event.currentTarget);
    exportBackup();
  });
  $("#weekly-report-button").addEventListener("click", exportWeeklyReport);
  $("#import-button").addEventListener("click", () => { setImportStatus(""); $("#import-file").click(); });
  $("#motra-import-button").addEventListener("click", importMotraPreview);
  $("#master-create-user-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (masterBusy) return;
    const f = event.currentTarget;
    setMasterBusy(true);
    setMasterActionStatus("Creating user login...");
    try {
      await masterCreateUser(f.elements.email.value, f.elements.password.value);
      f.reset();
      await refreshMasterProfiles();
    } catch (err) {
      setMasterActionStatus(friendlyCloudError(err), true);
    } finally {
      setMasterBusy(false);
    }
  });
  $("#auth-gate-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (authBusy) return;
    flashSaved(event.submitter || $("#auth-login-button"));
    setAuthBusy(true);
    try {
      const { email, password } = cloudAuthValues(event.currentTarget);
      await cloudSignIn(email, password);
    } catch (err) {
      const message = friendlyCloudError(err);
      setAuthGateStatus(message, true);
      setCloudStatus(message, true);
      alert(message);
    } finally {
      setAuthBusy(false);
    }
  });
  $("#auth-create-button")?.addEventListener("click", async (event) => {
    if (authBusy) return;
    flashSaved(event.currentTarget);
    setAuthBusy(true);
    try {
      const form = $("#auth-gate-form");
      const { email, password } = cloudAuthValues(form);
      await cloudSignUp(email, password);
    } catch (err) {
      const message = friendlyCloudError(err);
      setAuthGateStatus(message, true);
      setCloudStatus(message, true);
      alert(message);
    } finally {
      setAuthBusy(false);
    }
  });
  $("#cloud-auth-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (authBusy) return;
    setAuthBusy(true);
    try {
      const { email, password } = cloudAuthValues();
      await cloudSignIn(email, password);
    } catch (err) {
      setCloudStatus(friendlyCloudError(err), true);
      alert(friendlyCloudError(err));
    } finally {
      setAuthBusy(false);
    }
  });
  $("#cloud-signup-button")?.addEventListener("click", async () => {
    if (authBusy) return;
    setAuthBusy(true);
    try {
      const { email, password } = cloudAuthValues();
      await cloudSignUp(email, password);
    } catch (err) {
      setCloudStatus(friendlyCloudError(err), true);
      alert(friendlyCloudError(err));
    } finally {
      setAuthBusy(false);
    }
  });
  $("#cloud-upload-button")?.addEventListener("click", async () => {
    if (!cloudUser?.id) { alert("Log in first."); return; }
    if (!confirm("Upload this device's current Just.Train data to your cloud account? This becomes the copy used on your other devices.")) return;
    try {
      setCloudStatus("Uploading this device...");
      await uploadCloudState();
    } catch (err) {
      setCloudStatus(friendlyCloudError(err), true);
      alert(friendlyCloudError(err));
    }
  });
  $("#cloud-pull-button")?.addEventListener("click", async () => {
    if (!cloudUser?.id) { alert("Log in first."); return; }
    try {
      setCloudStatus("Pulling cloud data...");
      await pullCloudState(true);
    } catch (err) {
      setCloudStatus(friendlyCloudError(err), true);
      alert(friendlyCloudError(err));
    }
  });
  $("#cloud-logout-button")?.addEventListener("click", cloudSignOut);
  $("#import-paste-button").addEventListener("click", async () => {
    try {
      setImportStatus("");
      await importText($("#import-json-text").value);
      $("#import-json-text").value = "";
    } catch (err) {
      setImportStatus(err?.message || "Import failed.", true);
      alert(err?.message || "Import failed.");
    }
  });
  $("#import-file").addEventListener("change", async (event) => {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    try {
      setImportStatus(`Reading ${file.name || "backup file"}...`);
      await importFile(file);
    } catch (err) {
      setImportStatus(err?.message || "Import failed.", true);
      alert(err?.message || "Import failed.");
    } finally {
      event.currentTarget.value = "";
    }
  });
  $("#motra-file").addEventListener("change", async (event) => {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    try {
      setMotraImportStatus(`Reading ${file.name || "Motra file"}...`);
      motraImportPreview = await motraWorkoutsFromFile(file);
      motraImportSourceName = file.name || "Samsung My Files upload";
      setMotraImportStatus(`Previewed ${motraImportPreview.length} Motra workouts. Tap Import preview to add them.`);
      renderMotraPreview();
    } catch (err) {
      motraImportPreview = [];
      motraImportSourceName = "";
      renderMotraPreview();
      setMotraImportStatus(err?.message || "Motra import failed.", true);
      alert(err?.message || "Motra import failed.");
    } finally {
      event.currentTarget.value = "";
    }
  });
}
function normalizeView(view) {
  if (view === "master") return "settings";
  if (view === "peptides" && !userCanUsePeptides()) return "today";
  return VIEW_IDS.includes(view) ? view : "today";
}
function activeViewName() {
  const active = $(".view.active");
  const view = active?.id?.replace(/^view-/, "");
  return normalizeView(view || state.settings?.activeView || "today");
}
function setView(view, options = {}) {
  const target = normalizeView(view);
  state.settings.activeView = target;
  $$(".view").forEach((el) => el.classList.toggle("active", el.id === `view-${target}`));
  $$(".tabbar [data-view]").forEach((button) => button.classList.toggle("active", button.dataset.view === target));
  renderHeader();
  renderPanelLimit();
  scheduleCalendarScroll();
  if (options.persist !== false) save({ silent: true });
}

load().then(() => { bind(); render(); save({ silent: true, skipCloud: true }); initCloud(); saveFeedbackReady = true; });
