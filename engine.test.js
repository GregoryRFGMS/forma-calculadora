import { test } from "node:test";
import assert from "node:assert/strict";
import { calculate as calc } from "./engine.js";
const cases = [
  ["2+3*4", 14],
  ["(2+3)*4", 20],
  ["2^3^2", 512],
  ["-2^2", -4],
  ["2^-3", 0.125],
  ["5!", 120],
  ["0!", 1],
  ["200*(1+10%)", 220],
  ["sqrt(81)+cbrt(27)", 12],
  ["log(100)+ln(e)", 3],
  ["sin(30)", 0.5],
  ["cos(180)", -1],
  ["asin(1)", 90],
  ["2(3+4)", 14],
  ["2π", 2 * Math.PI],
  ["1,5+2,5", 4],
  ["1e-6*1e6", 1],
  ["abs(-4)", 4],
  ["sinh(0)", 0],
  ["exp(0)", 1],
];
for (const [expression, expected] of cases)
  test(expression, () =>
    assert.ok(Math.abs(calc(expression) - expected) < 1e-10),
  );
test("radians and state", () => {
  assert.ok(Math.abs(calc("sin(pi/2)", { mode: "RAD" }) - 1) < 1e-12);
  assert.equal(calc("Ans+M", { ans: 3, memory: 4 }), 7);
});
for (const expression of [
  "1/0",
  "sqrt(-1)",
  "ln(0)",
  "tan(90)",
  "(-2)!",
  "171!",
  "2+",
  "(3+2",
  "2)",
  "alert(1)",
  "1;2",
  "constructor(1)",
])
  test("reject " + expression, () => assert.throws(() => calc(expression)));
