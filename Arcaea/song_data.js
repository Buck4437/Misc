












table = {}
function addToTable(name, difficulty, count) {
    if (table[name] === undefined) {
        table[name] = {};
    }
    table[name][difficulty] = count;
}

function query(name, difficulty) {
    console.log(`Querying ${name} ${difficulty}`)
    return table[name][difficulty];
}

function addNoteCount(link, name, difficulty) {
    console.log("Adding " + name)
    let pageName = link.split("/").reverse()[0]

    // TODO: FIX THIS PART

    fetch(`https://arcaea.fandom.com/api.php?action=query&titles=${name}&format=json`)
    .then(a => {
        pages = a.json().query.pages
        return pages.keys[0]
    })
    .then(id => {
        let args = [
            "action=parse",
            `page=${pageName}`,
            "prop=wikitext",
            "format=json"
        ]
        return fetch(`https://arcaea.fandom.com/api.php?${args.join("&")}`)
    })
    .then(a => a.json())
    .then(a => {
        const regex = new RegExp(`${difficulty} Combo = \\d+`, "g");
        let substr = a.parse.wikitext["*"].match(regex)[0]
        let count = substr.split(" = ")[1]
        this.addToTable(name, difficulty, count)
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
            diffs = diffs.concat(["Future", this.ftr], ["Beyond", this.byd])
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



getText = (nodes, id) => nodes.item(id).textContent.replaceAll("\n", "")
getLink = nodes => nodes.item(2).querySelector("a").href

songs = []
el = document.querySelector(".songbydate-table")
rows = el.querySelectorAll("tbody tr")
for (let row of rows) {
    let cells = row.querySelectorAll("td")
    let id = getText(cells, 0)
    let name = getText(cells, 2)
    let ftr = getText(cells, 6)
    let byd = getText(cells, 7)
    let link = getLink(cells)
    songs.push(new Song(
        id, name, ftr, byd, link
    ))
}

// wtf = songs.map(song => song.toString()).join("\n")
// copyText(wtf)
