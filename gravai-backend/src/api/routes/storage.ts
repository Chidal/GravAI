import { Router } from 'express';
import { uploadFile, downloadFile } from '../../services/storage';

const router = Router();

// POST /api/storage/upload - Upload file to 0G Storage
router.post('/upload', async (req, res, next) => {
  const { filePath } = req.body;
  try {
    const { rootHash, txHash } = await uploadFile(filePath);
    res.json({ rootHash, txHash });
  } catch (error) {
    next(error);
  }
});

// POST /api/storage/download - Download file from 0G Storage
router.post('/download', async (req, res, next) => {
  const { rootHash, outputPath } = req.body;
  try {
    await downloadFile(rootHash, outputPath);
    res.json({ message: 'Download successful' });
  } catch (error) {
    next(error);
  }
});

export default router;