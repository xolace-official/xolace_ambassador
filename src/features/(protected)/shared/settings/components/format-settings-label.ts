export function formatSettingsLabel(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/(^|\s)\S/g, (letter) => letter.toUpperCase());
}
