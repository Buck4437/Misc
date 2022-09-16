table = {}
requestReceived = 0
requestProcessed = 0

function addToTable(name, difficulty, count) {
    if (table[name] === undefined) {
        table[name] = {};
    }
    table[name][difficulty] = count;
}

function query(name, difficulty) {
    // console.log(`Querying ${name} ${difficulty}`)
    if (name == "Last" && difficulty == "Beyond") {
        return [query("Last | Moment", "Beyond"), query("Last | Eternity", "Beyond")].join("/")
    }
    if (table[name] === undefined || table[name][difficulty] === undefined) {
        return "Unknown"
    }
    return table[name][difficulty];
}

function addNoteCount(link, name, difficulty, redirect=false) {
    if (!redirect) {
        requestReceived += 1;
    }
    console.log("Adding " + name + (redirect ? " (Redirected)" : ""))
    let pageName = (redirect ? link : link.split("/").reverse()[0])

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
        let text = a.parse.wikitext["*"]
        let requests = parseWikiText(name, text, difficulty)
        for (let request of requests) {
            if (request.header === "Success") {
                this.addToTable(request.name, request.difficulty, request.count)
                console.log("Added song " + request.name)
            } else if (request.header === "Redirect") {
                addNoteCount(request.name, name, difficulty, true)
                return
            } else {
                console.log("Failed for song " + request.name)
            }
        }
        requestProcessed += 1;
    })
}

class Request {

    constructor(header, name, difficulty, count) {
        this.header = header;
        this.name = name;
        this.difficulty = difficulty;
        this.count = count;
    }

}

// this function takes raw data and returns corresponding combo, a redirect notice, or null
function parseWikiText(name, text, difficulty) {
    let rawText = text.replaceAll(/\s/g, "")

    let potentialRegex = new RegExp(`${difficulty}Combo=(Touch:)?\\d+`, "g")

    let redirectRegex = new RegExp(`#REDIRECT.{0,2}\\[\\[[^\\]]*\\]\\]`, "g")

    // If difficulty is beyond, use these
    let lastRegex = [
        new RegExp(`MomentCombo=\\d+`, "g"),
        new RegExp(`EternityCombo=\\d+`, "g")
    ]

    let potentialMatch = rawText.match(potentialRegex);
    let redirectMatch = rawText.match(redirectRegex);
    let lastMatches = lastRegex.map(x => rawText.match(x));

    if (potentialMatch !== null) {
        let count = potentialMatch[0].split("=")[1].replaceAll("Touch:", "");
        return [new Request("Success", name, difficulty, count)];
    } else if (redirectMatch !== null) {
        let betterRegex = new RegExp("\\[\\[[^\\]]*\\]\\]", "g")
        let match = text.match(betterRegex);
        let name = match[0].replaceAll("]]", "").replaceAll("[[", "");

        return [new Request("Redirect", name, difficulty, "0")];
    } else if (lastMatches[0] !== null && lastMatches[1] !== null) {
        let counts = lastMatches.map(x => x[0].split("=")[1])
        return [
            new Request("Success", "Last | Moment", difficulty, counts[0]),
            new Request("Success", "Last | Eternity", difficulty, counts[1])
        ]
    }
    return [new Request("Failure", name, difficulty, "0")]
}

class Song {
    constructor(name, ftr, byd, link) {
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
    getText = (nodes, id) => nodes.item(id).textContent
    getLink = nodes => nodes.item(1).querySelector("a").href

    songs = []
    el = document.querySelector(".songbydate-table")
    rows = el.querySelectorAll("tbody tr")
    for (let row of rows) {
        let cells = row.querySelectorAll("td")
        let name = getText(cells, 1)
        let ftr = getText(cells, 5)
        let byd = getText(cells, 6)
        let link = getLink(cells)
        songs.push(new Song(
            name, ftr, byd, link
        ))
    }

    interval = setInterval(() => {
        console.log(`Request Received: ${requestReceived}
Request Processed: ${requestProcessed}
Progress: ${requestProcessed / requestReceived * 100}%`)
        if (requestReceived > 0 && requestReceived === requestProcessed) {
            clearInterval(interval)
            console.log("Request completed.")
        }
    }, 5000)
}

run()

// Run this when all song data has been fetched
function copy() {
    songAsExcel = songs.map(song => song.toString()).join("\n")
    copyText(songAsExcel)
}
