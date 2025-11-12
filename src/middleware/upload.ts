import multer from 'multer';

const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200 MB for video wallpapers

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});
