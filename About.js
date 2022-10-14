// == IL Sheet Scripts ==
// Original WR bolder script written by scatter 2018-11
// Updated/Extended by 1UpsForLife 2020-01-09, 2020-03-16
// Formatting and points/ranks of the "ILs" sheets (re)written by shoutplenty Q1 2021

// This project's public repository is at https://github.com/pyorot/il-scripts;
// See the readme there for more info on how it works.

// IDs of the relevant sheets are (where URL = https://docs.google.com/spreadsheets/d/<ID>):
const mainSheetID    = '12wDUXjLqmcUuWSEXWc1fHNJc24KlfyCh0pvibZYEQM0' // main sheet
const backendSheetID = '1TmUN3wpUNRCEVTKu1rBXVXtF3KRerCENoIlEhoFCNng' // points/ranks cache sheet
const permDirID      = '1jr0oWEFjt8wDpYdznRwQBW0Gx37aAhjYQTZWARXhsZE' // user directory for permissions scripts

// global variables assigned depending on sheet
var sheet                       // sheet object representing the edited sheet
var sheetName                   // sheet name
var sheetP, sheetR              // sheet object representing the backend points+ranks sheets for the edited sheet
var levelHeader                 // sheet levels header range, used by isReverseLevel (see Reverse.gs)
var TPOSE                       // if false, players (A) are rows and levels (B) are columns; opposite if true
var P_START, P                  // players -- rsp. row (col) number of first player, and number of players
var L_START, L                  // levels -- rsp. col (row) number of first level, and number of levels
var ALLOW0DP, ALLOW1DP, ALLOWXX // whether to accept times w/ (respectively) no decimals, 1dp, or ending in .xx

// global variable setter
function setGlobals(sheetName) {
  // 1. settings
  switch (sheetName) { // manual settings
    case 'ILs':
      P_START = 5;  L_START = 8;  TPOSE = false;  ALLOW0DP = false;  ALLOW1DP = false;  ALLOWXX = false;  break
    case '120 ILs':
      P_START = 4;  L_START = 8;  TPOSE = false;  ALLOW0DP = false;  ALLOW1DP = false;  ALLOWXX = true;   break
    case 'RTA Strat ILs':
      P_START = 4;  L_START = 5;  TPOSE = true;   ALLOW0DP = false;  ALLOW1DP = false;  ALLOWXX = false;  break
    case 'Misc ILs':
      P_START = 3;  L_START = 8;  TPOSE = false;  ALLOW0DP = true;   ALLOW1DP = false;  ALLOWXX = false;  break
    case 'Free ILs':
      P_START = 3;  L_START = 8;  TPOSE = false;  ALLOW0DP = false;  ALLOW1DP = false;  ALLOWXX = false;  break
  }
  let backendSheet = SpreadsheetApp.openById(backendSheetID)
  sheetP = backendSheet.getSheetByName(sheetName + ' P')
  sheetR = backendSheet.getSheetByName(sheetName + ' R')
  P = ((!TPOSE ? sheet.getLastRow() : sheet.getLastColumn()) + 1) - P_START
  L = ((!TPOSE ? sheet.getLastColumn() : sheet.getLastRow()) + 1) - L_START
  levelHeader = sheet.getRange(...toRC(1, L_START, P_START-1, L)).getDisplayValues()
}
