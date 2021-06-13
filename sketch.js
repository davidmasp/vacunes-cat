// RANDOM VARS
var imgMan;
var imgWoman;
var imgManBlue;
var imgWomanBlue;
var imgManGreen;
var imgWomanGreen;


// MUNICIPILATIES DATTA
//mId = "082704"
async function getPob(mId){
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

async function getVaxxPage(offset,limit,id){
    const url = `https://analisi.transparenciacatalunya.cat/resource/irki-p3c7.json?municipi_codi=${id}&$limit=${limit}&$offset=${offset}&$order=data`
    const response = await fetch(url);
    const data = await response.json();
    return data
  }

// check pagination info here
// https://dev.socrata.com/docs/paging.html

async function getVaxxTotal(id){
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
        var newOffset = newOffset+initLimit;
        var curr_len_arr = currentResponse.length;
      }
      while (curr_len_arr > 0);
  
      return dataArr
  }
  
// see here https://stackoverflow.com/questions/35974976/json-group-by-count-output-to-key-value-pair-json-result
function parseData(rows){
    var finalOccs = {
      "Dona" : {
        "1" : 0,
        "2": 0
      },
      "Home" : {
        "1" : 0,
        "2": 0
      }
    }
    
    var occurences = rows.reduce(function (r, row) {
      const prev = r[row.sexe][row.dosi]
      const currValue = parseInt(row.recompte)
      r[row.sexe][row.dosi] = prev + currValue
      return r;
    }, finalOccs);
  
    return occurences;
}
  
// drawing functions

function randomFromArray(x){
    var item = x[Math.floor(Math.random()*x.length)];
    return item
}

function drawHuman(sex, typeColor, x, y){
    if (sex === "woman") {
        //console.log(typeof(type));
        switch(typeColor) {
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
        switch(typeColor) {
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

async function getAllData(id){
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
    var menPercent = 1-womenPercent;

    var all1d =  resNumbers.Dona["1"] + resNumbers.Home["1"]
    var all2d =  resNumbers.Dona["2"] + resNumbers.Home["2"]
    var greenPercent = all2d / totalPob
    var bluePercent = (all1d - all2d) / totalPob

    return {
        men: menPercent,
        green: greenPercent,
        blue: bluePercent
    }

}


function drawAll(menPercent,greenPercent,bluePercent){
    // grid params
    gridX = [0,50,100,150,200,250,300,350,400,450] 
    gridY = [0,100,200,300,400,500,600] 
    
    // population params
    // var menPercent = .5;
    var totalSize = gridX.length * gridY.length;
    // will this always give equal to size?
    var menSize = Math.floor(totalSize*menPercent)
    
    // var greenPercent = 0.1;
    // var bluePercent = 0.2;
    //var greenPercent = 0.1;
    var greenSize = Math.floor(totalSize*greenPercent)
    var blueSize = Math.floor(totalSize*bluePercent)

    var arraySex = [];
    var arrayXCoord = [];
    var arrayYCoord = [];
    var colorHuman = [];

    //drawHuman("woman","blue",200,200);
    colorArr = ["djfhs","blue","green"]
    //drawHuman("woman", "blue", 200, 200);
    gridY.forEach(i => {
        gridX.forEach(k => {
            //first push the arrays which are the easy part
            arrayXCoord.push(k);
            arrayYCoord.push(i);
            // now the mess
            if (colorHuman.length >= (greenSize+blueSize)){
                colorHuman.push("yellow");
            } else if (colorHuman.length >= greenSize) {
                colorHuman.push("blue");
            } else {
                colorHuman.push("green");
            }
            // this is horrible (and prolly wrong)
            if (arraySex.length >= menSize){
                arraySex.push("man");
            } else {
                arraySex.push("woman");
            } 
        });
    });
    
    // shuffle sex?
    let shuffledarraySex = arraySex.sort((a, b) => 0.5 - Math.random());

    // const array = ["one", "two", "three"]
    shuffledarraySex.forEach(function (item, index) {
        drawHuman(item,
             colorHuman[index],
             arrayXCoord[index],
             arrayYCoord[index]);
        //console.log(item, index);
    });

}

var input;
var idCode = "082606";


function setup() {
    createCanvas(600, 800);
    frameRate(1);
    imgMan = loadImage('img/man_yellow.svg');
    imgWoman = loadImage('img/woman_yellow.svg');
    imgManBlue = loadImage('img/man_blue.svg');
    imgWomanBlue = loadImage('img/woman_blue.svg');
    imgManGreen = loadImage('img/man_green.svg');
    imgWomanGreen = loadImage('img/woman_green.svg');

    document.getElementById("code").
    textContent += idCode;
  }

function draw() {

    input = select("#cdeIN")

    var button = select('#submit');
    //button.mousePressed(setIdCode);

    getAllData(idCode).then(results => {
        drawAll(results.men, results.green, results.blue); 
    }).catch(err=> console.error(err));

    //drawHuman("woman", "blue", 100, 100);
    noLoop();
}



