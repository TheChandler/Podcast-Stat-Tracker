import { useEffect, useState } from 'react'
import './App.css'
import { deleteData, getData, getYoutubePlaylistItems, publish, saveData } from './apiService.ts'
import type { episode, youtubePlaylistItem } from './models.ts'
import { Card } from './Card.tsx'
import { RawEpisodes } from './RawEpisodeCard.tsx'
import { DescriptionProvider } from './descriptionContext.tsx'

function newEpisode(): episode {
  return {
    id: "",
    number: "",
    title: "",
    date: "",
    hosts: [],
    url: "",
  }
}
function App() {
  const [episdoes, setEpisodes] = useState<episode[]>([])
  const [selectedEpisode, setSelectedEpisode] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [rawEpisodes, setRawEpisodes] = useState<youtubePlaylistItem[]>([])
  const [rawEpisodeMode, setRawEpisodeMode] = useState<boolean>(false);
  const [selectedRaw, setSelectedRaw] = useState<string | null>(null);

  const [addedHosts, setAddedHosts] = useState<string[]>([]);


  const populateRawEpisodes = () => {
    setRawEpisodeMode(true);
    getYoutubePlaylistItems().then(data => {
      setRawEpisodes(data || [])
      console.log("RAW EPISODES", data)
    })
  }

  useEffect(() => {
    getData().then(data => {
      data = data.map((d: any) => ({
        ...newEpisode(),
        ...d,
      }))
      setEpisodes(data)
    })
  }, [])

  if (selectedEpisode) {
    console.log(episdoes.find(e => e.id == selectedEpisode))
  }

  const onSave = (formData: any) => {
    if (formData.hosts && typeof formData.hosts == 'string') {
      formData.hosts = formData.hosts.split('\n').map((h: string) => h.trim()).filter((h: string) => h.length > 0)
    } else {
      formData.hosts = [];
    }

    if (formData.id == "new") {
      formData.id = null;
    }

    saveData(formData).then(data => {
      setSelectedEpisode(null)
      setSelectedRaw(null);
      setEpisodes(prev => prev.map(e => (e.id == data.id || e.id == 'new') ? data : e))
    })
      .catch(err => {
        console.log("ERR", JSON.stringify(err))
        setError(err.message || 'An error occurred reading the error.');
      })
  }
  const [isLoading, setIsLoading] = useState(false);
  const onPublish = () => {
    setIsLoading(true);
    publish()
      .then(() => {
        setIsLoading(false);
      }).catch(err => {
        console.log("ERR", JSON.stringify(err))
        setError(err.message || 'An error occurred reading the error.');
        setIsLoading(false);
      })
  }

  const onCancel = () => {
    if (selectedEpisode == 'new') {
      setEpisodes(prev => prev.filter(e => e.id != 'new'))
    }
    setSelectedEpisode(null);
    setSelectedRaw(null);
  }
  const onDelete = () => {
    deleteData(selectedEpisode!).then(() => {
      setEpisodes(prev => prev.filter(e => e.id != selectedEpisode))
      setSelectedEpisode(null);
    })
  }

  const addEpisode = (raw: youtubePlaylistItem | null = null) => {
    if (selectedEpisode) {
      return;
    }

    let episode: episode = {
      ...newEpisode(),
      id: 'new',
      number: episdoes.reduce((max, e) => Math.max(max, parseInt(e.number)), 0) + 1 + "",
    };

    if (raw) {
      episode.title = raw.title;
      episode.url = raw.url;
      episode.date = raw.publishedAt;
      setSelectedRaw(raw?.id)
    }

    setEpisodes(prev => [episode, ...prev]);
    setSelectedEpisode(episode.id);
  };

  const addHost = (host: string) => {
    if (!selectedEpisode) {
      return;
    }
    if (addedHosts.includes(host)) {
      setAddedHosts(prev => prev.filter(h => h != host));
    } else {
      setAddedHosts(prev => [...prev, host]);
    }
  }
  return <div>
    <div className='header'>
      <div className="button" onClick={() => addEpisode()}>Add Episode</div>
      <div className="button" onClick={() => populateRawEpisodes()}>View Raw Episodes</div>
      <div className={"button" + (isLoading ? ' loading' : '')} onClick={() => onPublish()} >
        {isLoading ? 'Publishing...' : 'Publish'}
      </div>
    </div>


    <div className='flex'>
      <DescriptionProvider>

        <div className='cardHolder'>
          {episdoes.map(e => <Card
            error={error}
            episode={e}
            setSelectedEpisode={setSelectedEpisode}
            isBig={selectedEpisode == e.id}
            isHidden={!!(selectedEpisode && selectedEpisode != e.id)}
            onSave={onSave}
            onCancel={onCancel}
            onDelete={onDelete}
            addedHosts={addedHosts}
          />)}
        </div>

        {rawEpisodeMode &&
          <RawEpisodes
            rawEpisodes={rawEpisodes}
            addEpisode={addEpisode}
            selectedRaw={selectedRaw}
          // addHost={addHost}
          />
        }
      </DescriptionProvider>
    </div>
  </div>
}

export default App
