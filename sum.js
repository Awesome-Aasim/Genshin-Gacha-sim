const characterEventWish = require("./Resources/CharacterEventWish.json");
const weaponEventWish = require("./Resources/WeaponEventWish.json");

function calculateExpectedValue(baseProb, guaranteeProb, guarantee) {
    var result = 0;
    var complement = 1;
    // computes expected values for character and weapon event wish based off of geometric distribution
    for (var i = 0; i < guarantee; i++) {
        if (i == guarantee - 1) {
            result += (i + 1) * complement * guaranteeProb;
        } else {
            result += (i + 1) * complement * baseProb;
        }
        complement *= (1 - baseProb);
    }
    return result;
}

function calculateExpectedForWish(wish) {
    var guaranteeProbs = {
        4: wish.probabilities[3] + wish.probabilities[4],
        5: 1
    }
    var output = {
        "Expected value": {
            4: calculateExpectedValue(wish.probabilities[4], guaranteeProbs[4], wish.pityHit[4]),
            5: calculateExpectedValue(wish.probabilities[5], guaranteeProbs[5], wish.pityHit[5])
        }
    }
    output["Expected rates"] = {
        4: 1 / output["Expected value"][4],
        5: 1 / output["Expected value"][5]
    }
    return output;
}

function main(wish) {
    var wishCopy = JSON.parse(JSON.stringify(wish));
    var wishCopy2 = JSON.parse(JSON.stringify(wish));
    var data = {
        4: {}, 5: {}
    }
    var stop = false;
    while (wishCopy.pityHit[4] >= 1) {
        var d = calculateExpectedForWish(wishCopy);
        data[4][wishCopy.pityHit[4]] = d["Expected rates"][4];
        if (data[4][wishCopy.pityHit[4]] >= wishCopy.avg[4] && !stop) {
            wishCopy2.pityHit[4] = wishCopy.pityHit[4];
            stop = true;
        }
        wishCopy.pityHit[4]--;
    }
    stop = false;
    while (wishCopy.pityHit[5] >= 1) {
        var d = calculateExpectedForWish(wishCopy);
        data[5][wishCopy.pityHit[5]] = d["Expected rates"][5];
        if (data[5][wishCopy.pityHit[5]] >= wishCopy.avg[5] && !stop) {
            wishCopy2.pityHit[5] = wishCopy.pityHit[5];
            stop = true;
        }
        wishCopy.pityHit[5]--;
    }
    console.table(data[4]);
    console.table(data[5]);
    console.table(wishCopy2);
}

main(characterEventWish);
main(weaponEventWish);