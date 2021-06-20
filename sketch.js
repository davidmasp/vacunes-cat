// set up the code in the text
var input;

// RANDOM VARS

// this is a comment"""

// FUNCTIONS

async function obtainCode(query, element = 0) {
    url = `https://api.idescat.cat/pob/v1/sug.json?p=q/${query};tipus/mun,np`
    const response = await fetch(url);
    const data = await response.json();

    //return data;
    const citySelected = data[1][0]
    console.log(citySelected)
    document.getElementById("municipi").textContent = citySelected
    urlSearch = `https://api.idescat.cat/pob/v1/cerca.json?p=q/${citySelected};tipus/mun`
    const responseSearch = await fetch(urlSearch);
    const dataSearch = await responseSearch.json();
    const cityCode = dataSearch["feed"]["entry"]["cross:DataSet"]["cross:Section"]["AREA"]
    return cityCode;
}

// MUNICIPILATIES DATTA
//mId = "082704"
async function getPob(mId) {
    const url = `https://api.idescat.cat/emex/v1/dades.json?id=${mId}&i=f321`
    const response = await fetch(url);
    // await
    const data = await response.json();
    const pobString = data["fitxes"]["indicadors"]["i"][0]["v"];
    const res = pobString.split(",");
    const stringPobValue = res[0];
    const intPobValue = parseInt(stringPobValue);
    return intPobValue;
}

// VAXX DATA



async function getVaxxPage(offset, limit, id) {
    const url = `https://analisi.transparenciacatalunya.cat/resource/irki-p3c7.json?municipi_codi=${id}&$limit=${limit}&$offset=${offset}&$order=data`
    const response = await fetch(url);
    const data = await response.json();
    return data
}

// check pagination info here
// https://dev.socrata.com/docs/paging.html

async function getVaxxTotal(id) {
    const initLimit = 100;
    const initOffset = 0;
    var dataArr = [];
    const firstResponse = await getVaxxPage(initOffset, initLimit, id);
    dataArr.push(firstResponse);
    var newOffset = initLimit;
    var curr_len_arr = dataArr[dataArr.length - 1].length;
    do {
        let currentResponse = await getVaxxPage(newOffset, initLimit, id);
        dataArr.push(currentResponse);
        var newOffset = newOffset + initLimit;
        var curr_len_arr = currentResponse.length;
    }
    while (curr_len_arr > 0);

    return dataArr
}

// see here https://stackoverflow.com/questions/35974976/json-group-by-count-output-to-key-value-pair-json-result
function parseData(rows) {
    var finalOccs = {
        "Dona": {
            "1": 0,
            "2": 0
        },
        "Home": {
            "1": 0,
            "2": 0
        }
    }

    var occurences = rows.reduce(function(r, row) {
        const prev = r[row.sexe][row.dosi]
        const currValue = parseInt(row.recompte)
        r[row.sexe][row.dosi] = prev + currValue
        return r;
    }, finalOccs);

    return occurences;
}

// drawing functions

function randomFromArray(x) {
    var item = x[Math.floor(Math.random() * x.length)];
    return item
}

function drawHuman(sex, typeColor, x, y) {
    if (sex === "woman") {
        //console.log(typeof(type));
        switch (typeColor) {
            case "blue":
                //console.log("djfjshdkj")
                image(imgWomanBlue, x, y, 100, 100);
                break;
            case "green":
                image(imgWomanGreen, x, y, 100, 100);
                break;
            default:
                image(imgWoman, x, y, 100, 100);
                break;
        }
    } else {
        switch (typeColor) {
            case "blue":
                image(imgManBlue, x, y, 100, 100);
                break;
            case "green":
                image(imgManGreen, x, y, 100, 100);
                break;
            default:
                image(imgMan, x, y, 100, 100);
                break;
        }
    }
}

async function getAllData(cityNameInput) {
    const id = await obtainCode(cityNameInput);
    console.log(id)

    // why does this happen IDK!
    // the population idescat api is using a longer code than the vaxx api
    var idCodeShort = id.slice(0, -1);

    var totalPob = await getPob(id);

    console.log(totalPob);

    var responseRes = await getVaxxTotal(idCodeShort)
    var responseResMerged = [].concat.apply([], responseRes);
    var resNumbers = parseData(responseResMerged);

    // this is not true, to update
    var womenPercent = womenPercent = resNumbers.Dona["1"] /
        (resNumbers.Dona["1"] + resNumbers.Home["1"]);
    var menPercent = 1 - womenPercent;

    var all1d = resNumbers.Dona["1"] + resNumbers.Home["1"]
    var all2d = resNumbers.Dona["2"] + resNumbers.Home["2"]
    var greenPercent = all2d / totalPob
    var bluePercent = (all1d - all2d) / totalPob

    return {
        men: menPercent,
        green: greenPercent,
        blue: bluePercent
    }

}


function drawAll(menPercent, greenPercent, bluePercent) {
    // grid params
    gridX = [0, 50, 100, 150, 200, 250, 300, 350, 400, 450]
    gridY = [0, 100, 200, 300, 400, 500, 600]

    // population params
    // var menPercent = .5;
    var totalSize = gridX.length * gridY.length;
    // will this always give equal to size?
    var menSize = Math.floor(totalSize * menPercent)

    // var greenPercent = 0.1;
    // var bluePercent = 0.2;
    //var greenPercent = 0.1;
    var greenSize = Math.floor(totalSize * greenPercent)
    var blueSize = Math.floor(totalSize * bluePercent)

    var arraySex = [];
    var arrayXCoord = [];
    var arrayYCoord = [];
    var colorHuman = [];

    //drawHuman("woman","blue",200,200);
    colorArr = ["djfhs", "blue", "green"]
        //drawHuman("woman", "blue", 200, 200);
    gridY.forEach(i => {
        gridX.forEach(k => {
            //first push the arrays which are the easy part
            arrayXCoord.push(k);
            arrayYCoord.push(i);
            // now the mess
            if (colorHuman.length >= (greenSize + blueSize)) {
                colorHuman.push("yellow");
            } else if (colorHuman.length >= greenSize) {
                colorHuman.push("blue");
            } else {
                colorHuman.push("green");
            }
            // this is horrible (and prolly wrong)
            if (arraySex.length >= menSize) {
                arraySex.push("man");
            } else {
                arraySex.push("woman");
            }
        });
    });

    // shuffle sex?
    let shuffledarraySex = arraySex.sort((a, b) => 0.5 - Math.random());

    // const array = ["one", "two", "three"]
    shuffledarraySex.forEach(function(item, index) {
        drawHuman(item,
            colorHuman[index],
            arrayXCoord[index],
            arrayYCoord[index]);
        //console.log(item, index);
    });

}

function percent2Text(percent) {
    const numBig = Math.round(percent * 100);
    const numStr = numBig + "%";
    return numStr
}

// the x and y max and min arguments refer to positions in the canvas.
function makeBarPlot(percentArray,
    xmin,
    xmax,
    spacer = 0,
    ymin,
    ymax,
    colorsArray,
    legendsXArray,
    legendsYArray,
    legendsLabelArray,
    textSpacer = -5
) {

    const totalLength = xmax - xmin;
    const barWidth = (totalLength / percentArray.length) - spacer

    // set up the left positions of the columns
    var xLeftArray = [];
    xLeftArray[0] = xmin;
    var i;
    for (i = 1; i < percentArray.length; i++) {
        xLeftArray[i] = xLeftArray[i - 1] + barWidth + spacer;
    }
    // now the right pos
    var xWidthArray = [];
    var i;
    for (i = 0; i < percentArray.length; i++) {
        xWidthArray[i] = barWidth;
    }

    const totalHeight = ymax - ymin;

    // re-scale 
    const maxValue = Math.max(...percentArray);
    var percentsRescaled = [];
    var i;
    for (i = 0; i < percentArray.length; i++) {
        percentsRescaled[i] = percentArray[i] / maxValue;
    }
    var yLowArray = [];
    var i;
    for (i = 0; i < percentArray.length; i++) {
        yLowArray[i] = ymin;
    }
    var yHeightArray = [];
    var i;
    for (i = 0; i < percentArray.length; i++) {
        yHeightArray[i] = percentsRescaled[i] * totalHeight;
    }

    const legendWidth = 30;

    // draw final plot
    var i;
    for (i = 0; i < percentArray.length; i++) {
        var c = color(colorsArray[i]);
        fill(c);
        noStroke();
        rect(xLeftArray[i], yLowArray[i], xWidthArray[i], yHeightArray[i]);
        textSize(28);
        var wordText = percent2Text(percentArray[i]);
        text(wordText, xLeftArray[i], yLowArray[i] + yHeightArray[i] + textSpacer);
        square(legendsXArray[i], legendsYArray[i], legendWidth);
        text(
            legendsLabelArray[i],
            legendsXArray[i] + legendWidth + 3,
            legendsYArray[i] + legendWidth
        );
    }
}

fullWorkflow = function() {
    setup();
    var cityName = input.value();
    getAllData(cityName).then(results => {
        // first the figure portion
        drawAll(results.men, results.green, results.blue);
        // second the barplot
        tmp_yell = 1 - results.green - results.blue
        colors_array = ['#8AE234', '#729FCF', '#FCE94F'];
        lg_posX_arr = [200, 400, 600];
        lg_posY_arr = [750, 750, 750];
        lg_labels = ["Dues dosi", "Una dosi", "Sense vacunar"];
        percent_array = [results.green, results.blue, tmp_yell]
        makeBarPlot(percent_array, 600, 900, 15, 700, 100, colors_array, lg_posX_arr, lg_posY_arr, lg_labels);
    }).catch(err => console.error(err));
}

////////////////////////////////////
////////////////////////////////////


setup = function() {
    myCanvas = createCanvas(900, 800);
    myCanvas.parent('canvasDiv');
    myCanvas;
    frameRate(1);
    imgMan = loadImage('img/man_yellow.svg');
    imgWoman = loadImage('img/woman_yellow.svg');
    imgManBlue = loadImage('img/man_blue.svg');
    imgWomanBlue = loadImage('img/woman_blue.svg');
    imgManGreen = loadImage('img/man_green.svg');
    imgWomanGreen = loadImage('img/woman_green.svg');

}
draw = function() {

    input = select("#codeX");
    console.log(input.value());

    var button = select('#submit');
    button.mousePressed(fullWorkflow);

    noLoop();

}