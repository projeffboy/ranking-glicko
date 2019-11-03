/* Calculates Glicko Probability */
function glickoProb(rA, rB, RDA, RDB) {
    var p = Math.sqrt(3) * Math.log(10) / 400 / Math.PI;
    p *= p;
    var Ea = 400 * Math.sqrt(1 + p * (RDA * RDA + RDB * RDB));
    Ea = (rB - rA) / Ea;
    Ea = 1 / (1 + Math.pow(10, Ea));
    return Ea;
}

calc.onclick = function() {
    chanceA.value = glickoProb(ratingA.value, ratingB.value, deviationA.value, deviationB.value);
    chanceB.value = glickoProb(ratingB.value, ratingA.value, deviationB.value, deviationA.value);
};
