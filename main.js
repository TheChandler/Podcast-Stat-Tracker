function createChart() {
    const ctx = document.getElementById('chart-canvas');
    //@ts-ignore
    chart = new Chart(ctx, {
        type: isBar ? 'bar' : 'line',
        data: {
            labels: [],
            datasets: []
        },
        options: {
            scales: {
                y: {
                    min: 0,
                    max: isStacked ? null : 1,
                    ticks: {
                        format: {
                            style: 'percent'
                        }
                    },
                    stacked: isBar && isStacked
                },
                x: {
                    stacked: true
                }
            }
        }
    });
}
function recalculateData() {
    createLineDatasets(windowSize);
    updateChart();
}
function getDataForDisplay() {
    let dataset = calculatedData;
    dataset = dataset.map(ds => {
        let data = ds.data.slice(Math.max(endEpisode - xAxisSize, 0), endEpisode);
        if (isBar) {
            data = data.map(array => array[1]);
        }
        return Object.assign(Object.assign({}, ds), { data: data });
    });
    console.log(dataset);
    return dataset.filter(d => selectedHosts.some(sh => sh == d.id));
}
function updateChart() {
    console.log("update chart?");
    let labels = podcasts.map(p => p.dateString);
    labels = labels.slice(Math.max(endEpisode - xAxisSize, 0), endEpisode);
    chart.data = {
        labels: labels,
        datasets: getDataForDisplay()
    };
    chart.type = isBar ? 'bar' : 'line';
    chart.update();
}
let unformattedPodcasts;
function setJson(value) {
    unformattedPodcasts = value;
}
let hosts = [];
let podcasts = [];
let selectedHosts = [];
let selectedHostsForGraph = [];
let calculatedData = [];
let chart;
let windowSize = parseInt(document.getElementById('week-amount').value);
let xAxisSize = parseInt(document.getElementById('x-axis').value);
let endEpisode = parseInt(document.getElementById('range').value);
;
let sortDescending = true;
let isBar = false;
let isStacked = false;
let colors = [
    '#e67a57',
    '#4697c3',
    '#953d3d',
    '#f187bd',
    '#8896fd',
    '#a0b810',
    '#f9c023',
    '#511d91',
    '#40f717',
    '#a51bad',
    '#ee2f46',
    '#5cf99c'
];
fetch('dataFiles/episode_list.json')
    .then((response) => {
    response.json()
        .then(j => {
        setJson(j);
        run();
    });
});
function run() {
    populateData(unformattedPodcasts);
    hosts = hosts.sort((a, b) => a.podcasts.length < b.podcasts.length ? 1 : -1);
    updateHostsDisplay(hosts);
    updatePodcastsDisplay(podcasts);
    createChart();
    recalculateData();
    updateSlider();
    updateXAxisInputElement();
}
function populateData(episodes) {
    for (const [index, episode] of episodes.entries()) {
        let podcast = {
            id: index,
            episodeNumber: episode.number,
            title: episode.title,
            date: new Date(episode.date),
            dateString: episode.date,
            hostStrings: episode.hosts,
            hostIds: [],
            url: episode.url
        };
        for (let hostName of podcast.hostStrings) {
            let hostIndex = getOrAddHostId(hostName);
            hosts[hostIndex].podcasts.push(index);
            podcast.hostIds.push(hostIndex);
        }
        if (podcast.hostIds.length > 0) {
            podcasts.push(podcast);
        }
        podcasts = podcasts.sort((a, b) => a.date > b.date ? 1 : -1);
    }
    const defaultHosts = ['ben hanson', 'jacob geller', 'sarah podzorski', 'kyle hilliard', 'jeff marchiafava', 'leo vader', 'janet garcia', 'suriel vazquez', 'kelsey lewin', 'haley maclean'];
    selectedHostsForGraph = hosts
        .filter(h => defaultHosts.some(dh => normalizeName(dh) == h.nameSearch))
        .map(h => h.id);
}
function getOrAddHostId(hostName) {
    let index = getHostId(hostName);
    if (index == -1) {
        index = hosts.length;
        hosts.push({
            id: index,
            name: hostName,
            nameSearch: normalizeName(hostName),
            podcasts: [],
            color: colors[index % colors.length]
        });
    }
    return index;
}
function getHostId(hostName) {
    let nameSearch = normalizeName(hostName);
    return hosts.findIndex(h => h.nameSearch == nameSearch);
}
function normalizeName(name) {
    return name.trim().replace(/[\W_]+/g, "").toLowerCase();
    ;
}
function updateHostsDisplay(hosts) {
    const div = document.getElementById("hosts");
    for (let host of hosts) {
        let newDiv = document.createElement('div');
        newDiv.setAttribute("onclick", `updateHostSelection(${host.id})`);
        newDiv.id = `host-${host.id}`;
        newDiv.className = `host-container card fs-3 mb-2 pointer`;
        newDiv.innerHTML = "<div class='row g-0'>" +
            `<div class="host-name col p-2 ms-2">${host.name}</div>` +
            `<div class="host-appearances col-4 bg-secondary text-white rounded-end text-center align-content-center">${host.podcasts.length}</div>` +
            "</div>";
        div.appendChild(newDiv);
        // console.log("appended", newDiv)
    }
}
function updatePodcastsDisplay(podcasts) {
    const div = document.getElementById("podcasts");
    div.innerHTML = '';
    div.className = "accordion accordion-flush col";
    let orderedPodcasts = podcasts.toSorted((a, b) => (a.date < b.date == sortDescending) ? 1 : -1);
    for (let podcast of orderedPodcasts) {
        // console.log(podcast)
        let newDiv = createPodcastDiv(podcast);
        div.appendChild(newDiv);
        // console.log("appended", newDiv)
    }
    const count = document.getElementById('podcast-count');
    count.innerText = podcasts.length;
}
function createPodcastDiv(podcast) {
    //Header button
    let newDiv = document.createElement('div');
    newDiv.className = "podcast-container accordion-item";
    let header = document.createElement('div');
    header.className = "podcast-header accordion-header";
    let headerButton = document.createElement("button");
    headerButton.className = "podcast-name accordion-button collapsed pe-0";
    headerButton.innerHTML = `<div><div class="podcast-date">${podcast.dateString}</div> <div class="d-flex align-items-end gap-3">` +
        `<div class="episode-number">${podcast.episodeNumber}</div><div class="episode-title">${podcast.title}</div>` +
        "</div> </div>";
    headerButton.setAttribute('data-bs-toggle', "collapse");
    headerButton.setAttribute('data-bs-target', '#podcast-' + podcast.id);
    header.appendChild(headerButton);
    // Body
    let bodyContainer = document.createElement("div");
    bodyContainer.id = 'podcast-' + podcast.id;
    bodyContainer.className = "accordion-collapse collapse";
    let url = "";
    if (podcast.url) {
        url = podcast.url;
    }
    else {
        url = `https://youtube.com/results/?search_query=${podcast.title}`;
    }
    let body = document.createElement("div");
    body.className = "accordion-body";
    body.innerHTML = `<div>
    <div><a target="blank" href="${url}">Find it on youtube</a></div>
    <!-- <b>Date:</b> ${podcast.dateString} </div> -->
    <div><b>Podcasters:</b> <pre class="ps-2">${podcast === null || podcast === void 0 ? void 0 : podcast.hostStrings.join('\n ')}</pre></div>`;
    bodyContainer.appendChild(body);
    newDiv.appendChild(header);
    newDiv.appendChild(bodyContainer);
    return newDiv;
}
function updateHostGraphSelection(id) {
    let icon = document.querySelector(`#host-${id} i`);
    icon.classList.toggle('bi-square');
    icon.classList.toggle('bi-x-square-fill');
}
function getRangeOfDates() {
    return podcasts.length;
}
function createLineDatasets(windowTarget) {
    let runningCounts = hosts.map(h => ({ id: h.id, label: h.name, data: [], borderWidth: 1, currentScore: [], borderColor: h.color, backgroundColor: h.color }));
    let window = 0;
    for (let [index, podcast] of podcasts.entries()) {
        //grow window until it reaches target size. could alternatively use index?
        window += window < windowTarget ? 1 : 0;
        for (let host of runningCounts) {
            if (podcast.hostIds.includes(host.id)) {
                host.currentScore.push(1);
            }
            else {
                host.currentScore.push(0);
            }
            if (host.currentScore.length > window) {
                host.currentScore.shift();
            }
            host.data.push([index, (sumArray(host.currentScore) / window)]);
            if (host.label == 'Sarah Podzorski') {
                console.log(podcast.dateString, host.currentScore, sumArray(host.currentScore) / window, podcast.hostIds.includes(host.id));
                if (podcast.hostIds.includes(host.id)) {
                    console.log(host.data[host.data.length - 1]);
                    console.log(runningCounts[host.id]);
                }
            }
            if (podcast.hostIds.includes(host.id) && host.currentScore[host.currentScore.length - 1] != 1) {
                console.error("Something is wrong here");
            }
        }
    }
    // console.log(runningCounts)
    calculatedData = runningCounts;
    return runningCounts;
}
function sumArray(array) {
    return array.reduce((a, b) => a + b, 0);
}
function toggleBigMode() {
    console.log("bm toggle");
    let column = document.getElementById("chart-column");
    column.classList.toggle('col-lg-4');
    let button = document.querySelector('#chart-column .btn');
    button.textContent = button.textContent == 'big mode' ? 'teeny mode' : 'big mode';
}
function updateWindowSize(e) {
    windowSize = parseInt(e.value);
    recalculateData();
}
function sliderChanged(e) {
    endEpisode = parseInt(e.value);
    updateChart();
}
function changeSortDirection() {
    let icon = document.querySelector('#sort-direction');
    icon.classList.toggle("bi-arrow-down");
    icon.classList.toggle("bi-arrow-up");
    sortDescending = !sortDescending;
    updatePodcastsDisplay(podcasts);
}
function updateXAxis(e) {
    xAxisSize = parseInt(e.value);
    console.log(xAxisSize);
    updateChart();
}
function updateSlider() {
    let max = getRangeOfDates();
    let range = document.getElementById('range');
    range.setAttribute('max', max.toString());
    range.setAttribute('value', max.toString());
    endEpisode = max;
}
function updateXAxisInputElement() {
    let max = getRangeOfDates();
    document.getElementById('x-axis').setAttribute('value', max.toString());
    document.getElementById('x-axis').onchange(max.toString());
}
function updateHostSelection(id) {
    console.log("udpating host selected");
    console.log("includes", selectedHosts, id);
    document.getElementById(`host-${id}`).classList.toggle("selected-item");
    if (selectedHosts.includes(id)) {
        selectedHosts = selectedHosts.filter(sh => sh != id);
    }
    else {
        selectedHosts.push(id);
    }
    let podcastsFiltered = podcasts.filter(p => true);
    for (const hostId of selectedHosts) {
        console.log(podcastsFiltered.length, hostId);
        console.log(podcastsFiltered);
        podcastsFiltered = podcastsFiltered.filter(p => p.hostIds.includes(hostId));
        console.log(podcastsFiltered, podcastsFiltered.length);
    }
    let podcastsSorted = podcastsFiltered.sort((a, b) => { return b.date > a.date ? 1 : -1; });
    updatePodcastsDisplay(podcastsSorted);
    updateChart();
}
function toggleIsBar(e) {
    isBar = e.checked;
    chart.destroy();
    createChart();
    updateChart();
}
function toggleIsStacked(e) {
    isStacked = e.checked;
    chart.destroy();
    createChart();
    updateChart();
}
