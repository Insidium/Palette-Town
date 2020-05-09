//Global selections and variables

//target all colour divs
const colourDivs = document.querySelectorAll(".colour");
//target generate button
const generateBtn = document.querySelector(".generate");
//target all sliders
const sliders = document.querySelectorAll('input[type="range"]');
//target colour headings (for hex)
const currentHexes = document.querySelectorAll(".colour h2");
//popup animation
const popup = document.querySelector(".copy-container");
//adjustment button for sliders
const adjustButton = document.querySelectorAll(".adjust");
//lock button for colour divs
const lockButton = document.querySelectorAll(".lock");
//closing adjustments
const closeAdjustments = document.querySelectorAll(".close-adjustment");
//sliders container panel
const sliderContainers = document.querySelectorAll(".sliders");
//provide initial colours variable for storage
let initialColours;
//local storage array
let savedPalettes = [];

//Event Listeners

//listen for generate button click
generateBtn.addEventListener("click", randomColours);

//listen for change to input on sliders to change colour
sliders.forEach((slider) => {
  slider.addEventListener("input", hslControls);
});

//listen for above change on sliders to change hex value text
colourDivs.forEach((slider, index) => {
  slider.addEventListener("change", () => {
    updateTextUI(index);
  });
});

//listen for click to copy hex value to clipboard
currentHexes.forEach((hex) => {
  hex.addEventListener("click", () => {
    copyToClipboard(hex);
  });
});

//listen for popup animation to end and then make it go away
popup.addEventListener("transitionend", () => {
  const popupBox = popup.children[0];
  popup.classList.remove("active");
  popupBox.classList.remove("active");
});

//listen for click on button to open adjustment panel
adjustButton.forEach((button, index) => {
  button.addEventListener("click", () => {
    openAdjustmentPanel(index);
  });
});

//listen for click on X button to close adjustment panel
closeAdjustments.forEach((button, index) => {
  button.addEventListener("click", () => {
    closeAdjustmentPanel(index);
  });
});

//listen for lock button click for hex value retain
lockButton.forEach((button, index) => {
  button.addEventListener("click", (e) => {
    lockLayer(e, index);
  });
});

//Functions

//Use ChromaJS to generate random hex colour - so much easier than above!
function generateHex() {
  const hexColour = chroma.random();
  return hexColour;
}

//Generate random colours
function randomColours() {
  //make initial colours start as empty array
  initialColours = [];

  colourDivs.forEach((div, index) => {
    //target h2 in div
    const hexText = div.children[0];
    //set random colour
    const randomColour = generateHex();
    //Add hex colour to the initial colours array
    if (div.classList.contains("locked")) {
      initialColours.push(hexText.innerText);
      return;
    } else {
      initialColours.push(chroma(randomColour).hex());
    }
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

  //Reset slider inputs
  resetInputs();

  //Check for adjust and lock button contrast
  adjustButton.forEach((button, index) => {
    checkTextContrast(initialColours[index], button);
    checkTextContrast(initialColours[index], lockButton[index]);
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
  const bgColour = initialColours[index];

  //get selected colour and set each slider parameter
  let colour = chroma(bgColour)
    .set("hsl.s", saturation.value)
    .set("hsl.l", brightness.value)
    .set("hsl.h", hue.value);

  //set background colour of div to selected colour above
  colourDivs[index].style.backgroundColor = colour;

  //correctly colourise slider inputs based on positions
  colouriseSliders(colour, hue, brightness, saturation);
}

//Update hex text and contrast of text and controls buttons
function updateTextUI(index) {
  //target active div in play
  const activeDiv = colourDivs[index];
  //assign colour to background colour
  const colour = chroma(activeDiv.style.backgroundColor);
  //select the h2 hex value
  const textHex = activeDiv.querySelector("h2");
  //select the buttons with class of contols
  const icons = activeDiv.querySelectorAll(".controls button");
  //assign h2 hex value as the updated hex colour
  textHex.innerText = colour.hex();
  //Check and change text contrast of updated colour
  checkTextContrast(colour, textHex);
  //Check and change all icons contrast of updated colour
  for (icon of icons) {
    checkTextContrast(colour, icon);
  }
}

function resetInputs() {
  //target all slider inputs
  const sliders = document.querySelectorAll(".sliders input");
  //update the slider position based on the current colour's actual hue/bright/sat positions
  sliders.forEach((slider) => {
    if (slider.name === "hue") {
      const hueColour = initialColours[slider.getAttribute("data-hue")];
      const hueValue = chroma(hueColour).hsl()[0];
      slider.value = Math.floor(hueValue);
    }
    if (slider.name === "brightness") {
      const brightColour = initialColours[slider.getAttribute("data-bright")];
      const brightValue = chroma(brightColour).hsl()[2];
      slider.value = Math.floor(brightValue * 100) / 100;
    }
    if (slider.name === "saturation") {
      const satColour = initialColours[slider.getAttribute("data-sat")];
      const satValue = chroma(satColour).hsl()[1];
      slider.value = Math.floor(satValue * 100) / 100;
    }
  });
}

//copy hex value to clipboard
function copyToClipboard(hex) {
  //assign a placeholder text area for copying hex
  const ele = document.createElement("textarea");
  //save value as inner text of hex
  ele.value = hex.innerText;
  //add this element to the body
  document.body.appendChild(ele);
  //select the element
  ele.select();
  //run copy command on the element
  document.execCommand("copy");
  //remove the value from the element
  document.body.removeChild(ele);
  //popup animation on click to confirm copy
  const popupBox = popup.children[0];
  //add active class to the the background area - darkens it for popup display
  popup.classList.add("active");
  //add active class to the popup box itself to appear
  popupBox.classList.add("active");
}

//apply active class to adjust panel
function openAdjustmentPanel(index) {
  sliderContainers[index].classList.toggle("active");
}

//remove active class for adjust panel
function closeAdjustmentPanel(index) {
  sliderContainers[index].classList.remove("active");
}

//add locked class to lock button on click
function lockLayer(e, index) {
  //target lock button icon
  const lockSVG = e.target.children[0];
  const activeBg = colourDivs[index];
  //toggle locked class
  activeBg.classList.toggle("locked");
  if (lockSVG.classList.contains("fa-lock-open")) {
    e.target.innerHTML = '<i class="fas fa-lock"></i>';
  } else {
    e.target.innerHTML = '<i class="fas fa-lock-open"></i>';
  }
}

//Save to palette and local storage

//targeting elements with following classes
const saveBtn = document.querySelector(".save");
const submitSave = document.querySelector(".submit-save");
const closeSave = document.querySelector(".close-save");
const saveContainer = document.querySelector(".save-container");
const saveInput = document.querySelector(".save-container input");
const libraryContainer = document.querySelector(".library-container");
const libraryBtn = document.querySelector(".library");
const closeLibraryBtn = document.querySelector(".close-library");

//run openPalette on click of saveBtn
saveBtn.addEventListener("click", openPalette);
closeSave.addEventListener("click", closePalette);

//listen for save button click for saving to local storage
submitSave.addEventListener("click", savePalette);

//listen for library button click, open and close
libraryBtn.addEventListener("click", openLibrary);
closeLibraryBtn.addEventListener("click", closeLibrary);

//add active class to popup on open
function openPalette(e) {
  const popup = saveContainer.children[0];
  saveContainer.classList.add("active");
  popup.classList.add("active");
}

//remove active class to popup on close
function closePalette(e) {
  const popup = saveContainer.children[0];
  saveContainer.classList.remove("active");
  popup.classList.remove("active");
}

//save palette to local storage
function savePalette(e) {
  //remove active class to popup on save
  saveContainer.classList.remove("active");
  popup.classList.remove("active");
  //assign name as the input value
  const name = saveInput.value;
  //save value to colours array
  const colours = [];
  currentHexes.forEach((hex) => {
    colours.push(hex.innerText);
  });
  //generate palette object and push it to array
  let paletteNum = savedPalettes.length;
  const paletteObj = { name, colours, num: paletteNum };
  savedPalettes.push(paletteObj);
  //save to local storage
  saveToLocal(paletteObj);
  //reset input to blank after save
  saveInput.value = "";
  //generate palette entries for library
  const palette = document.createElement("div");
  palette.classList.add("custom-palette");
  const title = document.createElement("h4");
  title.innerText = paletteObj.name;
  const preview = document.createElement("div");
  preview.classList.add("small-preview");
  //adding small div tiles for palette colours
  paletteObj.colours.forEach((smallColour) => {
    const smallDiv = document.createElement("div");
    smallDiv.style.backgroundColor = smallColour;
    preview.appendChild(smallDiv);
  });
  //palette select button classes
  const paletteBtn = document.createElement("button");
  paletteBtn.classList.add("pick-palette-btn");
  paletteBtn.classList.add(paletteObj.num);
  paletteBtn.innerText = "Select";

  //append above to the library container
  palette.appendChild(title);
  palette.appendChild(preview);
  palette.appendChild(paletteBtn);
  libraryContainer.children[0].appendChild(palette);
}

function saveToLocal(paletteObj) {
  //if there is nothing in palettes, create an empty array for use, else get existing array of palettes
  let localPalettes;
  if (localStorage.getItem("palettes") === null) {
    localPalettes = [];
  } else {
    localPalettes = JSON.parse(localStorage.getItem("palettes"));
  }
  //add palette object to array
  localPalettes.push(paletteObj);
  //return array back as list
  localStorage.setItem("palettes", JSON.stringify(localPalettes));
}

//open library popup
function openLibrary() {
  const popup = libraryContainer.children[0];
  libraryContainer.classList.add("active");
  popup.classList.add("active");
}

//close library popup
function closeLibrary() {
  const popup = libraryContainer.children[0];
  libraryContainer.classList.remove("active");
  popup.classList.remove("active");
}

//invoke random colours
randomColours();
