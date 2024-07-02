// fs allows us to write out the output, especially helpful for large sample sizes
let fs = require('fs');
// get the wish probability distribution from the relevant JSON files
const characterEventWish = require("./Resources/CharacterEventWish.json");
const weaponEventWish = require("./Resources/WeaponEventWish.json");
var os = ""; //output stream/string
/**
 * Builds a distribution given probabilities as input
 * @param {JSON} probabilities A JSON object containing the probability data
 * @returns A JSON object containing a distribution for these probabilities
 */
function buildDist(probabilities) {
    var pos = 0;
    var result = {};
    for (var i in probabilities) {
        if (typeof probabilities[i] != "number") {
            throw new TypeError("Probability distribution must be an array or JSON object of numbers");
        } else {
            result[i] = {
                low: pos,
                high: probabilities[i] + pos
            };
            pos += probabilities[i];
        }
    }
    /*
    if the position is not 1, then something likely went wrong.
    Since this is JS I find it easier to use floats than to use integers
    if this was C++ or Java it would make more sense to use integers,
    as with floating point numbers you lose a bit of precision
    Since JS all numbers are floats why not convert it to integer
    */
    if (pos != 1) {
        throw new TypeError("Probabilities must add up to 1");
    }
    return result;
}
// The most important part of the simulation
/**
 * Simulates a pull given some probabilities, some pity counters, and where pity is hit
 * @param {JSON} prob The probabilities to use (JSON)
 * @param {JSON} pityCounters The pity counters to use (JSON)
 * @param {JSON} pityHit What values to use if the pity is hit (JSON)
 * @returns The result of the simulation, along with the old pity counters
 */
function pull(prob, pityCounters, pityHit) {
    // to avoid overwriting the probabilities, use object.assign to do a shallow copy
    var probabilities = Object.assign({}, prob);
    /*
    if 4* pity is reached, 3* probability goes down to zero,
    while the 4* probability goes up by the amount of the 3* probability
    see wish details on character page
    */
    if (pityCounters[4] == pityHit[4] - 1) {
        probabilities[4] += probabilities[3];
        probabilities[3] = 0;
    }
    /*
    if 5* pity is reached, 4* probability and 3* probability go down to zero,
    while the 5* probability goes up by the amount of the 4* probability and 3* probability
    */
    if (pityCounters[5] == pityHit[5] - 1) {
        probabilities[5] += probabilities[4] + probabilities[3];
        probabilities[3] = 0;
        probabilities[4] = 0;
    }
    // now build the distribution
    var dist = buildDist(probabilities);
    // generate a random number in this interval
    var num = Math.random();
    var result;
    // check where the random number falls
    for (var i in dist) {
        if (num >= dist[i].low && num < dist[i].high) {
            // and assign the result
            result = i;
        }
    }
    // give back the old pity counters
    var oldPityCounters = Object.assign({}, pityCounters);
    // then increment the appropriate ones, and reset the ones where the result is greater than pity

    if (pityCounters[5] == pityHit[5] - 1) {
        pityCounters[5] = 0;
        pityCounters[4] = 0;
    } else if (pityCounters[4] == pityHit[4] - 1) {
        pityCounters[4] = 0;
        pityCounters[5]++;
    } else {
        pityCounters[4]++;
        pityCounters[5]++;
    }
    return [result, oldPityCounters];
}
/**
 * The main function
 * @param {JSON} wish A JSON formatted object containing all the wish details
 */
function main(wish) {
    var pityCounters = {
        4: 0,
        5: 0
    };
    var pivotResults = {
        3: 0,
        4: 0,
        5: 0
    };
    var results = [];
    let sampleSize = 1048575; // the number of pulls to do
    for (var i = 0; i < sampleSize; i++) {
        var draw = pull(wish.probabilities, pityCounters, wish.pityHit);
        //console.log(i);
        //console.log(draw);
        results.push(draw);
        pivotResults[draw[0]]++;
    }
    // log the results for good measure
    console.log(results);
    console.table(pivotResults);
    console.table({
        3: pivotResults[3] / sampleSize,
        4: pivotResults[4] / sampleSize,
        5: pivotResults[5] / sampleSize
    });
    // // add them to the output stream
    // for (var i in results) {
    //     os += results[i][1][4] + "\t" + results[i][1][5] + "\t" + results[i][0] + "\n";
    // }
}
main(characterEventWish);
main(weaponEventWish);
// // header for easier processing in Excel
// os += "4-star pity counter\t5-star pity counter\tResult (stars)\n";
// main(characterEventWish); // run character wish first
// // log it
// fs.writeFile("Output/characternew.txt", os, function (err, file) {
//     if (err) console.error(err);
// });
// os = ""; // reset output stream
// os += "4-star pity counter\t5-star pity counter\tResult (stars)\n";
// main(weaponEventWish); // run weapon wish next
// // log it
// fs.writeFile("Output/weaponnew.txt", os, function (err, file) {
//     if (err) console.error(err);
// });