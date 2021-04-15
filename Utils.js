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
