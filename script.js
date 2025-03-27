const textInput = document.getElementById("text-input");
const textOutput = document.getElementById("text-output");
const colorOptions = document.querySelectorAll(".color-option");
const saveButton = document.getElementById("save-btn");
const textPreview = document.querySelector(".text-preview");

let selectedColor = "#000000";

function init() {
  textInput.addEventListener("input", updatePreview);
  saveButton.addEventListener("click", saveAsImage);

  colorOptions.forEach((option) => {
    option.addEventListener("click", function () {
      selectedColor = this.dataset.color;
      textOutput.style.color = selectedColor;
      colorOptions.forEach((opt) => opt.classList.remove("active"));
      this.classList.add("active");
    });
  });
}

function calculateLines(text, fontSize, maxWidth) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  ctx.font = `${fontSize}px Arial`;

  const words = text.split(" ");
  const lines = [];
  let currentLine = "";

  words.forEach((word) => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });

  lines.push(currentLine);
  return lines;
}

function updatePreview() {
  const text = textInput.value.trim().replace(/\n/g, " ");
  if (!text) {
    textOutput.innerHTML = '<div class="placeholder">Your text will appear here</div>';
    return;
  }

  const containerWidth = textPreview.clientWidth - 40;
  let fontSize = 100;
  const tempCtx = document.createElement("canvas").getContext("2d");

  // Calculate dynamic font size
  while (fontSize > 24) {
    tempCtx.font = `${fontSize}px Arial`;
    const textWidth = tempCtx.measureText(text).width;
    if (textWidth < containerWidth) break;
    fontSize -= 2;
  }

  // Generate lines
  const lines = calculateLines(text, fontSize, containerWidth);

  // Update preview
  textOutput.style.fontSize = `${fontSize}px`;
  textOutput.innerHTML = lines.map((line) => `<div>${line}</div>`).join("");
}

async function saveAsImage() {
  if (!textInput.value.trim()) return alert("Please enter some text first");

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const scale = 2;

  // Get styles from preview
  const fontSize = parseInt(getComputedStyle(textOutput).fontSize);
  const containerWidth = textPreview.clientWidth - 40;
  const text = textInput.value.trim().replace(/\n/g, " ");
  const lines = calculateLines(text, fontSize, containerWidth);

  // Calculate canvas size
  const lineHeight = fontSize * 1.2;
  const canvasWidth = Math.min(600, textPreview.clientWidth);
  const canvasHeight = Math.max(300, lines.length * lineHeight + 40);

  canvas.width = canvasWidth * scale;
  canvas.height = canvasHeight * scale;
  ctx.scale(scale, scale);

  // Draw background
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Draw text
  ctx.font = `${fontSize}px Arial`;
  ctx.fillStyle = selectedColor;
  ctx.filter = "blur(1.2px)";

  lines.forEach((line, index) => {
    const yPosition = lineHeight * index + 20 + fontSize;
    ctx.fillText(line, 20, yPosition);
  });

  // Download
  const link = document.createElement("a");
  link.download = "brat-text.png";
  link.href = canvas.toDataURL();
  link.click();
}

document.addEventListener("DOMContentLoaded", init);
