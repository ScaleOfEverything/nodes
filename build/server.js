import express from "express";
import fs from 'fs-extra';
import { watch } from "chokidar";
import { buildUniverse } from './universe.js';

if (!await fs.pathExists('dist')) {
  await buildUniverse();
}

const app = express();

let state = 'done';

app.use(async (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (state !== 'done') {
    await new Promise(resolve => {
      const i = setInterval(() => {
        if (state === 'done') {
          clearInterval(i);
          resolve();
        }
      }, 150);
    });
  }
  next();
})

app.get('/build.json', (req, res) => {
  res.send({
    id: "live_" + Date.now(),
    timestamp: new Date().toString(),
    nodeTypes: ["universe"],
    editable: true,
  });
})

app.use(express.static("dist"));

app.listen(3001, () => {
  console.log('Server is running on port 3001');
});


watch('universe', { ignoreInitial: true }).on('all', async (event, path) => {
  if (state === 'building') {
    state = 'building-stale';
    return;
  }
  state = 'building';
  while (state === 'building') {
    await buildUniverse();
    if (state === 'building-stale') {
      state = 'building';
    } else {
      state = 'done';
    }
  }
  console.log('Updated!');
});