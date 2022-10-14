// run these functions by setting the parameters in the first few lines, then selecting the function from the
// drop-down bar above and clicking "Run".
// beware that these API calls are mad slow, so script may hit time limit and require hacking around to cover a
// whole sheet; this + the unreliability of the individual API calls means we rely on verifying it worked at the
// end using the verifyProtections function.

// set protection on a single row/column based on directory lookup of name and sheet mods
function setProtectionRow() {
  let sheetName = "Free ILs"
  let index = 16               // row/column number (first row/column = 1; convert letters to number for columns)
  let transposed = false       // false if players have rows; true if players have columns

  let [users, mods] = getDirectory(sheetName)

  // find protection; make new one if missing
  let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName)
  let target
  for (let p of sheet.getProtections(SpreadsheetApp.ProtectionType.RANGE)) {
    if ((!transposed ? p.getRange().getRow() : p.getRange().getColumn()) == index) {
      target = p
      break
    }
  }
  if (!target) {
    let series = !transposed ?
      sheet.getRange(index, 1, 1, sheet.getMaxColumns()) :
      sheet.getRange(1, index, sheet.getMaxRows(), 1)
    target = series.protect().setDescription('series - ' + series.getCell(1,1).getValue())
  }
  console.log('got protected range', target.getDescription())

  // set protection
  target.removeEditors(target.getEditors())
  let name = target.getRange().getCell(1,1).getValue().toLowerCase()
  let email = users[name]
  if (email) {
    target.addEditors(mods.concat(email))
    console.log("registered", name)
  } else {
    target.addEditors(mods)
    console.log("   generic", name)
  }

  // print protection
  console.log("editors:\n", target.getEditors().map(user => user.getEmail()))
}

// adds/removes one person to every protected range in every sheet
function addMod() {
  let email = ""
  let remove = false // swaps to removing instead of adding

  for (let sheet of SpreadsheetApp.getActiveSpreadsheet().getSheets()) {
    for (let p of sheet.getProtections(SpreadsheetApp.ProtectionType.RANGE)) {
      if (p.canEdit()) {
        remove ? p.removeEditor(email) : p.addEditor(email)
        console.log(remove ? "removed:" : "added:", p.getDescription(), "@", sheet.getName())
      } else {
        console.log("error: couldn't edit protected range", p.getDescription(), "@", sheet.getName())
      }
    }
  }
}

// reassigning all protections is slow and can get messed up on timeout; gotta verify
function verifyProtections() {
  let sheetName = "Free ILs"

  let [users, mods] = getDirectory(sheetName)
  // iterate thru protections
  let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName)
  let protections = sheet.getProtections(SpreadsheetApp.ProtectionType.RANGE)
  let knownNames = {}
  for (let p of protections) {
    if (p.canEdit()) {
      let description = p.getDescription()
      let editors = p.getEditors().map(user => user.getEmail())
      let name = p.getRange().getCell(1,1).getValue().toLowerCase()
      if (knownNames[name + p.getRange().getRow()]) { // checking the name + row-number pair
        return console.log("failed: duplicate protections at", description, "for", name)
      } else {
        knownNames[name + p.getRange().getRow()] = true
      }
      let player = users[name]
      // check everyone is mod or player
      for (let editor of editors) {
        if (!mods.includes(editor) && !(editor == player)) {
          return console.log("failed: unknown editor on", description, ":", editor, "; expected mod or ", player)
        }
      }
      // check all mods are present
      for (let mod of mods) {
        if (!editors.includes(mod)) {
          return console.log("failed: missing mod on", description, ":", mod)
        }
      }
      // check player is present when applicable
      if (player && !editors.includes(player)) {
        return console.log("failed: missing player on", description, ":", player)
      }
      console.log("verified", description, player ? "" : "[GENERIC]")
    } else {
      console.log("error: couldn't access protected range", protection.getDescription())
    }
  }
  console.log("passed; number of protections =", protections.length)
}

// get users and mods from backend sheet
function getDirectory(sheetName) {
  let dirBackend = SpreadsheetApp.openById(permDirID)
  // get users
  let userSheet = dirBackend.getSheetByName('Users')
  let userTable = userSheet.getRange(2, 1, userSheet.getLastRow() - 1, 6).getValues()
  let users = {}
  for (let i = 0; i < userTable.length; i++) {
    for (let j = 1; j <= 5; j++) {
      let name = userTable[i][j].trim()
      if (name) {
        if (!users[name]) {
          users[name] = userTable[i][0].trim()
        } else {
          console.log('error: multiple definitions of user', name)
          return
        }
      }
    }
  }
  // get mods
  let modSheet = dirBackend.getSheetByName('Mods')
  let modTable = modSheet.getRange(1, 1, modSheet.getLastRow(), modSheet.getLastColumn()).getValues()
  let mods = []
  for (let j=0; j<modTable[0].length; j++) {
    if (['global', sheetName].includes(modTable[0][j])) {
      for (let i=1; i<modTable.length; i++) {
        let email = modTable[i][j].trim()
        if (email) {mods.push(email)}
      }
    }
  }
  console.log("imported directory; mods:\n", mods)
  return [users, mods]
}

// removes all protected ranges and creates new ones for the header and every non-empty column
// note that each range is default-initialised to have everyone as editor
// this only needs to be run when sheet dimensions are changed
// if the script goes past the end of data (e.g. cos crap at end of Bingo sheet), click Stop
function initProtections() {
  let sheetName = "ILs"
  let firstIndex = 4     // number of first row/column with data
  let transposed = false // false = row per player; true = column per player

  let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName)
  for (let p of sheet.getProtections(SpreadsheetApp.ProtectionType.RANGE)) {
    if (p.canEdit()) {p.remove()}
  }
  console.log("cleared all protected series")

  let table = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getMaxColumns())
  if (!transposed) { // each player has a row  
    table.offset(0, 0, firstIndex-1, sheet.getMaxColumns()).protect().setDescription('header')
    for (let i = firstIndex; i <= sheet.getLastRow(); i++) {
      let series = table.offset(i-1, 0, 1, sheet.getMaxColumns())
      series.protect().setDescription('series - ' + series.getCell(1,1).getValue())
      console.log("added protected row", i)
    }
  } else { // each player has a column
    table.offset(0, 0, sheet.getMaxRows(), firstIndex-1).protect().setDescription('header')
    for (let j = firstIndex; j <= sheet.getLastColumn(); j++) {
      let series = table.offset(0, j-1, sheet.getMaxRows(), 1)
      series.protect().setDescription('series - ' + series.getCell(1,1).getValue())
      console.log("added protected col", j)
    }
  }
}

// takes all existing protected ranges and assigns the correct user/mods to them based on the backend directory
function reassignProtections() {
  let sheetName = "ILs"

  let [users, mods] = getDirectory(sheetName)
  // assign email addresses to ranges
  let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName)
  for (let p of sheet.getProtections(SpreadsheetApp.ProtectionType.RANGE)) {
    if (p.canEdit()) {
      let previousEditors = p.getEditors()
      if (previousEditors.length < 100) { continue } // skip ranges that have already been restricted
      p.removeEditors(previousEditors)
      if (p.getDescription() == 'header') {
        p.addEditors(mods)
        console.log("protected header")
      } else {
        let name = p.getRange().getCell(1,1).getValue().toLowerCase()
        let email = users[name]
        if (email) {
          p.addEditors(mods.concat(email))
          console.log("registered", name)
        } else {
          p.addEditors(mods)
          console.log("   generic", name)
        }
      }
    } else {
      console.log("error: couldn't edit protected range", protection.getDescription())
    }
  }
}

// extracts user directories from the existing protected ranges on a sheet
// you can take the output, convert it to spreadsheet using an online tool, then paste into backend sheet
function extractUsers() {
  let sheetName = ""

  let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName)
  let users = {}
  for (let p of sheet.getProtections(SpreadsheetApp.ProtectionType.RANGE)) {
    if (p.canEdit()) {
      let editors = p.getEditors().filter(editor => !modEmails.includes(editor.getEmail()))
      let name = p.getRange().getCell(1,1).getValue().toLowerCase()
      if (editors.length == 1) {
        let email = editors[0].getEmail()
        users[name] = email
      } else if (editors.length < 10) {
        console.log("error: no unique editor:", name, editors.map(editor => editor.getEmail()))
      }
    } else {
      console.log("error: couldn't access editors for", p.getDescription())
    }
  }
  console.log("directory size:", Object.keys(users).length)
  console.log(users)
}
