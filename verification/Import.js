// functions imported verbatim from main IL sheet codebase

// == Reverse.gs ==

function isReverseLevel(l) {
  let world, episode, sublevel, shine, strat, group
  switch (sheetName) {
    case 'ILs':
    case '120 ILs':
      world = levelHeader[0][l]
      for (let k = l; world === ""; k--, world = levelHeader[0][k]) {} // seek backwards in merged cell to get value
      episode = levelHeader[1][l]
      for (let k = l; episode === ""; k--, episode = levelHeader[1][k]) {}
            
      switch(world){
        case "Bianco Hills":                 return ["Ep. 3 Reds", "Ep. 6 Reds"].includes(episode)
        case "Ricco Harbor":                 return ["Ep. 6",      "Ep. 4 Reds"].includes(episode)
        case "Gelato Beach / Mamma Beach":   return episode === "Ep. 1 Reds"
        case "Pinna Park":                   return ["Ep. 2 Reds", "Ep. 6 Reds"].includes(episode)
        case "Sirena Beach":                 return ["Ep. 6", "Ep. 8", "Ep. 2 Reds", "Ep. 4 Reds"].includes(episode)
        case "Noki Bay / Mare Bay":          return episode === "Ep. 6 Reds"
        case"Pianta Village / Monte Village":return ["Ep. 6",      "Ep. 5 Reds"].includes(episode)
        case "Delfino Plaza":                return episode === "Airstrip Reds" || episode.slice(0,8) === "Box Game"
        default: throw `unknown world: "${world}"`
      }

    case 'RTA Strat ILs':
      shine = levelHeader[l][0]
      for (let k = l; shine === ""; k--, shine = levelHeader[k][0]) {} // seek upwards to get non-empty row value
      shine = shine.trim()
      strat = levelHeader[l][1]; strat = strat.substring(strat.indexOf(']')+2).trim()
      return shine.substring(0,4) == "Reds"
        || ['Airstrip Reds (+ 99 coins)', 'Box Game 1', 'Box Game 2'].includes(shine)
        || (shine == 'Episode 6' && ['boomer route', 'normal route', 'no RNG spam-spray unlock'].includes(strat))
        || (shine == 'Episode 8' && strat == 'Paper route')
    
    case 'Misc ILs':
      group = levelHeader[0][l]
      for (let k = l; group === ""; k--, group = levelHeader[0][k]) {} // seek backwards in merged cell to get value
      return group == "Hidden Reds Hoverless"
    
    case 'Free ILs':
      world = levelHeader[0][l]
      for (let k = l; world === ""; k--, world = levelHeader[0][k]) {} // seek backwards in merged cell to get value
      episode = levelHeader[1][l]
      return world === "Sirena Beach" && ["Ep. 8",      "Ep. 2 Reds"].includes(episode)
    
    default: throw `unknown sheet: "${sheetName}"`
  }
}
  
// == Time.gs ==

const regex = /^(?!0)(?:(?:(\d?\d)\:(?=\d\d))?([0-5]?\d)\:(?=\d\d))?([0-5]?\d)(?:\.(\d\d?|xx))?$/

function parseTime(input, reversed) {
  // run regex, validate and convert values
  let matches = input.match(regex) // returns null or [fullMatch, hrs, mins, secs, centisecs]
  if      (!matches)               {return null}
  else if (!matches[4])            { if (ALLOW0DP) {matches[4] = reversed ? '00' : '99'} else {return null} }
  else if (matches[4] == 'xx')     { if (ALLOWXX)  {matches[4] = reversed ? '00' : '99'} else {return null} }
  else if (matches[4].length == 1) { if (ALLOW1DP) {matches[4] += '0'}                   else {return null} }
  // return result in seconds
  for (let i=1; i<matches.length; i++) { matches[i] = matches[i] ? parseInt(matches[i]) : 0 }
  return parseInt(matches[1]*60*60 + matches[2]*60 + matches[3]) + matches[4]/100
}

// == Utils.gs ==

// constructs a list filled with undefined values
function newList(length)            { return Array(length).fill() }
