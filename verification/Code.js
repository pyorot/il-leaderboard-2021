const IL_SHEET_ID = '12wDUXjLqmcUuWSEXWc1fHNJc24KlfyCh0pvibZYEQM0'

var sheetName   = 'ILs'
var liveSheet   = SpreadsheetApp.openById(IL_SHEET_ID).getSheetByName(sheetName)
var cacheSheet  = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName + ' Cache')
var verifySheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName)
var P_START     = 5
var L_START     = 8
var P           = liveSheet.getLastRow() + 1 - P_START
var Pc          = cacheSheet.getLastRow() + 1 - P_START
var L           = liveSheet.getLastColumn() + 1 - L_START
var Lc          = cacheSheet.getLastColumn() + 1 - L_START
var levelHeader = liveSheet.getRange(1, L_START, 3, L).getDisplayValues()
var cacheLevelHeader = cacheSheet.getRange(1, L_START, 3, Lc).getDisplayValues()
var levels = readLevels()
var players = readPlayers()
var ALLOW0DP = false; var ALLOWXX = false; var ALLOW1DP = true // used in parseTime

// handles sync button; runs save() then load()
function sync() {
  // pre-sync
  verifySheet.getRange('L1').setValue('syncing... ')                   // public info
  let protection = verifySheet.protect()
  protection.removeEditors(protection.getEditors())                    // protection blocks other users from editing
  SpreadsheetApp.getUi().showModalDialog(HtmlService.createHtmlOutput( // modal dialog box blocks self from editing
    'Sync in progress (may take ~1m).<br>' +
    'This message should automatically close when done.<br>' + 
    'If it stalls, refresh the sheet and click sync again.'
  ).setHeight(80), 'Wait')

  // sync
  let success = save()
  if (success) {load()}

  // post-sync
  verifySheet.getRange('L1').setValue(new Date().toISOString().replace('T',' ').split('.')[0]) // last updated
  SpreadsheetApp.flush()
  SpreadsheetApp.getUi().showModalDialog(HtmlService.createHtmlOutput( // close modal dialog box
    '<script>google.script.host.close();</script>'
  ).setHeight(80), 'Done')
  protection.remove()                                                  // remove protection
}

// loads in new unverified ILs from live sheet
function load() {
  console.log('loading...')

  // load live + cache data
  let range = liveSheet.getRange(P_START, L_START, P, L)
  let rangeValues = range.getDisplayValues()
  let rangeLinks = range.getRichTextValues().map(row => row.map(entry => entry.getLinkUrl())) // slow
  console.log("loaded live data")
  let cacheRange = cacheSheet.getRange(P_START, L_START, Pc, Lc)
  let cacheRangeValues = cacheRange.getDisplayValues()
  let cacheRangeLinks = cacheRange.getRichTextValues().map(row => row.map(entry => entry.getLinkUrl())) // slow
  console.log("loaded cached data")

  // load verify data
  let verifyRange = verifySheet.getRange(1, 1, verifySheet.getLastRow(), 7) // has header cos non-empty not allowed
  let verifyData = verifyRange.getDisplayValues().slice(1)
  let freeCounter = 0

  // compare live and cache to determine news
  let news = [] // the list of entries to add to/edit on the verification sheet
  for (let [p, player] of players.live.names.entries()) {
    let q = players.cache.indices[player]                    // look up player in cache; undefined if new player
    for (let [l, level] of levels.live.names.entries()) {
      let m = levels.cache.indices[level]                    // look up level in cache; undefined if new level
      let known = q !== undefined && m !== undefined         // if player+level are in cache, find times/links that
      let post = known ?                                     // _ don't match cache, else find any non-blank time
        rangeValues[p][l] != cacheRangeValues[q][m] || rangeLinks[p][l] != cacheRangeLinks[q][m] :
        !!rangeValues[p][l]
      if (post) {
        console.log('>',p,q,l,m, player, level, rangeValues[p][l], q !== undefined ? cacheRangeValues[q][m] : '?')
        news.push([
          player,                                    level,
          known ? cacheRangeValues[q][m] : '?',      rangeValues[p][l],
          known ? cacheRangeLinks[q][m] : '',        rangeLinks[p][l],
          ...calcQualityRank(rangeValues, p, l),     // this expands to two items!
          new Date().toISOString().replace('T',' ').split('.')[0].substr(5, 11).replace('-','/')
        ])
      }
    }
  }
  console.log("changes:", news.length)

  // print news to verificaton sheet
  for (newItem of news) {
    let done = false
    for (let [i, oldItem] of verifyData.entries()) {
      if (newItem[0] == oldItem[0] && newItem[1] == oldItem[1]) { // find entry by matching player and level
        newItem.pop() // entry already exists, so remove timestamp to avoid overwriting it in next step
        verifyRange.offset(i+1, 0, 1, newItem.length).setValues([newItem])
        console.log('posted (edit)', newItem, 'to row', i+2)
        done = true
        break
      }
    } // else
    if (!done) {
      while (verifyData[freeCounter] && verifyData[freeCounter][0]) {freeCounter++} // find free row
      verifyRange.offset(freeCounter+1, 0, 1, newItem.length).setValues([newItem])
      console.log('posted (new)', newItem, 'to row', freeCounter+2)
      freeCounter++
    }  
  }
}

// saves verified ILs to cache and clears them
function save() {
  console.log('saving...')
  let verifyRange = verifySheet.getRange(1, 1, verifySheet.getLastRow(), verifySheet.getLastColumn())
  let verifyData = verifyRange.getDisplayValues().slice(1) // verifyRange includes header cos non-empty not allowed

  for (let [i, item] of verifyData.entries()) {
    if (item[9] == 'o' && item[0] && item[1]) { // any player/level pair that's been marked as 'o' in verify col.
      let l = levels.cache.indices[item[1]]     // look up column index of level in cache; can't save unknown level
      if (l !== undefined) {
        let q = players.cache.indices[item[0]]  // look up row index of player in cache; can't save unknown player
        if (q !== undefined) {
          let data = SpreadsheetApp.newRichTextValue().setText(item[3])                  // new cell value
          if (item[5]) {
            data.setLinkUrl(item[5])                                                     // add link
          } else {
            data.setTextStyle(SpreadsheetApp.newTextStyle().setUnderline(false).build()) // remove underline
          }
          cacheSheet.getRange(P_START+q, L_START+l) // get target cell
            .setNumberFormat('@')                   // reformat cell as plain text (helps with link detection)
            .setRichTextValue(data.build())         // then save value to cell (including applying link)
          verifyRange.offset(i+1,0,1,verifySheet.getLastColumn()).clearContent()         // clear row
          console.log('saved', item)
        } else {
          console.log('failed on unknown name', item)
          SpreadsheetApp.getUi().alert('Couldn\'t verify unknown name: ' + item[0]
            + '\nPut it in a blank row/column in the cache.')
          return false // error
        }
      } else {
        console.log('failed on unknown level', item)
        SpreadsheetApp.getUi().alert('Couldn\'t verify unknown level: ' + item[1]
          + '\nPut it in a blank row/column in the cache.')
        return false // error
      }
    }
  }
  return true // success
}

// initialises bidirectional mappings between indices and nice names of players
function readPlayers() {
  let players = {live: {names: [], indices: {}}, cache: {names: [], indices: {}}} // this is the layout
  for (let sheet of ['live', 'cache']) {
    let names = (sheet == 'live' ? liveSheet : cacheSheet)
      .getRange(P_START, 1, sheet == 'live' ? P : Pc, 1).getDisplayValues().map(row => row[0])
    players[sheet].names = names
    for (let p = 0; p < names.length; p++) {players[sheet].indices[names[p]] = p}
  }
  return players
}

// initialises bidirectional mappings between indices and nice names of levels
function readLevels() {
  let levels = {live: {names: [], indices: {}}, cache: {names: [], indices: {}}} // this is the layout
  for (let sheet of ['live', 'cache']) {
    let header = sheet == 'live' ? levelHeader : cacheLevelHeader

    for (let l=0; l<header[0].length; l++) {
      // read header
      let world = header[0][l]
      for (let k = l; world === ""; k--, world = header[0][k]) {} // seek backwards in merged cell to get value
      let episode = header[1][l]
      for (let k = l; episode === ""; k--, episode = header[1][k]) {}
      let sublevel = header[2][l]

      // process into nice level name
      world = world.substr(0, world.indexOf(' '))
      for (let word of ['Ep. ', ' Coins', '\n']) {episode = episode.replace(word, ' ').trim()}
      for (let word of [' Level', ' Only', ' Route', '\n']) {sublevel = sublevel.replace(word, '')}
      let name = (world + ' ' + episode + ' ' + sublevel).trim()
      if (levels[sheet].names[l-1] == name) {name = 'divider after ' + name}

      // store level name
      levels[sheet].names[l] = name; levels[sheet].indices[name] = l
    }
  }
  return levels
}

// gets quality and rank of IL in table at player p0, level l. derived from calcPointsAndRanks
function calcQualityRank(table, p0, l) {
  let reversed = isReverseLevel(l)

  // 1. parse and sort
  let series = [] // rangeValues, to be sorted + filtered, with references to original indices
  for (let p=0; p<P; p++) {
    if (table[p][l] != '') {
      let time = parseTime(table[p][l], reversed)
      if (time) {series.push({index: p, time: time})}
    }
  }
  series.sort(reversed ? (a,b) => a.time - b.time : (a,b) => b.time - a.time) // worst to best
  
  // 2. calculate ranks; generate ranks array
  let K = series.length
  let rangeRanks = newList(P)
  let prev = null
  for (let k=K-1; k>=0; k--) { // rank = K-k of right-most member of each tied group
    rangeRanks[series[k].index] = series[k].time != prev ? K-k : rangeRanks[series[k+1].index]
    prev = series[k].time
  }

  let rankquality = rangeRanks[p0] ? (K+1 - rangeRanks[p0])/K : '-'
  let rank = rangeRanks[p0] ? rangeRanks[p0] : '-'
  return [rankquality, rank]
}
