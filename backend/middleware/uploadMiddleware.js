import multer from "multer";

// Size limits per media category (bytes) — kept just under Cloudinary's own
// free-plan hard caps (10MB image, 100MB video/audio, 10MB raw/file) so we
// give users a clean error instead of a confusing Cloudinary rejection.
export const SIZE_LIMITS = {
  image: 8 * 1024 * 1024, // 8MB
  gif: 8 * 1024 * 1024, // 8MB (Cloudinary stores GIFs as "image" resource type)
  sticker: 512 * 1024, // 512KB — stickers are bundled assets anyway, never uploaded
  video: 100 * 1024 * 1024, // 100MB — Cloudinary free plan's own ceiling
  audio: 25 * 1024 * 1024, // 25MB — generous for voice notes
  file: 10 * 1024 * 1024, // 10MB — Cloudinary's free-plan raw-file hard cap
};

const MULTER_HARD_LIMIT = 100 * 1024 * 1024; // matches the largest category (video)

// Memory storage: file stays in RAM as a buffer just long enough to stream it
// to Cloudinary — nothing ever touches this server's disk, so a Render restart
// or redeploy can never wipe out previously sent media.
const storage = multer.memoryStorage();

const DOCUMENT_MIMETYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/zip",
  "application/x-zip-compressed",
  "application/x-rar-compressed",
  "text/plain",
  "text/csv",
];

export const getMediaType = (mimetype) => {
  if (mimetype === "image/gif") return "gif";
  if (mimetype.startsWith("image/")) return "image";
  if (mimetype.startsWith("video/")) return "video";
  if (mimetype.startsWith("audio/")) return "audio";
  if (DOCUMENT_MIMETYPES.includes(mimetype)) return "file";
  return null;
};

// Maps our internal media type to the Cloudinary resource_type needed for
// upload and (later) deletion.
export const getCloudinaryResourceType = (mediaType) => {
  if (mediaType === "video" || mediaType === "audio") return "video"; // Cloudinary treats audio as "video" resource type
  if (mediaType === "file") return "raw";
  return "image"; // covers image, gif
};

const fileFilter = (req, file, cb) => {
  const allowedByRegex = /image\/(jpeg|jpg|png|gif|webp)|video\/(mp4|webm|quicktime)|audio\/(webm|mpeg|mp3|wav|ogg|m4a|x-m4a)/;
  if (allowedByRegex.test(file.mimetype) || DOCUMENT_MIMETYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file type"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MULTER_HARD_LIMIT },
});

export default upload;
