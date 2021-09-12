






class Song {
    constructor(id, name, ftr, byd, note_ftr, note_byd) {
        this.id = id
        this.name = name
        this.ftr = ftr
        this.note_ftr = note_ftr
        this.byd = byd
        this.note_byd = note_byd
    }

    toString() {
        let diffs = []
        if (this.byd === "") {
            diffs.push(this.ftr)
        } else {
            diffs = diffs.concat(this.ftr, this.byd)
        }
        return diffs.map(diff => [this.id, this.name, diff].join("\t")).join("\n");
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
getLink = nodes => nodes.item(2)

songs = []
el = document.querySelector(".songbydate-table")
rows = el.querySelectorAll("tbody tr")
for (let row of rows) {
    let cells = row.querySelectorAll("td")
    let id = getText(cells, 0)
    let name = getText(cells, 2)
    let ftr = getText(cells, 6)
    let byd = getText(cells, 7)
    songs.push(new Song(
        id, name, ftr, byd
    ))
}

wtf = songs.map(song => song.toString()).join("\n")
copyText(wtf)
