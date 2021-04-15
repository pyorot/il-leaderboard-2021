// Original WR bolder script written by scatter 2018-11
// Updated/Extended by 1UpsForLife 2020-01-09, 2020-03-16

// global variables assigned depending on sheet
var sheet                       // sheet object representing the edited sheet
var sheetName                   // sheet name
var sheetP, sheetR              // sheet object representing the backend points+ranks sheets for the edited sheet
var TPOSE                       // if false, players (A) are rows and levels (B) are columns; opposite if true
var P_START, P                  // players -- rsp. row (col) number of first player, and number of players
var L_START, L                  // levels -- rsp. col (row) number of first level, and number of levels
var ALLOW0DP, ALLOW1DP, ALLOWXX // whether to accept times w/ (respectively) no decimals, 1dp, or ending in .xx

function ILScriptEntry(e) {
  var lock = LockService.getScriptLock()  // strict one-execution-at-a-time-lock
  lock.waitLock(150000)                   // lock acquire timeout 150s
  sheet = SpreadsheetApp.getActiveSheet()
  sheetName = sheet.getSheetName()
  var range = e.range
  console.log('edit trigger: sheet',sheetName,', range',e.range,', row/col',e.range.getRow(),e.range.getColumn())

  if (['ILs', '120 ILs', 'RTA Strat ILs', 'Bingo ILs'].includes(sheetName)) {
    // 1. settings
    switch (sheetName) { // manual settings
      case 'ILs':
        P_START = 4;  L_START = 8;  TPOSE = false;  ALLOW0DP = false;  ALLOW1DP = true;   ALLOWXX = false;  break
      case '120 ILs':
        P_START = 4;  L_START = 8;  TPOSE = false;  ALLOW0DP = false;  ALLOW1DP = true;   ALLOWXX = true;   break
      case 'RTA Strat ILs':
        P_START = 4;  L_START = 5;  TPOSE = true;   ALLOW0DP = false;  ALLOW1DP = true;   ALLOWXX = false;  break
      case 'Bingo ILs':
        P_START = 3;  L_START = 8;  TPOSE = false;  ALLOW0DP = true;   ALLOW1DP = true;   ALLOWXX = false;  break
    }
    let backendSheet = SpreadsheetApp.openById(backendSheetID)
    sheetP = backendSheet.getSheetByName(sheetName + ' P')
    sheetR = backendSheet.getSheetByName(sheetName + ' R')
    P = ((!TPOSE ? sheet.getLastRow() : sheet.getLastColumn()) + 1) - P_START
    L = ((!TPOSE ? sheet.getLastColumn() : sheet.getLastRow()) + 1) - L_START

    // 2. pick and run update method
    if(range.getColumn() == 1 && range.getRow() == 1 && e.value == '*') {   // one-off complete resyncs (3m+)
      initSheet()
    }
    else if(e.value === undefined && e.oldValue === undefined
            && (e.range.getNumColumns()>1 || e.range.getNumRows()>1)) { // mods swap rows (15s)
      // the double-undefined check here is a workaround of https://issuetracker.google.com/issues/181805601
      // value and oldValue are both undefined if a cell/range is moved/copied and not in most other cases
      updateSheet()
    }
    else if(toL(range) >= 0 && toP(range) >= 0){ // players edit cells (4s)
      updateLevel(range)
    }
  }

  else {
    switch (sheetName) {
      case 'Any% Best Segments':
        if(range.getColumn() > 2){
          AnypBolder(sheet, range);
        }
        break;
      case '120 Best Segments':
        if(range.getColumn() > 1){
          OneTwentyBolder(sheet, range);
        }
        break;
    }  
  }

  lock.releaseLock()
}

// == utilities for constructing tables and transposing inputs ==

// constructs a matrix filled with undefined values
function newTable(numRows, numCols) { return Array(numRows).fill().map(()=>Array(numCols).fill()) }
// constructs a list filled with undefined values
function newList(length)            { return Array(length).fill() }
// converts inputs for getting range/cell from p/l form to real row/column form
function toRC(p0, l0, pN, lN)       { return !TPOSE ? [p0, l0, pN, lN] : [l0, p0, lN, pN] }
function toRC2(p0, l0)              { return !TPOSE ? [p0, l0] : [l0, p0] }
// gets the l/p index of a cell
function toL(cell)                  { return (!TPOSE ? cell.getColumn() : cell.getRow()) - L_START }
function toP(cell)                  { return (!TPOSE ? cell.getRow() : cell.getColumn()) - P_START }
// converts a level (l) between table (matrix) and series (array) representation
function toLTable(series)           { return !TPOSE ? series.map(row => [row]) : [series] }
function toSeries(ltable)           { return !TPOSE ? ltable.map(row => row[0]) : ltable[0] }
