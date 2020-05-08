//Global selections and variables

//target all colour divs
const colourDivs = document.querySelectorAll(".colour");
//target generate button
const generateBtn = document.querySelector(".generate");
//target all sliders
const sliders = document.querySelectorAll('input[type="range"]');
//target colour headings (for hex)
const currentHexes = document.querySelectorAll(".colour h2");
let initialColours;

//Event Listeners

sliders.forEach((slider) => {
  slider.addEventListener("input", hslControls);
});

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
    //Check for contrast
    checkTextContrast(randomColour, hexText);
    //Initialise colourise sliders
    // set colour to randomColour
    const colour = chroma(randomColour);
    //target all inputs with class 'sliders'
    const sliders = div.querySelectorAll(".sliders input");
    //target each slider and assign to hue, brightness and saturation
    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];

    colouriseSliders(colour, hue, brightness, saturation);
  });
}

//Change contrast for hex text according to the lumninance of colour
function checkTextContrast(colour, text) {
  const luminance = chroma(colour).luminance();
  if (luminance > 0.5) {
    text.style.color = "#000";
  } else {
    text.style.color = "#fff";
  }
}

//Set colours for sliders
function colouriseSliders(colour, hue, brightness, saturation) {
  //Scale Saturation
  const noSat = colour.set("hsl.s", 0); //set no saturation (lowest on scale)
  const fullSat = colour.set("hsl.s", 1); //set full saturation (highest on scale)
  const scaleSat = chroma.scale([noSat, colour, fullSat]); //show scale of saturation from none to full

  //Scale Brightness
  const midBright = colour.set("hsl.l", 0.5); //set mid-brightness to half as none and full are black and white already
  const scaleBright = chroma.scale(["black", midBright, "white"]); //show scale of brightness from none to full

  //Update Input Colors
  //display saturation and brightness background as linear gradient passing in scales above
  saturation.style.backgroundImage = `linear-gradient(to right,${scaleSat(
    0
  )}, ${scaleSat(1)})`;
  brightness.style.backgroundImage = `linear-gradient(to right,${scaleBright(
    0
  )},${scaleBright(0.5)} ,${scaleBright(1)})`;
  //display standard hue spectrum - like a rainbow of colours
  hue.style.backgroundImage = `linear-gradient(to right, rgb(204,75,75),rgb(204,204,75),rgb(75,204,75),rgb(75,204,204),rgb(75,75,204),rgb(204,75,204),rgb(204,75,75))`;
}

//Set event controls for sliders
function hslControls(e) {
  //target the index of each slider based on position in colour div order
  const index =
    e.target.getAttribute("data-bright") ||
    e.target.getAttribute("data-sat") ||
    e.target.getAttribute("data-hue");

  //target parent element of sliders
  let sliders = e.target.parentElement.querySelectorAll('input[type="range"]');
  //set hue/bright/sat to assigned slider
  const hue = sliders[0];
  const brightness = sliders[1];
  const saturation = sliders[2];

  //target hex value in h2 of colour div selected
  const bgColour = colourDivs[index].querySelector("h2").innerText;

  //get selected colour and set each slider parameter
  let colour = chroma(bgColour)
    .set("hsl.s", saturation.value)
    .set("hsl.l", brightness.value)
    .set("hsl.h", hue.value);

  //set background colour of div to selected colour above
  colourDivs[index].style.backgroundColor = colour;
}

randomColours();
