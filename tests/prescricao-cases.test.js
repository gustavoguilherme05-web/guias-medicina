import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { RUBRICAS_POR_CASO } from "../functions/api/prescricao.js";

const casosContext = { window: {} };
runInNewContext(
  readFileSync(new URL("../public/casos-prescricao.js", import.meta.url), "utf8"),
  casosContext
);
const casos = casosContext.window.PRESCRIPTION_CASES;
const guias = JSON.parse(
  readFileSync(new URL("../public/dados.json", import.meta.url), "utf8")
);

test("prescription cases have unique IDs and backend feedback rubrics", () => {
  const ids = casos.map((caso) => caso.id);

  assert.equal(new Set(ids).size, ids.length);
  for (const caso of casos) {
    assert.ok(
      Object.prototype.hasOwnProperty.call(RUBRICAS_POR_CASO, caso.id),
      `Missing feedback rubric for ${caso.id}`
    );
    assert.ok(caso.secoes.length > 0, `Missing case details for ${caso.id}`);
  }
});

test("the prescription cases with guides link to distinct existing guides", () => {
  const casosComGuia = casos.filter((caso) => Number.isInteger(caso.guiaId));
  const guiaIds = new Set(guias.map((guia) => guia.id));

  assert.equal(casosComGuia.length, 20);
  assert.equal(new Set(casosComGuia.map((caso) => caso.guiaId)).size, 20);
  for (const caso of casosComGuia) {
    assert.ok(guiaIds.has(caso.guiaId), `Missing guide ${caso.guiaId} for ${caso.id}`);
  }
  const casoItu = casosComGuia.find((caso) => caso.guiaId === 23);
  assert.equal(casoItu?.id, "itu-nao-complicada");
  assert.match(casoItu.titulo, /ITU/);
});
