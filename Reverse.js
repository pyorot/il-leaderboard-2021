function isReverseLevel(l) {
  switch (sheetName) {
    case 'ILs':
    case '120 ILs':
      let world = levels[0][l]
      for (let k = l; world === ""; k--, world = levels[0][k]) {} // seek backwards in merged cell to get value
      let episode = levels[1][l]
      for (let k = l; episode === ""; k--, episode = levels[1][k]) {}
      let sublevel = levels[2][l]
      
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
      let shine = levels[l][0]
      for (let k = l; shine === ""; k--, shine = levels[k][0]) {} // seek upwards to get non-empty row value
      let names =  ['Red Coins on the Water', 'Red Coins in the Hotel', 'Piantas in Need',
                    'Airstrip Reds', 'Box Game 1', 'Box Game 2']
      return shine.trim().substring(0,4) == "Reds" || names.includes(shine.trim())
    
    case 'Bingo ILs':
      let group = levels[0][l]
      for (let k = l; group === ""; k--, group = levels[0][k]) {} // seek backwards in merged cell to get value
      return group == "Hidden Reds Hoverless"
    
    default: throw `unknown sheet: "${sheetName}"`
  }
}
