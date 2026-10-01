import { test } from "node:test";
import assert from "node:assert/strict";
import { calculate, compile } from "./engine.js";
import { evaluateFunction, functionTable } from "./functions.js";
import {
  addMatrices,
  scaleMatrix,
  transpose,
  multiplyMatrices,
  determinant,
} from "./matrices.js";
import {
  factorial,
  permutation,
  repeatedPermutation,
  arrangement,
  combination,
} from "./combinatorics.js";
import { convertBases } from "./bases.js";

// Casos das orientações do trabalho e fronteiras que causam erros comuns.
test("f(3) = 5 e tabela de x²−4", () => {
  assert.equal(evaluateFunction("x²−4", 3), 5);
  assert.deepEqual(
    functionTable("x²−4", -2, 2, 1).map((row) => row.value),
    [0, -3, -4, -3, 0],
  );
});
test("polinômio com multiplicação implícita", () =>
  assert.equal(evaluateFunction("2x²+3x−1", 2), 13));
test("aliases em português", () =>
  assert.ok(Math.abs(calculate("sen(30)+tg(45)+raiz(9)") - 4.5) < 1e-12));
test("árvore pode ser reavaliada sem capturar x antigo", () => {
  const f = compile("x+1");
  assert.equal(f({ x: 1 }), 2);
  assert.equal(f({ x: 5 }), 6);
});
test("tabela preserva pontos de domínio inválido", () => {
  const rows = functionTable("sqrt(x)", -1, 1, 1);
  assert.equal(rows[0].value, null);
  assert.ok(rows[0].error);
  assert.equal(rows[2].value, 1);
});
test("tabela registra divisão por zero", () =>
  assert.ok(functionTable("1/x", -1, 1, 1)[1].error));
test("passo decimal inclui extremo alinhado", () =>
  assert.equal(functionTable("x", 0, 0.3, 0.1).length, 4));
test("extremo não alinhado não é acrescentado", () =>
  assert.equal(functionTable("x", 0, 1, 0.3).length, 4));
test("intervalo de um ponto", () =>
  assert.equal(functionTable("x", 5, 5, 1).length, 1));
for (const args of [
  [0, 1, 0],
  [2, 1, 1],
  [0, 1000, 1],
  [0, 1, NaN],
  [0, 1, Infinity],
  [0, 1, -1],
  [1e20, 1e20 + 1e6, 1],
]) {
  test("rejeita intervalo " + args, () =>
    assert.throws(() => functionTable("x", ...args)),
  );
}
test("sintaxe inválida falha antes de gerar linhas", () =>
  assert.throws(() => functionTable("x+", 0, 2, 1)));
test("x ausente não vira zero", () => assert.throws(() => calculate("x+1")));
test("decimais malformados não viram multiplicação implícita", () =>
  assert.throws(() => calculate("1.2.3")));

const a = [
    [1, 2],
    [3, 4],
  ],
  b = [
    [5, 6],
    [7, 8],
  ];
test("soma de matrizes", () =>
  assert.deepEqual(addMatrices(a, b), [
    [6, 8],
    [10, 12],
  ]));
test("subtração de matrizes", () =>
  assert.deepEqual(addMatrices(a, b, true), [
    [-4, -4],
    [-4, -4],
  ]));
test("escalar", () =>
  assert.deepEqual(scaleMatrix(a, -2), [
    [-2, -4],
    [-6, -8],
  ]));
test("produto de matrizes", () =>
  assert.deepEqual(multiplyMatrices(a, b), [
    [19, 22],
    [43, 50],
  ]));
test("produto retangular", () =>
  assert.deepEqual(multiplyMatrices([[1, 2, 3]], [[1], [2], [3]]), [[14]]));
test("transposta retangular", () =>
  assert.deepEqual(
    transpose([
      [1, 2, 3],
      [4, 5, 6],
    ]),
    [
      [1, 4],
      [2, 5],
      [3, 6],
    ],
  ));
test("determinante 2x2", () => assert.ok(Math.abs(determinant(a) + 2) < 1e-12));
test("determinante 3x3", () =>
  assert.ok(
    Math.abs(
      determinant([
        [1, 2, 3],
        [0, 1, 4],
        [5, 6, 0],
      ]) - 1,
    ) < 1e-10,
  ));
test("determinante 4x4", () =>
  assert.equal(
    determinant([
      [2, 1, 0, 0],
      [0, 3, 1, 0],
      [0, 0, 4, 1],
      [0, 0, 0, 5],
    ]),
    120,
  ));
test("troca de linhas muda o sinal", () =>
  assert.equal(
    determinant([
      [0, 1],
      [1, 0],
    ]),
    -1,
  ));
test("matriz singular", () =>
  assert.equal(
    determinant([
      [1, 2],
      [2, 4],
    ]),
    0,
  ));
test("determinante 1x1", () => assert.equal(determinant([[7]]), 7));
test("pivô pequeno não é automaticamente zero", () =>
  assert.equal(
    determinant([
      [1e-40, 0],
      [0, 1],
    ]),
    1e-40,
  ));
test("operações não alteram entradas", () => {
  const before = structuredClone(a);
  determinant(a);
  multiplyMatrices(a, b);
  assert.deepEqual(a, before);
});
for (const matrix of [[], [[1], [1, 2]], [[NaN]], [[Infinity]]])
  test("matriz inválida " + JSON.stringify(matrix), () =>
    assert.throws(() => transpose(matrix)),
  );
test("soma com dimensões distintas", () =>
  assert.throws(() => addMatrices(a, [[1]])));
test("produto incompatível", () =>
  assert.throws(() => multiplyMatrices(a, [[1, 2]])));
test("determinante não quadrado", () =>
  assert.throws(() => determinant([[1, 2]])));
test("estouro numérico de matriz", () =>
  assert.throws(() => scaleMatrix([[1e308]], 100)));

test("C(10,3)=120", () => assert.equal(combination(10, 3), 120n));
test("P(5)=120", () => assert.equal(permutation(5), 120n));
test("A(5,3)=60", () => assert.equal(arrangement(5, 3), 60n));
test("ARARA: 5!/(3!2!)=10", () =>
  assert.equal(repeatedPermutation(5, [3, 2]), 10n));
test("permutação com grupos unitários", () =>
  assert.equal(repeatedPermutation(5, [2, 2, 1]), 30n));
test("20! exato, além da precisão inteira de Number", () =>
  assert.equal(factorial(20), 2432902008176640000n));
test("200! permanece BigInt finito com 375 dígitos", () => {
  assert.equal(typeof factorial(200), "bigint");
  assert.equal(factorial(200).toString().length, 375);
});
test("casos de conjunto vazio", () => {
  assert.equal(factorial(0), 1n);
  assert.equal(combination(0, 0), 1n);
  assert.equal(arrangement(0, 0), 1n);
  assert.equal(repeatedPermutation(0, [0]), 1n);
});
test("identidade de Pascal", () =>
  assert.equal(combination(50, 20), combination(49, 19) + combination(49, 20)));
for (const n of [-1, 1.5, 5001, NaN, Infinity])
  test("n inválido " + n, () => assert.throws(() => factorial(n)));
test("k maior que n", () => assert.throws(() => combination(3, 4)));
test("k fracionário", () => assert.throws(() => arrangement(3, 1.5)));
test("grupos não somam n", () =>
  assert.throws(() => repeatedPermutation(5, [2, 2])));
test("grupos ausentes", () => assert.throws(() => repeatedPermutation(5, [])));

test("255 nas quatro bases", () =>
  assert.deepEqual(convertBases("255", 10), {
    2: "11111111",
    8: "377",
    10: "255",
    16: "FF",
  }));
test("hexadecimal minúsculo", () =>
  assert.equal(convertBases("ff", 16)[10], "255"));
test("negativos com sinal", () =>
  assert.equal(convertBases("-1010", 2)[10], "-10"));
test("zero", () => assert.equal(convertBases("-0", 10)[2], "0"));
test("inteiro além de Number seguro", () =>
  assert.equal(convertBases("9007199254740993", 10)[16], "20000000000001"));
for (const [value, base] of [
  ["102", 2],
  ["8", 8],
  ["G", 16],
  ["1.5", 10],
  ["", 10],
  ["0xFF", 16],
  ["1", 3],
])
  test(`rejeita base ${base} entrada ${value}`, () =>
    assert.throws(() => convertBases(value, base)));
