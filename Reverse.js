function isReverseLevel(l) {
  switch (sheetName) {
    case 'ILs':
    case '120 ILs':
      let world = levelHeader[0][l]
      for (let k = l; world === ""; k--, world = levelHeader[0][k]) {} // seek backwards in merged cell to get value
      let episode = levelHeader[1][l]
      for (let k = l; episode === ""; k--, episode = levelHeader[1][k]) {}
      let sublevel = levelHeader[2][l]
      
      console.log(world, episode, sublevel)
      
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
      let shine = levelHeader[l][0]
      for (let k = l; shine === ""; k--, shine = levelHeader[k][0]) {} // seek upwards to get non-empty row value
      shine = shine.trim()
      let strat = levelHeader[l][1]; strat = strat.substring(strat.indexOf(']')+2).trim()
      return shine.substring(0,4) == "Reds"
        || ['Airstrip Reds (+ 99 coins)', 'Box Game 1', 'Box Game 2'].includes(shine)
        || (shine == 'Episode 6' && ['boomer route', 'normal route', 'no RNG spam-spray unlock'].includes(strat))
        || (shine == 'Episode 8' && strat == 'Paper route')
    
    case 'Misc ILs':
      let group = levelHeader[0][l]
      for (let k = l; group === ""; k--, group = levelHeader[0][k]) {} // seek backwards in merged cell to get value
      return group == "Hidden Reds Hoverless"
    
    default: throw `unknown sheet: "${sheetName}"`
  }
}
