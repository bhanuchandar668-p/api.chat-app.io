export function makeSlug(name: string) {
  return name.trim().toLowerCase().replace(/\W/g, "").split(" ").join("-");
}

export function fileNameHelper(fileName: string) {
  const lastDot = fileName.lastIndexOf(".");

  const name = lastDot === -1 ? fileName : fileName.slice(0, lastDot);

  const ext = lastDot === -1 ? "" : fileName.slice(lastDot + 1).toLowerCase();

  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const time = now.toTimeString().slice(0, 8).replace(/:/g, "");

  return `${date}_${time}_${makeSlug(name)}${ext ? `.${ext}` : ""}`;
}
