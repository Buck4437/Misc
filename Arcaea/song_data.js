table = {}
function addToTable(name, difficulty, count) {
    if (table[name] === undefined) {
        table[name] = {};
    }
    table[name][difficulty] = count;
}

function query(name, difficulty) {
    console.log(`Querying ${name} ${difficulty}`)
    if (table[name] === undefined || table[name][difficulty] === undefined) {
        return "Unknown"
    }
    return table[name][difficulty];
}

function addNoteCount(link, name, difficulty) {
    console.log("Adding " + name)
    let pageName = link.split("/").reverse()[0]

    // TODO: FIX THIS PART

    fetch(`https://arcaea.fandom.com/api.php?action=query&titles=${pageName}&format=json`)
    .then(a => a.json())
    .then(a => {
        let pages = a.query.pages
      	let keys = Object.keys(pages)
        if (keys.length < 1) {
            console.log(`An error occured while querying${name}`)
            return -1
        }
        return keys[0]
    })
    .then(id => {
        let args = [
            "action=parse",
            `pageid=${id}`,
            "prop=wikitext",
            "format=json"
        ]
        return fetch(`https://arcaea.fandom.com/api.php?${args.join("&")}`)
    })
    .then(a => a.json())
    .then(a => {
        const regex = new RegExp(`${difficulty}Combo=\\d+`, "g");
        let rawText = a.parse.wikitext["*"].replaceAll(/\s/g, "")
        let matches = rawText.match(regex)
        if (matches === null) {
            console.log("Regex not found for this song:")
            console.log(rawText)
            console.log(regex)
        } else {
            let count = matches[0].split("=")[1]
            this.addToTable(name, difficulty, count)
        }
    })
}

class Song {
    constructor(id, name, ftr, byd, link) {
        this.id = id
        this.name = name
        this.ftr = ftr
        this.byd = byd
        this.link = link
        addNoteCount(link, name, "Future")
        if (this.byd !== "") {
            addNoteCount(link, name, "Beyond")
        }
    }

    toString() {
        let diffs = []
        if (this.byd === "") {
            diffs.push(["Future", this.ftr])
        } else {
            diffs = diffs.concat([["Future", this.ftr], ["Beyond", this.byd]])
        }
        return diffs.map(diff => [
                this.id,
                this.name,
                diff[1],
                query(this.name, diff[0])
            ].join("\t")
        ).join("\n");
    }
}

function copyText(text) {
    // Source: https://www.30secondsofcode.org/blog/s/copy-text-to-clipboard-with-javascript

    const el = document.createElement("textarea");
    el.value = text;
    el.setAttribute("readonly", "");
    el.style.position = "absolute";
    el.style.left = "-9999px";
    document.body.appendChild(el);
    el.select();
    try {
        document.execCommand("copy");
        console.log("Auto-copy successful");
    } catch (e) {
        console.log("Auto-copy unsuccessful");
        prompt("Failed to Auto-copy. Please copy manually:", text);
    }
    document.body.removeChild(el);
}

songs = []

function run() {
    getText = (nodes, id) => nodes.item(id).textContent.replaceAll("\n", "")
    getLink = nodes => nodes.item(1).querySelector("a").href

    songs = []
    el = document.querySelector(".songbydate-table")
    rows = el.querySelectorAll("tbody tr")
    for (let row of rows) {
        let cells = row.querySelectorAll("td")
        let id = getText(cells, 0)
        let name = getText(cells, 1)
        let ftr = getText(cells, 5)
        let byd = getText(cells, 6)
        console.log(byd)
        let link = getLink(cells)
        songs.push(new Song(
            id, name, ftr, byd, link
        ))
    }
}

run()
// wtf = songs.map(song => song.toString()).join("\n")
// copyText(wtf)
