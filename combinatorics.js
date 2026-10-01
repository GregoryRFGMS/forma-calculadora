/** Contagens inteiras exatas. BigInt evita o arredondamento de Number. */
export const MAX_N = 5000;
function natural(value, label) {
  if (!Number.isSafeInteger(value) || value < 0 || value > MAX_N) {
    throw Error(`${label} deve ser um inteiro de 0 a ${MAX_N}.`);
  }
}
function pair(n, k) {
  natural(n, "n");
  natural(k, "k");
  if (k > n) throw Error("k deve ser menor ou igual a n.");
}
export function factorial(n) {
  natural(n, "n");
  let result = 1n;
  for (let i = 2; i <= n; i++) result *= BigInt(i);
  return result;
}
export function permutation(n) {
  return factorial(n);
}
export function arrangement(n, k) {
  pair(n, k);
  let result = 1n;
  for (let i = 0; i < k; i++) result *= BigInt(n - i);
  return result;
}
export function combination(n, k) {
  pair(n, k);
  // Simetria C(n,k)=C(n,n-k) reduz o trabalho; cada divisão é exata.
  k = Math.min(k, n - k);
  let result = 1n;
  for (let i = 1; i <= k; i++)
    result = (result * BigInt(n - k + i)) / BigInt(i);
  return result;
}
export function repeatedPermutation(n, groups) {
  natural(n, "n");
  if (!Array.isArray(groups) || !groups.length)
    throw Error("Informe as quantidades de cada grupo de elementos iguais.");
  groups.forEach((value) => natural(value, "Cada quantidade"));
  if (groups.reduce((sum, value) => sum + value, 0) !== n)
    throw Error(
      "As quantidades dos grupos devem somar n (inclua os elementos únicos com quantidade 1).",
    );
  return groups.reduce(
    (result, size) => result / factorial(size),
    factorial(n),
  );
}
