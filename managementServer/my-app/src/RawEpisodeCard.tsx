import { useContext } from "react"
import { DescriptionContext, type descriptionContextValues } from "./descriptionContext.tsx"

export const RawEpisodes = function ({ rawEpisodes, addEpisode, selectedRaw }: { rawEpisodes: any[], addEpisode: (rawEpisode?: any) => void, selectedRaw: string | null }) {
    const {setDescriptionNames} = useContext<descriptionContextValues>(DescriptionContext);
    const addRawEpisode = (rawEpisode: any) => {
        if (selectedRaw){
            return // Skip adding if one of these raw episodes is already expanded.
        }
        console.log("I'm adding")
        setDescriptionNames([])
        addEpisode(rawEpisode)
    }
    
    return <div className="rawEpisodes">
        {rawEpisodes.map(e => <RawEpisodeCard key={e.id} rawEpisode={e} addEpisode={addRawEpisode} selected={selectedRaw == e.id} />)}
    </div>
}


export const RawEpisodeCard = function ({ rawEpisode, addEpisode, selected }: { rawEpisode: any, addEpisode: (rawEpisode?: any) => void, selected: boolean }) {
    return <div className={`card small raw ${selected ? 'selected' : ''}`} onClick={() => addEpisode(rawEpisode)}>
        {/* <div className="button addRaw" >Add Episode</div> */}
        <div className="" >
            <RawEpisodeInnardsSmall episode={rawEpisode} selected={selected} />
        </div>
    </div>
}

interface descriptionSegment {
    type: "p" | "link",
    text: string
}
//Todo: pull list of names from every name in every saved podcast so far
const names = [
    "ben hanson",
    "sarah podzorski",
    "haley maclean",
    "kyle hilliard",
    "jeff marchiafava",
    "leo vader",
    "janet garcia",
    "jacob geller",
    "suriel vazquez",
    "kelsey lewin",
    "ana diaz",
    "charles harte",
    "kyle bosman",

]
function breakdownDescription(d: string): descriptionSegment[] {
    let segs: descriptionSegment[] = [];

    segs.push({
        type: 'p',
        text: d
    })

    for (let name of names) {
        for (let [i, seg] of segs.entries()) {
            if (seg.type == 'p') {
                let breakdown = seg.text.split(new RegExp(`(${name})`, 'i'))
                if (breakdown.length > 1) {
                    segs.splice(i, 1);
                    for (let b of breakdown) {
                        let newRecord: descriptionSegment = {
                            type: b.toLowerCase() == name ? "link" : 'p',
                            text: b
                        }
                        segs.splice(i, 0, newRecord)
                    }
                }
            }
        }
    }

    return segs.reverse();

}

const RawEpisodeInnardsSmall = function ({ episode, selected }: { episode: any, selected: boolean }) {

    let descriptionSegments;
    if (selected) {
        descriptionSegments = breakdownDescription(episode.description);
        // console.log("Description segments", descriptionSegments);
    }
    return <div className="cardDetails">
        <div>{episode.title}</div>
        <div>{episode.number}</div>
        {selected && <div className="rawDescription">
            {descriptionSegments?.map(renderDescriptionSegment)}
        </div>}
        <div>{episode.publishedAt}</div>
    </div>
}
function renderDescriptionSegment(seg: descriptionSegment) {
    let { toggleName } = useContext<descriptionContextValues>(DescriptionContext);
    console.log("Is this a function", toggleName)
    if (seg.type == 'p')
        return seg.text;
    if (seg.type == 'link') {
        return <button onClick={() => toggleName(seg.text)}>{seg.text}</button>
    }

}

