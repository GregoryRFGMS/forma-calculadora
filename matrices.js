/** Operações matriciais com validação de dimensão e sem mutar as entradas. */
const MAX_ORDER = 10;
function shape(matrix) {
  if (
    !Array.isArray(matrix) ||
    !matrix.length ||
    matrix.length > MAX_ORDER ||
    !Array.isArray(matrix[0]) ||
    !matrix[0].length ||
    matrix[0].length > MAX_ORDER
  ) {
    throw Error("Use matrizes de 1 a 10 linhas e colunas.");
  }
  const columns = matrix[0].length;
  if (
    !matrix.every(
      (row) =>
        Array.isArray(row) &&
        row.length === columns &&
        row.every(Number.isFinite),
    )
  ) {
    throw Error(
      "Todas as linhas devem ter o mesmo tamanho e conter números finitos.",
    );
  }
  return [matrix.length, columns];
}
function checked(value) {
  if (!Number.isFinite(value))
    throw Error("Resultado fora do limite numérico.");
  return Object.is(value, -0) ? 0 : value;
}
export function addMatrices(a, b, subtract = false) {
  const [rows, columns] = shape(a),
    [otherRows, otherColumns] = shape(b);
  if (rows !== otherRows || columns !== otherColumns)
    throw Error("Soma e subtração exigem matrizes da mesma ordem.");
  return a.map((row, i) =>
    row.map((value, j) => checked(value + (subtract ? -b[i][j] : b[i][j]))),
  );
}
export function scaleMatrix(a, scalar) {
  shape(a);
  if (!Number.isFinite(scalar)) throw Error("Informe um escalar finito.");
  return a.map((row) => row.map((value) => checked(value * scalar)));
}
export function transpose(a) {
  const [rows, columns] = shape(a);
  return Array.from({ length: columns }, (_, j) =>
    Array.from({ length: rows }, (_, i) => a[i][j]),
  );
}
export function multiplyMatrices(a, b) {
  const [rows, columns] = shape(a),
    [otherRows, otherColumns] = shape(b);
  if (columns !== otherRows)
    throw Error("As colunas de A devem ser iguais às linhas de B.");
  return Array.from({ length: rows }, (_, i) =>
    Array.from({ length: otherColumns }, (_, j) => {
      let value = 0;
      for (let k = 0; k < columns; k++)
        value = checked(value + checked(a[i][k] * b[k][j]));
      return value;
    }),
  );
}
/** Eliminação gaussiana com pivoteamento parcial: O(n³), para ordem 1 a 10. */
export function determinant(matrix) {
  const [rows, columns] = shape(matrix);
  if (rows !== columns)
    throw Error("O determinante exige uma matriz quadrada.");
  const a = matrix.map((row) => [...row]);
  let result = 1;
  for (let column = 0; column < rows; column++) {
    let pivot = column;
    for (let row = column + 1; row < rows; row++) {
      if (Math.abs(a[row][column]) > Math.abs(a[pivot][column])) pivot = row;
    }
    if (a[pivot][column] === 0) return 0;
    if (pivot !== column) {
      [a[pivot], a[column]] = [a[column], a[pivot]];
      result *= -1;
    }
    const diagonal = a[column][column];
    result = checked(result * diagonal);
    for (let row = column + 1; row < rows; row++) {
      const factor = a[row][column] / diagonal;
      a[row][column] = 0;
      for (let j = column + 1; j < rows; j++)
        a[row][j] = checked(a[row][j] - factor * a[column][j]);
    }
  }
  return checked(result);
}
