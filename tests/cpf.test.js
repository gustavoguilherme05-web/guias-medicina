import test from "node:test";
import assert from "node:assert/strict";
import { hashCpf, normalizeCpf } from "../functions/_shared/cpf.js";

test("normalizeCpf accepts valid CPF with or without formatting", () => {
  assert.equal(normalizeCpf("529.982.247-25"), "52998224725");
  assert.equal(normalizeCpf("52998224725"), "52998224725");
});

test("normalizeCpf rejects repeated digits and invalid check digits", () => {
  assert.equal(normalizeCpf("111.111.111-11"), null);
  assert.equal(normalizeCpf("529.982.247-24"), null);
  assert.equal(normalizeCpf("123"), null);
});

test("hashCpf is stable for the same secret and changes with the secret", async () => {
  const cpf = normalizeCpf("529.982.247-25");
  const firstHash = await hashCpf(cpf, "a".repeat(32));

  assert.equal(firstHash, await hashCpf(cpf, "a".repeat(32)));
  assert.notEqual(firstHash, await hashCpf(cpf, "b".repeat(32)));
  assert.equal(firstHash.includes(cpf), false);
});

test("hashCpf rejects missing or short secrets", async () => {
  await assert.rejects(() => hashCpf("52998224725", "short"), /CPF_HASH_SECRET/);
});
