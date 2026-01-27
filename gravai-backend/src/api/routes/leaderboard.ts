import { Router } from 'express';
import { getLeaderboard, submitPrediction } from '../../services/analytics';

const router = Router();

// GET /api/leaderboard - Fetch leaderboard
router.get('/', async (req, res, next) => {
  try {
    const leaderboard = await getLeaderboard();
    res.json(leaderboard);
  } catch (error) {
    next(error);
  }
});

// POST /api/leaderboard/submit - Submit user prediction
router.post('/submit', async (req, res, next) => {
  const { userAddress, prediction, type } = req.body;
  try {
    await submitPrediction(userAddress, prediction, type);
    res.json({ message: 'Prediction submitted' });
  } catch (error) {
    next(error);
  }
});

export default router;