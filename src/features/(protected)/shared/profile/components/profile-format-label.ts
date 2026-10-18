export function formatProfileLabel(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/(^|\s)\S/g, (letter) => letter.toUpperCase());
}
