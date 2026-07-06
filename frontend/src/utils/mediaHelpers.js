// Cloudinary lets you force a "Save As" download (instead of opening inline)
// by inserting the fl_attachment flag right after "/upload/" in the URL.
export const getDownloadUrl = (url, filename) => {
  if (!url.includes("/upload/")) return url;
  const flag = filename ? `fl_attachment:${encodeURIComponent(filename)}` : "fl_attachment";
  return url.replace("/upload/", `/upload/${flag}/`);
};

export const formatBytes = (bytes) => {
  if (!bytes) return "0 KB";
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
};

export const getFileExtension = (filename = "") => {
  const parts = filename.split(".");
  return parts.length > 1 ? parts.pop().toUpperCase() : "FILE";
};
