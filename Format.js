var COLOR_1       = '#e8b600'
var COLOR_2       = '#999999'
var COLOR_3       = '#b35c00'
var COLOR_DEFAULT = '#000000'
var COLOR_LINK    = '#1155cc'
var COLOR_ERROR   = '#ff0000'
var BORDER_BOLD   = SpreadsheetApp.BorderStyle.SOLID_MEDIUM

// formats the series on the active sheet for level l, using gold/silver/bronze convention
function formatSeries(l, rangeValues, rangeRanks, rangeColors) {
  for (let p=0; p<P; p++) {
    let [rank, color, value] = [rangeRanks[p], rangeColors[p], rangeValues[p]]
    if (value == '-') {
      if        (                color != COLOR_ERROR   ) {formatCell(p, l, COLOR_ERROR  )} // misformatted
    } else {
      if (sheetName != 'RTA Strat ILs') {                   // medal formatting
        if      (rank == 1    && color != COLOR_1       ) {formatCell(p, l, COLOR_1      )} // gold
        else if (rank == 2    && color != COLOR_2       ) {formatCell(p, l, COLOR_2      )} // silver
        else if (rank == 3    && color != COLOR_3       ) {formatCell(p, l, COLOR_3      )} // bronze
        else if (rank >= 4    && color != COLOR_LINK    ) {formatCell(p, l, COLOR_LINK   )} // blue (linked)
        else if (rank == null && color != COLOR_DEFAULT ) {formatCell(p, l, COLOR_DEFAULT)} // black (unlinked)
      } else {                                              // plain formatting
        if      (rank >= 1    && color != COLOR_LINK    ) {formatCell(p, l, COLOR_LINK   )} // blue (linked)
        else if (rank == null && color != COLOR_DEFAULT ) {formatCell(p, l, COLOR_DEFAULT)} // black (unlinked)
      }
    }
  }
}

// formats the cell on the active sheet for player p and level l
function formatCell(p, l, color) {
  let [i, j] = toRC(P_START + p, L_START + l)
  let cell = sheet.getRange(i,j).getCell(1, 1)
  let bold = [COLOR_1, COLOR_2, COLOR_3, COLOR_ERROR].includes(color)
  // let underline = [COLOR_1, COLOR_2, COLOR_3, COLOR_LINK].includes(color)   // * see note at bottom
  cell.setFontColor(color)
  cell.setFontWeight(bold ? 'bold' : 'normal')
  // cell.setFontLine(underline ? 'underline' : 'none')                         // * see note at bottom
  cell.setBorder(null,null,(color==COLOR_1?true:false),null,false,false,COLOR_DEFAULT,BORDER_BOLD)
  // Logger.log(`formatted cell (${i},${j}): ${color}, ${bold}`)
}

// * don't force underlining cos we need to be able to spot glitched (undetected) links
//   fix those by setting the formatting to Plain Text, then re-linking the cell
