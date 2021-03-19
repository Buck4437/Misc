songs = []
DIFFICULTIES = ["past", "present", "future", "beyond"]

fetch(`https://arcaea.fandom.com/api.php?action=parse&pageid=1014&prop=sections&format=json`)
	.then(a => a.json())
	.then(a => this.getSongs(a))

getSongs = (data) => {
  if (data.error !== undefined) return
  for (let s of data.parse.sections) {
    	if (DIFFICULTIES.includes(s.line.toLowerCase())) {
        	fetch(`https://arcaea.fandom.com/api.php?action=parse&pageid=1014&prop=wikitext&section=${s.index}&format=json`)
	.then(a => a.json())
	.then(a => this.parse(a))
      }
  }
}

parse = (data) => {
	if (data.error !== undefined) return
	songs = songs.concat(data.parse.wikitext["*"].replaceAll(/[\{\}\[\]]/g, "").replaceAll("'''", "").split("|-\n").filter((a, i) => i !== 0).map(f => f.replaceAll("| ", "").replaceAll(/data-sort-value=\"\d+.\d+\"/g, "").split("\n").map(t => t.trim()).filter((s, c) => c <= 3)))
}

randomizer = (data, min = 0, max = 100) => {
  let arr = data.filter(s => !isNaN(Number(s[2]))).map(s => [s[0].match(/\|/g) ? s[0].split("|")[1] : s[0], s[1], Number(s[2]), `Level ${s[3].replaceAll("|", "")}`]).filter(s => s[2] >= min && s[2] <= max)
  return arr[Math.floor(Math.random() * arr.length)];
}

run = (min, max) => randomizer(songs, min, max)
