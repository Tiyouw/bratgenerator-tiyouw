const textInput = document.getElementById('text-input');
const textOutput = document.getElementById('text-output');
const colorOptions = document.querySelectorAll('.color-option');
const saveButton = document.getElementById('save-btn');
const textPreview = document.querySelector('.text-preview');

let selectedColor = '#000000';
const MIN_SIZE = 300;
const MAX_SIZE = 600;

function init() {
  textInput.addEventListener('input', updatePreview);
  saveButton.addEventListener('click', saveAsImage);
  
  colorOptions.forEach(option => {
    option.addEventListener('click', function() {
      selectedColor = this.dataset.color;
      textOutput.style.color = selectedColor;
      colorOptions.forEach(opt => opt.classList.remove('active'));
      this.classList.add('active');
    });
  });
}

function calculateFontSize(text, containerWidth) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  let fontSize = 100;
  
  do {
    ctx.font = `${fontSize}px Arial`;
    const textWidth = ctx.measureText(text).width;
    if (textWidth < containerWidth * 0.8) break;
    fontSize -= 2;
  } while (fontSize > 24);
  
  return fontSize;
}

function wrapText(text, fontSize, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';
  
  const tempDiv = document.createElement('div');
  tempDiv.style.cssText = `
    position: absolute;
    visibility: hidden;
    white-space: nowrap;
    font-size: ${fontSize}px;
    font-family: Arial;
  `;
  document.body.appendChild(tempDiv);

  words.forEach(word => {
    tempDiv.textContent = currentLine ? `${currentLine} ${word}` : word;
    
    if (tempDiv.offsetWidth > maxWidth) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = currentLine ? `${currentLine} ${word}` : word;
    }
  });

  if (currentLine) lines.push(currentLine);
  document.body.removeChild(tempDiv);
  
  return lines;
}

function updatePreview() {
  const text = textInput.value.trim();
  if (!text) {
    textOutput.innerHTML = '<div class="placeholder">Your text will appear here</div>';
    textPreview.style.width = `${MIN_SIZE}px`;
    return;
  }

  const containerWidth = textPreview.offsetWidth;
  const fontSize = calculateFontSize(text, containerWidth);
  const maxWidth = containerWidth - 60;
  const lines = wrapText(text, fontSize, maxWidth);
  
  textOutput.style.fontSize = `${fontSize}px`;
  textOutput.innerHTML = lines.map(line => 
    `<div style="width:${maxWidth}px; margin: 0 auto;">${line}</div>`
  ).join('');
}

async function saveAsImage() {
  if (!textInput.value.trim()) return alert('Please enter some text first');

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const scale = 2;
  
  const textWidth = textPreview.offsetWidth;
  const size = Math.min(MAX_SIZE, Math.max(MIN_SIZE, textWidth));
  
  canvas.width = size * scale;
  canvas.height = size * scale;
  ctx.scale(scale, scale);
  
  const fontSize = parseInt(getComputedStyle(textOutput).fontSize);
  const maxWidth = size - 60;
  const lines = wrapText(textInput.value.trim(), fontSize, maxWidth);
  
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, size, size);
  
  ctx.font = `${fontSize}px Arial`;
  ctx.fillStyle = selectedColor;
  ctx.filter = 'blur(1.2px)';
  ctx.textAlign = 'left';
  
  const lineHeight = fontSize * 1.2;
  const startY = (size - (lines.length * lineHeight)) / 2 + fontSize;

  lines.forEach((line, idx) => {
    const words = line.split(' ');
    const space = (maxWidth - words.reduce((sum, word) => sum + ctx.measureText(word).width, 0)) / (words.length - 1);
    let x = 30;
    
    words.forEach((word, i) => {
      ctx.fillText(word, x, startY + (idx * lineHeight));
      x += ctx.measureText(word).width + (i < words.length - 1 ? space : 0);
    });
  });

  const link = document.createElement('a');
  link.download = 'brat-text.png';
  link.href = canvas.toDataURL();
  link.click();
}

document.addEventListener('DOMContentLoaded', init);