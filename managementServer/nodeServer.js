const express = require('express')
const app = express()
const port = 3000

const fs = require('fs')
const { exec, execSync } = require('node:child_process');
const path = require('node:path');

const dataPath = path.join(__dirname, '..', 'dataFiles', 'episode_list.json');
const updateFunctionPath = path.join(__dirname, '..', 'updateData.js');

const youtubeResponseCachePath = path.join(__dirname, '..', 'dataFiles', 'youtube_response_cache.json');

const { getPlayListItems } = require('./youtubeApi.js')

app.use(express.json());

app.get('/all', (req, res) => {
  let json = fs.readFileSync(dataPath);
  res.json(JSON.parse(json))
})

app.delete('/delete', (req, res) => {
  let body = req.body
  let json = JSON.parse(fs.readFileSync(dataPath));

  if (!body.id || typeof body.id !== 'string') {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  const updated = json.filter(episode => episode.id !== body.id);

  fs.writeFileSync(dataPath, JSON.stringify(updated, null, 2));
  res.json({ message: 'Episode deleted successfully' });

})

app.post('/save', (req, res) => {
  let body = req.body
  let json = JSON.parse(fs.readFileSync(dataPath));

  if (body.id && typeof body.id !== 'string') {
    return res.status(400).json({ error: 'Invalid ID format' });
  }
  if (!body.hosts || !Array.isArray(body.hosts)) {
    return res.status(400).json({ error: 'Hosts should be an array of strings' });
  }
  if (typeof body?.url !== 'string') {
    return res.status(400).json({ error: 'URL should be a string' });
  }
  if (typeof body?.date !== 'string') {
    return res.status(400).json({ error: 'Date should be a string' });
  }

  const updated = json.map(episode => {
    if (episode.id === body.id) {
      console.log('found match', JSON.stringify(episode,null, 2));

      return {
        ...body,
      };
    }
    return episode;
  });

  if (!body.id) {
    body.id = crypto.randomUUID();
    updated.unshift(body);
  }
  fs.writeFileSync(dataPath, JSON.stringify(updated, null, 2));
  res.json(body);
})

app.post('/publish', (req, res) => {
  try {
    console.log(execSync('node ./updateData.js').toString())
    res.json({ message: 'Git commit successful' });
  } catch {
    res.status(500).json({ error: 'Git commit failed' });
  }
})


app.get('/playlist', async (req, res) => {
  //Read file from cache and send it
  try {
    let existingCache = JSON.parse(fs.readFileSync(youtubeResponseCachePath));
    if (existingCache && existingCache.timestamp && (Date.now() - existingCache.timestamp < 24 * 60 * 60 * 1000)) {
      res.json(existingCache);
      return;
    }
  } catch {
    console.log('No existing cache found');
  }

  //Fallback. Get new data
  let response = await getPlayListItems()
  let data = response.data;
  data.timestamp = Date.now();
  fs.writeFileSync(youtubeResponseCachePath, JSON.stringify(data));
  res.json(data);
})



app.use(express.static(path.join(__dirname, './my-app/dist')));

// For any other route, serve the React app's index.html
app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(__dirname, './my-app/dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

