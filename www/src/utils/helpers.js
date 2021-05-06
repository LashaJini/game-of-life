export function isPositiveNumber(rows) {
  return typeof rows === "number" && rows > 0 && !Number.isNaN(rows);
}

export function getIndex(width, row, col) {
  return row * width + col;
}
