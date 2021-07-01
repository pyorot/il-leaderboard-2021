// == todo ==
// getLinkURL() returns nothing if RichTextValue's text is null, even when cell not empty; investigate this
// - current theory: cells must be formatted as Plain Text for RichTextValue.text to be correct

// == technical limitations ==
// getLinkUrl() must be called per cell, can't be combined into one call for range; this is biggest speed bottleneck

// returns series of points + ranks from series of times + link, and mutates rangeValues (invalid times become '-')
// both outputs, rangeValues and rangeLinks are P-arrays (function is transposition-invariant)
// data is pure times with no headers, indexed by order of names
function calcPointsAndRanks(rangeValues, rangeLinks, reversed) {
  // 1. parse and sort
  let series = [] // rangeValues, to be sorted + filtered, with references to original indices
  for (let p=0; p<P; p++) {
    if (rangeValues[p] != '') {
      let time = parseTime(rangeValues[p], reversed)
      if (time) {
        series.push({  index: p,  time: time,  link: rangeLinks[p]  })
      } else {
        rangeValues[p] = '-' // placeholder meaning "invalid time"
      }
    }
  }
  series.sort(reversed ? (a,b) => a.time - b.time : (a,b) => b.time - a.time) // worst to best

  // 2. calculate points; generate points array
  let rangePoints = newList(P)
  let prev = null
  for (let k=0; k<series.length; k++) { // points = k+1 of left-most member of each tied group
    rangePoints[series[k].index] = series[k].time != prev ? k+1 : rangePoints[series[k-1].index]
    prev = series[k].time
  }

  // 3. filter to linked videos; calculate ranks; generate ranks array
  let seriesLinked = series.filter(item => item.link != null)
  let K = seriesLinked.length
  let rangeRanks = newList(P)
  prev = null
  for (let k=K-1; k>=0; k--) { // rank = K-k of right-most member of each tied group
    rangeRanks[seriesLinked[k].index] = seriesLinked[k].time != prev ? K-k : rangeRanks[seriesLinked[k+1].index]
    prev = seriesLinked[k].time
  }

  return [rangePoints, rangeRanks]
}


// updates names and clears body of backend sheets 
function updateNamesAndClear() {
  let names = sheet.getRange(...toRC(P_START, 1, P, 1)).getDisplayValues()  // get player names from main sheet
  for (let sh of [sheetP, sheetR]) {
    sh.getRange(...toRC(2, 1, P, 1)).setValues(names)                       // paste names into backend
    sh.getRange(...toRC(2, L_START, sh.getLastRow()-1, sh.getLastColumn()+1-L_START)).clear()   // clear body
  }
}


// updates a single level (column), storing points+ranks and highlighting column
function updateLevel(cell) {
  // 1. get data
  let l = toL(cell)
  let p0 = toP(cell)
  let range = sheet.getRange(...toRC(P_START, L_START+l, P, 1))
  let rangeValues = toSeries(range.getDisplayValues())                                // single api call
  let rangeLinks  = toSeries(range.getRichTextValues()).map(x => x.getLinkUrl())      // 1 api call/cell (slow)
  let rangeColors = toSeries(range.getTextStyles()).map(x => x.getForegroundColor())  // 1 api call/cell (slow)

  // 2. process data
  let [rangePoints, rangeRanks] = calcPointsAndRanks(rangeValues, rangeLinks, isReverseLevel(l))

  // 3. highlighting
  rangeColors[p0] = null // this forces reformat on edited cell; need this cos e.g. https://imgur.com/VQTsYs6
  formatSeries(l, rangeValues, rangeRanks, rangeColors)

  // 4. sheet updates
  sheetP.getRange(...toRC(2, L_START+l, P, 1)).setValues(toLTable(rangePoints))
  sheetR.getRange(...toRC(2, L_START+l, P, 1)).setValues(toLTable(rangeRanks))
  if (L_START-2 >= 1) {
    sheet.getRange(...toRC(P_START, 2, P, L_START-2)).setValues(
      sheetP.getRange(...toRC(2, 2, P, L_START-2)).getDisplayValues())
  }
}


// updates points+ranks of whole sheet; does not highlight anything (cos that's slow)
function updateSheet() {
  // 1. update names and blank backend sheet
  Logger.log("method: updateSheet")
  updateNamesAndClear()
  Logger.log("cleared backend sheets")

  // 2. get data
  let fullRange = sheet.getRange(...toRC(P_START, L_START, P, L))
  let fullRangeValues = fullRange.getDisplayValues()
  let fullRangeLinks = fullRange.getRichTextValues().map(row => row.map(entry => entry.getLinkUrl())) // slow
  Logger.log("loaded links")

  // 3. process data
  let [fullRangePoints, fullRangeRanks] = [newTable(...toRC(P,L)), newTable(...toRC(P,L))]
  for (let l = 0; l < L; l++) {
    let rangeValues = !TPOSE ? fullRangeValues.map(row => row[l]) : fullRangeValues[l]
    let rangeLinks =  !TPOSE ? fullRangeLinks.map(row => row[l])  : fullRangeLinks[l]
    let [rangePoints, rangeRanks] = calcPointsAndRanks(rangeValues, rangeLinks, isReverseLevel(l))
    if (!TPOSE) {
      for (let p = 0; p < P; p++) {
        fullRangePoints[p][l] = rangePoints[p]
        fullRangeRanks[p][l] = rangeRanks[p]
      }
    } else {
      fullRangePoints[l] = rangePoints
      fullRangeRanks[l] = rangeRanks
    }
  }

  // 4. update stats
  sheetP.getRange(...toRC(2, L_START, P, L)).setValues(fullRangePoints)
  sheetR.getRange(...toRC(2, L_START, P, L)).setValues(fullRangeRanks)
  if (L_START-2 >= 1) {
    sheet.getRange(...toRC(P_START, 2, P, L_START-2)).setValues(
      sheetP.getRange(...toRC(2, 2, P, L_START-2)).getDisplayValues())
  }
}


// updates points+ranks+highlighting for whole sheet; unoptimised
function initSheet() {
  Logger.log("method: initSheet")
  updateNamesAndClear()
  let range = sheet.getRange(...toRC(P_START, L_START, 1, L))                  // get (any) player series
  for (let l = 0; l < L; l++) { updateLevel(range.getCell(...toRC2(1,l+1))) }  // run updateLevel on each cell
}
