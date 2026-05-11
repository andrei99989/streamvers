import express from 'express';

const router = express.Router();

const F1_API = 'https://api.jolpi.ca/ergast/f1';

async function f1Fetch(path) {
  const res = await fetch(`${F1_API}${path}`);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(JSON.stringify(data));
  }

  return data;
}

router.get('/current', async (_req, res) => {
  try {
    const data = await f1Fetch('/current.json');
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/current/next', async (_req, res) => {
  try {
    const data = await f1Fetch('/current/next.json');
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/current/results', async (_req, res) => {
  try {
    const data = await f1Fetch('/current/results.json');
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/current/driver-standings', async (_req, res) => {
  try {
    const data = await f1Fetch('/current/driverStandings.json');
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/current/constructor-standings', async (_req, res) => {
  try {
    const data = await f1Fetch('/current/constructorStandings.json');
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
