function parseTimeTest() {
  ALLOW0DP = false
  ALLOW1DP = true
  ALLOWXX = false
  console.log(parseTime("48.0", false))
}

// expected result: [ [2, 3, 1, undefined], [2, 1, undefined, undefined] ]
function calcPointsAndRanksTest() {
  P = 4
  let rangeValues = ['41.16', '42.02', '37.75', 'p' ]
  let rangeLinks =  ['aa'   , 'bb'   , null   , null]
  let reversed = true
  console.log(calcPointsAndRanks(rangeValues, rangeLinks, reversed))
}
