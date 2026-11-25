import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";

const casesContext = { window: {} };
runInNewContext(
  readFileSync(new URL("../public/osce-cases.js", import.meta.url), "utf8"),
  casesContext
);
const cases = casesContext.window.OSCE_CASES;

test("OSCE stations have unique IDs and complete briefing details", () => {
  const ids = cases.map((item) => item.id);

  assert.equal(new Set(ids).size, ids.length);
  for (const item of cases) {
    assert.ok(item.station);
    assert.ok(item.specialty);
    assert.ok(item.title);
    assert.ok(item.setting);
    assert.ok(item.patientName);
    assert.ok(item.scenario);
  }
});

test("the chronic heart failure station covers the seven supplied assessment areas", () => {
  const heartFailureCase = cases.find((item) => item.id === "icc-cronica-otimizacao");

  assert.ok(heartFailureCase);
  assert.equal(heartFailureCase.checklist.length, 7);
  assert.equal(
    new Set(heartFailureCase.checklist.map((criterion) => criterion.id)).size,
    heartFailureCase.checklist.length
  );
  assert.deepEqual(
    Array.from(heartFailureCase.checklist, (criterion) => criterion.id),
    ["communication", "congestion", "adherence", "exam", "sglt2", "arni", "diureticSafety"]
  );
});

test("the renal edema station covers all nine supplied assessment areas", () => {
  const renalCase = cases.find((item) => item.id === "edema-doenca-renal-cronica");

  assert.ok(renalCase);
  assert.equal(renalCase.checklist.length, 9);
  assert.deepEqual(
    Array.from(renalCase.checklist, (criterion) => criterion.id),
    [
      "communication",
      "edemaHistory",
      "comorbidities",
      "generalExam",
      "segmentalExam",
      "differentials",
      "diagnosis",
      "renalWorkup",
      "initialManagement"
    ]
  );
});

test("the legacy dyspnea station is removed and acute heart failure is available", () => {
  const acuteCase = cases.find((item) => item.id === "icc-aguda-perfil-b");

  assert.equal(cases.some((item) => item.id === "dispneia-upa"), false);
  assert.ok(acuteCase);
  assert.equal(acuteCase.checklist.length, 7);
  assert.deepEqual(
    Array.from(acuteCase.checklist, (criterion) => criterion.id),
    [
      "initialApproach",
      "oxygenation",
      "profile",
      "trigger",
      "diuretic",
      "vasodilator",
      "urgentWorkup"
    ]
  );
});

test("the cirrhosis station covers the nine assessment areas without requiring Child-Pugh calculation", () => {
  const cirrhosisCase = cases.find((item) => item.id === "cirrose-hepatica-ascite");

  assert.ok(cirrhosisCase);
  assert.equal(cirrhosisCase.checklist.length, 9);
  assert.deepEqual(
    Array.from(cirrhosisCase.checklist, (criterion) => criterion.id),
    [
      "communication",
      "symptoms",
      "history",
      "exam",
      "ascites",
      "initialWorkup",
      "childPughAndSaag",
      "albuminPbeSodium",
      "diagnosis"
    ]
  );
});

test("the erysipelas station covers the nine assessment areas", () => {
  const erysipelasCase = cases.find((item) => item.id === "erisipela-mid");

  assert.ok(erysipelasCase);
  assert.equal(erysipelasCase.station, "ESTAÇÃO 05");
  assert.equal(erysipelasCase.age, 28);
  assert.equal(erysipelasCase.checklist.length, 9);
  assert.deepEqual(
    Array.from(erysipelasCase.checklist, (criterion) => criterion.id),
    [
      "communication",
      "symptoms",
      "history",
      "triggers",
      "exam",
      "localFindings",
      "doppler",
      "diagnosis",
      "management"
    ]
  );
});
