import type { episode, youtubePlaylistItem } from "./models.ts";

export async function getData() {
    let parsed;
    try {
        parsed = fetch('./all').then(res => res.json())
    } catch (e) {
        console.error("Error fetching data from backend at /all")
        console.error(e)
    }
    return parsed;
}

export async function getYoutubePlaylistItems() {
    return fetch('./playlist')
        .then(res => res.json())
        .then(data => {
            if (!data || !data.items) {
                return [];
            }

            return data.items.map((item: any) => {
                return {
                    id: item.id,
                    description: item.snippet.description,
                    publishedAt: new Date(item.snippet.publishedAt).toLocaleDateString(),
                    title: item.snippet.title.replace(' - The MinnMax Show', ''),
                    url: "http://www.youtube.com/watch?v=" + item.snippet.resourceId.videoId,
                }
            }) as youtubePlaylistItem[];
        })
}

export async function saveData(data: episode) {
    return fetch('./save', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(res => {
            if (!res.ok) {
                return res.json().then(err => {
                    console.log("error response from server", err)
                    throw new Error(err.error || 'An error occurred while saving the episode.');
                });
            }
            return res.json()
        })
}
export async function publish() {
    return fetch('./publish', {
        method: 'POST'
    })
        .then(res => {
            if (!res.ok) {
                return res.json().then(err => {
                    throw new Error(err.error || 'An error occurred while publishing.');
                });
            }
            return res.json()
        })
}
export async function deleteData(id: string) {
    return fetch('./delete', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id })
    }).then(res => res.json())
}