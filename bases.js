/** Conversão exata de inteiros entre bases 2, 8, 10 e 16. */
export function convertBases(source, base) {
  if (![2, 8, 10, 16].includes(base)) throw Error("Escolha uma base válida.");
  let digits = source.trim().toUpperCase();
  let sign = 1n;
  if (digits.startsWith("-") || digits.startsWith("+")) {
    if (digits[0] === "-") sign = -1n;
    digits = digits.slice(1);
  }
  if (!digits || digits.length > 1024)
    throw Error("Informe de 1 a 1.024 dígitos, sem prefixos ou separadores.");
  let value = 0n;
  for (const character of digits) {
    const digit = "0123456789ABCDEF".indexOf(character);
    if (digit < 0 || digit >= base)
      throw Error(`O dígito “${character}” não pertence à base ${base}.`);
    value = value * BigInt(base) + BigInt(digit);
  }
  value *= sign;
  return Object.fromEntries(
    [2, 8, 10, 16].map((radix) => [radix, value.toString(radix).toUpperCase()]),
  );
}
