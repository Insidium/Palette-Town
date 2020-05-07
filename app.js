//Global selections and variables

//target all colour divs
const colourDivs = document.querySelectorAll(".colour");
//target generate button
const generateBtn = document.querySelector(".generate");
//target all  sliders
const sliders = document.querySelector('input[type="range"]');
//target colour headings (for hex)
const currentHexes = document.querySelectorAll(".colour h2");
let initialColours;

//Functions

//Use ChromaJS to generate random hex colour - so much easier than above!
function generateHex() {
  const hexColour = chroma.random();
  return hexColour;
}

//Generate random colours
function randomColours() {
  colourDivs.forEach((div, index) => {
    //target h2 in div
    const hexText = div.children[0];
    //set random colour
    const randomColour = generateHex();
    //add random colour to background
    div.style.backgroundColor = randomColour;
    hexText.innerText = randomColour;
  });
}

randomColours();
