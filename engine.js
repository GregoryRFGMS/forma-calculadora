/**
 * Parser de expressões reais por descida recursiva.
 * Gramática: soma → produto → unário → potência → átomo.
 * Constrói uma árvore de sintaxe, sem eval/Function, que pode ser reutilizada
 * para avaliar uma função em vários valores de x.
 */
export function compile(source) {
  const text = source
    .replaceAll("×", "*")
    .replaceAll("÷", "/")
    .replaceAll("−", "-")
    .replaceAll(",", ".")
    .replaceAll("π", "pi")
    .replaceAll("²", "^2")
    .replaceAll("³", "^3")
    .replace(/\bsen\b/g, "sin")
    .replace(/\btg\b/g, "tan")
    .replace(/\braiz\b/g, "sqrt");
  if (text.length > 2000)
    throw Error("Expressão muito longa (máximo de 2.000 caracteres).");
  const tokens =
    text.match(
      /(?:\d*\.\d+|\d+\.?\d*)(?:[eE][+-]?\d+)?|[a-zA-Z]+|[+\-*/^()!%]/g,
    ) || [];
  if (tokens.join("") !== text.replace(/\s/g, ""))
    throw Error("Caractere não reconhecido.");
  if (!tokens.length) throw Error("Digite uma expressão.");
  let position = 0;
  const peek = () => tokens[position];
  const take = () => tokens[position++];
  const node = (op, left, right) => ({ op, left, right });

  function atom() {
    const token = take();
    let value;
    if (token === "(") {
      value = sum();
      if (take() !== ")") throw Error("Feche os parênteses.");
    } else if (/^(?:\d|\.)/.test(token || "")) {
      value = { op: "number", value: finite(Number(token)) };
    } else if (["pi", "e", "Ans", "M", "x"].includes(token)) {
      value = { op: "variable", name: token };
    } else if (FUNCTION_NAMES.includes(token)) {
      if (take() !== "(") throw Error("Use parênteses na função.");
      value = { op: "function", name: token, argument: sum() };
      if (take() !== ")") throw Error("Feche os parênteses.");
    } else {
      throw Error(
        token ? `Símbolo inválido: ${token}.` : "Complete a expressão.",
      );
    }
    while (peek() === "!" || peek() === "%") value = node(take(), value);
    return value;
  }
  function power() {
    const value = atom();
    // A recursão à direita garante 2^3^2 = 2^(3^2).
    if (peek() === "^") {
      take();
      return node("^", value, unary());
    }
    return value;
  }
  function unary() {
    if (peek() === "+") {
      take();
      return unary();
    }
    if (peek() === "-") {
      take();
      return node("negative", unary());
    }
    return power();
  }
  function product() {
    let value = unary();
    while (true) {
      const token = peek();
      if (token === "*" || token === "/") {
        take();
        value = node(token, value, unary());
      } else if (token === "(" || /^[a-zA-Z]/.test(token || "")) {
        // Multiplicação implícita: 2x, 2π, 2(x+1), x sin(x).
        value = node("*", value, unary());
      } else break;
    }
    return value;
  }
  function sum() {
    let value = product();
    while (peek() === "+" || peek() === "-")
      value = node(take(), value, product());
    return value;
  }
  const tree = sum();
  if (position !== tokens.length)
    throw Error("Verifique a expressão e os parênteses.");
  return (context = {}) => {
    const value = evaluateNode(tree, {
      mode: "DEG",
      ans: 0,
      memory: 0,
      ...context,
    });
    return Object.is(value, -0) ? 0 : value;
  };
}

const FUNCTION_NAMES = [
  "sin",
  "cos",
  "tan",
  "asin",
  "acos",
  "atan",
  "sinh",
  "cosh",
  "tanh",
  "asinh",
  "acosh",
  "atanh",
  "ln",
  "log",
  "sqrt",
  "cbrt",
  "abs",
  "exp",
];

function finite(value) {
  if (!Number.isFinite(value))
    throw Error("Resultado fora do domínio real ou do limite numérico.");
  return value;
}

function factorial(value) {
  if (!Number.isInteger(value) || value < 0 || value > 170) {
    throw Error(
      "Aqui, o fatorial aceita 0 a 170. Para resultados exatos maiores, use Combinatória.",
    );
  }
  let result = 1;
  for (let i = 2; i <= value; i++) result *= i;
  return result;
}

function evaluateFunction(name, value, mode) {
  const angle = mode === "DEG" ? (value * Math.PI) / 180 : value;
  const inverse = (value) => (mode === "DEG" ? (value * 180) / Math.PI : value);
  const functions = {
    sin: () => Math.sin(angle),
    cos: () => Math.cos(angle),
    tan: () => {
      if (Math.abs(Math.cos(angle)) < 1e-14)
        throw Error("Tangente indefinida nesse ângulo.");
      return Math.tan(angle);
    },
    asin: () => inverse(Math.asin(value)),
    acos: () => inverse(Math.acos(value)),
    atan: () => inverse(Math.atan(value)),
    sinh: () => Math.sinh(value),
    cosh: () => Math.cosh(value),
    tanh: () => Math.tanh(value),
    asinh: () => Math.asinh(value),
    acosh: () => Math.acosh(value),
    atanh: () => Math.atanh(value),
    ln: () => Math.log(value),
    log: () => Math.log10(value),
    sqrt: () => Math.sqrt(value),
    cbrt: () => Math.cbrt(value),
    abs: () => Math.abs(value),
    exp: () => Math.exp(value),
  };
  return finite(functions[name]());
}

function evaluateNode(node, context) {
  if (node.op === "number") return node.value;
  if (node.op === "variable") {
    if (node.name === "x" && !Number.isFinite(context.x))
      throw Error("Informe x no módulo Funções.");
    return finite(
      {
        pi: Math.PI,
        e: Math.E,
        Ans: context.ans,
        M: context.memory,
        x: context.x,
      }[node.name],
    );
  }
  if (node.op === "function")
    return evaluateFunction(
      node.name,
      evaluateNode(node.argument, context),
      context.mode,
    );
  const left = evaluateNode(node.left, context);
  if (node.op === "negative") return -left;
  if (node.op === "!") return finite(factorial(left));
  if (node.op === "%") return left / 100;
  const right = evaluateNode(node.right, context);
  if (node.op === "/" && right === 0)
    throw Error("Não é possível dividir por zero.");
  switch (node.op) {
    case "+":
      return finite(left + right);
    case "-":
      return finite(left - right);
    case "*":
      return finite(left * right);
    case "/":
      return finite(left / right);
    case "^":
      return finite(Math.pow(left, right));
    default:
      throw Error("Operação inválida.");
  }
}

export function calculate(source, context = {}) {
  return compile(source)(context);
}
