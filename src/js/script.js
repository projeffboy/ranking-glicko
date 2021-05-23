{    
    'use strict'

    /* Calculator */
    calc.onclick = function() {
        let eA = glickoProb(
            ratingA.value, deviationA.value, ratingB.value, deviationB.value
        )
        let percentage = (eA * 100).toFixed(2)
        chanceA.innerHTML = `Player A has a ${percentage}% chance of beating player B.`
    }

    /* Global Variables */
    let i = 0
    let g = {}
    let players = {}
    let acc = document.getElementsByClassName('accordion')
    let MQ = MathQuill.getInterface(2)
    let SM = document.getElementsByClassName('SM') // SM stands for Static Math

    /* g Properties */
    g.Rmedian = 0
    g.RDmedian = 0

    /* Bootstrap Collapse */
    for (i = 0; i < acc.length; i++) {
      acc[i].onclick = function() {
        this.classList.toggle('active')
        let panel = this.nextElementSibling
        if (panel.style.maxHeight){
          panel.style.maxHeight = null
        } else {
          panel.style.maxHeight = panel.scrollHeight + 'px'
        }
      }
    }

    /* Mathquill */

    [].forEach.call(SM, function(elem, i) {
            MQ.StaticMath(SM[i])
        })

    /* Calculates Glicko Probability */
    glickoProb = (rA, RDA, rB, RDB) => {
        /*
        let x = 0
        let mean = rA - rB
        let letiance = RDA * RDA + RDB * RDB
        return 1 - (0.5 * (1 + erf((x - mean) / Math.sqrt(2 * letiance))))
        */
        let q = Math.sqrt(3) * Math.log(10) / 400 / Math.PI
        q *= q
        let Ea = 400 * Math.sqrt(1 + q * (RDA * RDA + RDB * RDB))
        Ea = (rB - rA) / Ea
        Ea = 1 / (1 + Math.pow(10, Ea))
        return Ea
    }

    erf = x => {
        // save the sign of x
        let sign = (x >= 0) ? 1 : -1
        x = Math.abs(x)
        // constants
        let a1 = 0.254829592
        let a2 = -0.284496736
        let a3 = 1.421413741
        let a4 = -1.453152027
        let a5 = 1.061405429
        let p = 0.3275911
        // A&S formula 7.1.26
        let t = 1.0/(1.0 + p * x)
        let y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x)
        return sign * y // erf(-x) = -erf(x)
    }

    /* Simulate Rankings */
    function simulation() {
        // Randomly generate rating and rating deviation for all players
        for (i = 1; i <= 250; i++) {
            players['p' + i] = {
                r: 1000 + Math.random() * 1000,
                RD: 30 + Math.random() * 70
            }
        }
        // Return the mean player's stats
        let averageR = 0
        let averageRD = 0
        for (i = 1; i <= 250; i++) {
            averageR += players['p' + i].r
            averageRD += players['p' + i].RD
        }
        averageR /= 250
        averageRD /= 250
        // Calculate the average/estimated expected chances for each player
        for (i = 1; i <= 250; i++) {
            let Ea = 0
            for (let j = 1; j <= 250; j++) {
                if (i !== j) {
                    Ea += glickoProb(
                        players['p' + i].r,
                        players['p' + i].RD,
                        players['p' + j].r,
                        players['p' + j].RD
                    )
                }
            }
            Ea /= 249
            $.extend(players['p' + i], {
                winRate1: Ea,
                winRate2: glickoProb(players['p' + i].r, players['p' + i].RD, averageR, averageRD),
                winRate4: glickoProb(players['p' + i].r, players['p' + i].RD, 1500, 350)
            })
        }
        // Set the rank for each player
        for (let i = 1; i <= 4; i++) {
            for (j = 1; j <= 250; j++) {
                let rank = 1
                for (let k = 1; k <= 250; k++) {
                    if (j !== k && players['p' + j]['winRate' + i] < players['p' + k]['winRate' + i]) {
                        rank++
                    }
                }
                if (i === 1 && rank === 125) {
                    g.Rmedian = players['p' + j].r
                    g.RDmedian = players['p' + j].RD
                    // Median estimated expected chance
                    for (k = 1; k <= 250; k++) {
                        players['p' + k].winRate3 = glickoProb(players['p' + k].r, players['p' + k].RD, g.Rmedian, g.RDmedian)
                    }
                }
                players['p' + j]['ranking' + i] = rank++
            }
        }
        // Display the results on a table
        for (i = 1; i <= 250; i++) {
            let num
            let classNames = ['', '', '']
            for (let j = 1; j <= 250; j++) {
                if (players['p' + j].ranking1 === i) {
                    num = j
                    let player = players['p' + j]
                    for (k = 0; k < 3; k++) {
                        if (player.ranking1 > player['ranking' + (k + 2)]) {
                            classNames[k] = 'green'
                        } else if (player.ranking1 < player['ranking' + (k + 2)]) {
                            classNames[k] = 'red'
                        }
                    }
                }
            }
            rankings.innerHTML += `
                <tr>
                    <td>${players['p' + num].ranking1}</td>
                    <td>${Math.round(players['p' + num].r)}</td>
                    <td>${Math.round(players['p' + num].RD)}</td>
                    <td>${players['p' + num].winRate1.toFixed(4)}</td>
                    <td class='${classNames[0]}'>${players['p' + num].winRate2.toFixed(4)}</td>
                    <td class='${classNames[1]}'>${players['p' + num].winRate3.toFixed(4)}</td>
                    <td class='${classNames[2]}'>${players['p' + num].winRate4.toFixed(4)}</td>
                </tr>
            `
        }
        let testPlayers = ['mean', 'median', 'new']
        let testRatings = [averageR, g.Rmedian, 1500]
        let testRDs = [averageRD, g.RDmedian, 350]
        let accuracy = [0, 0, 0]
        let meanChange = [0, 0, 0]
        let sdChange = [0, 0, 0]
        for (i = 0; i < 3; i++) {
            for (j = 1; j <= 250; j++) {
                let player = players['p' + j]
                if (player.ranking1 === player['ranking' + (i + 2)]) {
                    accuracy[i] += 1
                }
                meanChange[i] += Math.abs(player.ranking1 - player['ranking' + (i + 2)])
            }
            meanChange[i] /= 250
            for (j = 1; j <= 250; j++) {
                let player = players['p' + j]
                let deviation = player.ranking1
                deviation -= player['ranking' + (i + 2)]
                deviation = Math.abs(deviation)
                deviation -= meanChange[i]
                deviation *= deviation
                sdChange[i] += deviation
            }
            sdChange[i] /= 250
            sdChange[i] = Math.sqrt(sdChange[i])
            let percentage = (accuracy[i] / 250 * 100).toFixed(2)
            estimatedEa.innerHTML += `
                <tr>
                    <td>${testPlayers[i]}</td>
                    <td>${parseInt(testRatings[i])}</td>
                    <td>${parseInt(testRDs[i])}</td>
                    <td>${percentage}%</td>
                    <td>${meanChange[i].toFixed(4)}</td>
                    <td>${sdChange[i].toFixed(4)}</td>
                </tr>
            `
        }
    }
    simulation()

    /* Display the Year at the Footer */
    function displayYear() {
        year.innerHTML = ' 2016-' + new Date().getFullYear() + ' '
    }
    displayYear()
}
