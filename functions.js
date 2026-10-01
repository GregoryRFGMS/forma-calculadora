/** Avaliação de f(x) e amostragem em intervalo, independentes da interface. */
import { compile } from "./engine.js";

export function evaluateFunction(expression, x, mode = "DEG") {
  if (!Number.isFinite(x)) throw Error("Informe um valor finito para x.");
  return compile(expression)({ x, mode });
}

export function functionTable(expression, start, end, step, mode = "DEG") {
  if (![start, end, step].every(Number.isFinite))
    throw Error("Preencha início, fim e passo com números finitos.");
  if (step <= 0) throw Error("O passo deve ser maior que zero.");
  if (start > end) throw Error("O início deve ser menor ou igual ao fim.");
  const intervals = (end - start) / step;
  if (!Number.isFinite(intervals) || intervals > 500)
    throw Error("Use um intervalo com até 501 pontos. Aumente o passo.");
  if (start !== end && start + step === start)
    throw Error("Passo pequeno demais para esse intervalo.");
  // Compilar uma vez também separa erros de sintaxe de erros de domínio por ponto.
  const evaluate = compile(expression);
  const rows = [];
  const count = Math.floor(intervals + 1e-10) + 1;
  for (let i = 0; i < count; i++) {
    const x = start + i * step;
    try {
      rows.push({ x, value: evaluate({ x, mode }), error: null });
    } catch (error) {
      rows.push({ x, value: null, error: error.message });
    }
  }
  return rows;
}
