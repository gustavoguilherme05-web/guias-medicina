import test from "node:test";
import assert from "node:assert/strict";
import {
  EXPERIENCE_DURATION_MS,
  getExperienceExpiry
} from "../functions/_shared/experience.js";

test("experience access expires exactly seven days after the paid webhook event", () => {
  const eventCreatedAt = 1_800_000_000;

  assert.equal(
    getExperienceExpiry(eventCreatedAt),
    eventCreatedAt * 1000 + 7 * 24 * 60 * 60 * 1000
  );
  assert.equal(EXPERIENCE_DURATION_MS, 7 * 24 * 60 * 60 * 1000);
});

test("experience expiry rejects an invalid Stripe event timestamp", () => {
  assert.throws(() => getExperienceExpiry(0), /Data de criação/);
  assert.throws(() => getExperienceExpiry(Number.NaN), /Data de criação/);
});
