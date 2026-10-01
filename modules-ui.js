/** Controladores dos módulos. As funções matemáticas ficam em arquivos próprios. */
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

const $ = (id) => document.getElementById(id);
const format = (value) =>
  Number(value.toPrecision(12)).toLocaleString("pt-BR", {
    maximumSignificantDigits: 12,
    useGrouping: false,
  });

/** Não converter campo vazio em zero: todos os dados exigem entrada explícita. */
function readNumber(element, label) {
  const text = element.value.trim().replace(",", ".");
  if (
    !/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(text) ||
    !Number.isFinite(Number(text))
  ) {
    throw Error(`Preencha ${label} com um número válido.`);
  }
  return Number(text);
}
function run(statusId, action) {
  const status = $(statusId);
  status.textContent = "";
  status.className = "module-status";
  try {
    action();
  } catch (error) {
    status.textContent = error.message;
    status.classList.add("error");
  }
}

// Navegação acessível: botões nativos, painéis ocultos e indicação do módulo ativo.
const navButtons = [...document.querySelectorAll("[data-module]")];
navButtons.forEach((button) =>
  button.addEventListener("click", () => {
    navButtons.forEach((item) => {
      const selected = item === button;
      item.setAttribute("aria-pressed", String(selected));
      $(item.getAttribute("aria-controls")).hidden = !selected;
    });
  }),
);

$("function-form").addEventListener("submit", (event) => {
  event.preventDefault();
  $("function-result").textContent = "—";
  run("function-status", () => {
    const x = readNumber($("function-x"), "x");
    const value = evaluateFunction(
      $("function-expression").value,
      x,
      $("function-mode").value,
    );
    $("function-result").textContent = `f(${format(x)}) = ${format(value)}`;
    $("function-status").textContent = "Valor calculado.";
  });
});
$("table-form").addEventListener("submit", (event) => {
  event.preventDefault();
  $("function-table").replaceChildren();
  run("table-status", () => {
    const rows = functionTable(
      $("function-expression").value,
      readNumber($("range-start"), "início"),
      readNumber($("range-end"), "fim"),
      readNumber($("range-step"), "passo"),
      $("function-mode").value,
    );
    rows.forEach((row) => {
      const tr = document.createElement("tr");
      const x = document.createElement("td"),
        result = document.createElement("td");
      x.textContent = format(row.x);
      result.textContent = row.error
        ? `Indefinido: ${row.error}`
        : format(row.value);
      if (row.error) result.className = "error";
      tr.append(x, result);
      $("function-table").append(tr);
    });
    const invalid = rows.filter((row) => row.error).length;
    $("table-status").textContent =
      `${rows.length} pontos · ${invalid} fora do domínio real. Passo aplicado a partir do início.`;
  });
});
// Resultados antigos são removidos quando seus parâmetros mudam.
["function-expression", "function-mode", "function-x"].forEach((id) =>
  $(id).addEventListener("input", () => {
    $("function-result").textContent = "—";
    $("function-status").textContent = "";
  }),
);
[
  "function-expression",
  "function-mode",
  "range-start",
  "range-end",
  "range-step",
].forEach((id) =>
  $(id).addEventListener("input", () => {
    $("function-table").replaceChildren();
    $("table-status").textContent = "Gere a tabela para os novos parâmetros.";
  }),
);

function matrixValues(name) {
  const grid = $(`matrix-${name}`);
  const rows = Number(grid.dataset.rows),
    columns = Number(grid.dataset.columns);
  const inputs = [...grid.querySelectorAll("input")];
  return Array.from({ length: rows }, (_, i) =>
    Array.from({ length: columns }, (_, j) =>
      readNumber(
        inputs[i * columns + j],
        `${name.toUpperCase()}[${i + 1}, ${j + 1}]`,
      ),
    ),
  );
}
function buildMatrix(name, initial) {
  const rows = Number($(`${name}-rows`).value),
    columns = Number($(`${name}-columns`).value);
  const grid = $(`matrix-${name}`);
  // Guarda textos (inclusive temporariamente inválidos) ao redimensionar.
  const oldColumns = Number(grid.dataset.columns || 0);
  const old = [...grid.querySelectorAll("input")].map((input) => input.value);
  grid.replaceChildren();
  grid.dataset.rows = rows;
  grid.dataset.columns = columns;
  grid.style.gridTemplateColumns = `repeat(${columns}, minmax(60px, 1fr))`;
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < columns; j++) {
      const input = document.createElement("input");
      input.type = "text";
      input.inputMode = "decimal";
      input.value =
        initial?.[i]?.[j] ??
        (j < oldColumns ? old[i * oldColumns + j] : undefined) ??
        "0";
      input.setAttribute(
        "aria-label",
        `Matriz ${name.toUpperCase()}, linha ${i + 1}, coluna ${j + 1}`,
      );
      input.addEventListener("input", clearMatrixResult);
      grid.append(input);
    }
  }
  clearMatrixResult();
}
function clearMatrixResult() {
  $("matrix-result").replaceChildren();
  $("matrix-status").textContent = "Selecione uma operação para calcular.";
}
for (const name of ["a", "b"]) {
  for (const dimension of ["rows", "columns"]) {
    const select = $(`${name}-${dimension}`);
    for (let size = 1; size <= 10; size++) {
      const option = document.createElement("option");
      option.value = size;
      option.textContent = size;
      option.selected = size === 2;
      select.append(option);
    }
    select.addEventListener("change", () => buildMatrix(name));
  }
  buildMatrix(
    name,
    name === "a"
      ? [
          [1, 2],
          [3, 4],
        ]
      : [
          [5, 6],
          [7, 8],
        ],
  );
}
$("matrix-scalar").addEventListener("input", clearMatrixResult);
function showMatrix(result) {
  const table = document.createElement("table");
  table.className = "result-matrix";
  const caption = document.createElement("caption");
  caption.textContent = `Resultado: ${result.length} × ${result[0].length}`;
  const body = document.createElement("tbody");
  table.append(caption, body);
  result.forEach((row) => {
    const tr = document.createElement("tr");
    row.forEach((value) => {
      const td = document.createElement("td");
      td.textContent = format(value);
      tr.append(td);
    });
    body.append(tr);
  });
  $("matrix-result").append(table);
}
document.querySelectorAll("[data-matrix-operation]").forEach((button) =>
  button.addEventListener("click", () => {
    $("matrix-result").replaceChildren();
    run("matrix-status", () => {
      const operation = button.dataset.matrixOperation;
      const a = matrixValues("a");
      let result;
      switch (operation) {
        case "add":
          result = addMatrices(a, matrixValues("b"));
          break;
        case "subtract":
          result = addMatrices(a, matrixValues("b"), true);
          break;
        case "multiply":
          result = multiplyMatrices(a, matrixValues("b"));
          break;
        case "scale":
          result = scaleMatrix(a, readNumber($("matrix-scalar"), "escalar"));
          break;
        case "transpose":
          result = transpose(a);
          break;
        case "determinant":
          result = determinant(a);
          break;
      }
      if (Array.isArray(result)) showMatrix(result);
      else {
        const output = document.createElement("p");
        output.className = "big-result";
        output.textContent = `det(A) = ${format(result)}`;
        $("matrix-result").append(output);
      }
      $("matrix-status").textContent =
        `${button.textContent}: resultado calculado.`;
    });
  }),
);

const comboDescriptions = {
  factorial: ["n!", "Produto de 1 até n; por definição, 0! = 1."],
  permutation: ["P(n) = n!", "Ordenações de n elementos distintos."],
  repeated: [
    "P = n! / (a! × b! × …)",
    "Informe a quantidade de cada grupo de elementos iguais. A soma deve ser n.",
  ],
  arrangement: [
    "A(n,k) = n! / (n − k)!",
    "Escolher e ordenar k elementos distintos dentre n. A ordem importa.",
  ],
  combination: [
    "C(n,k) = n! / (k! × (n − k)!)",
    "Escolher k elementos distintos dentre n. A ordem não importa.",
  ],
};
function comboChanged() {
  const operation = $("combo-operation").value;
  $("combo-k-field").hidden = !["arrangement", "combination"].includes(
    operation,
  );
  $("combo-groups-field").hidden = operation !== "repeated";
  $("combo-formula").textContent = comboDescriptions[operation][0];
  $("combo-description").textContent = comboDescriptions[operation][1];
  $("combo-result").textContent = "—";
  $("combo-status").textContent = "";
}
$("combo-operation").addEventListener("change", comboChanged);
comboChanged();
$("combo-form").addEventListener("input", () => {
  $("combo-result").textContent = "—";
  $("combo-status").textContent = "";
});
$("combo-form").addEventListener("submit", (event) => {
  event.preventDefault();
  $("combo-result").textContent = "—";
  run("combo-status", () => {
    const n = readNumber($("combo-n"), "n"),
      operation = $("combo-operation").value;
    let result;
    if (operation === "factorial") result = factorial(n);
    if (operation === "permutation") result = permutation(n);
    if (operation === "repeated") {
      const text = $("combo-groups").value.trim();
      if (!/^\d+(?:[\s,;]+\d+)*$/.test(text))
        throw Error(
          "Informe quantidades inteiras separadas por espaço, vírgula ou ponto e vírgula.",
        );
      result = repeatedPermutation(n, text.split(/[\s,;]+/).map(Number));
    }
    if (operation === "arrangement")
      result = arrangement(n, readNumber($("combo-k"), "k"));
    if (operation === "combination")
      result = combination(n, readNumber($("combo-k"), "k"));
    $("combo-result").textContent = result.toString();
    $("combo-status").textContent =
      `Resultado exato · ${result.toString().length.toLocaleString("pt-BR")} dígitos.`;
  });
});
$("bases-form").addEventListener("input", () => {
  $("bases-result").replaceChildren();
  $("bases-status").textContent = "";
});
$("bases-form").addEventListener("submit", (event) => {
  event.preventDefault();
  $("bases-result").replaceChildren();
  run("bases-status", () => {
    const converted = convertBases(
      $("base-number").value,
      Number($("base-source").value),
    );
    for (const [base, label] of [
      [2, "Binário"],
      [8, "Octal"],
      [10, "Decimal"],
      [16, "Hexadecimal"],
    ]) {
      const row = document.createElement("div");
      row.className = "base-result";
      const name = document.createElement("span"),
        value = document.createElement("code");
      name.textContent = `${label} · base ${base}`;
      value.textContent = converted[base];
      row.append(name, value);
      $("bases-result").append(row);
    }
    $("bases-status").textContent =
      "Conversão exata de inteiro. Valores negativos usam sinal, não complemento de dois.";
  });
});
