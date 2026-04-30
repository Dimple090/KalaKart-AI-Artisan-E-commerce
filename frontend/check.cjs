const fs = require('fs');
const content = fs.readFileSync('src/pages/Dashboard.jsx', 'utf-8');

let i = 0;
const stack = [];
let inString = false;
let stringChar = '';

while (i < content.length) {
  const c = content[i];
  
  if (!inString && (c === '"' || c === '\'' || c === '\`')) {
    inString = true;
    stringChar = c;
    i++;
    continue;
  }
  
  if (inString && c === stringChar) {
    inString = false;
    i++;
    continue;
  }
  
  if (inString) {
    i++;
    continue;
  }
  
  // Very simplistic check for <div
  if (content.substr(i, 4) === '<div') {
    // Make sure it's an opening div
    let j = i + 4;
    let isSelfClosing = false;
    while (j < content.length && content[j] !== '>') {
      if (content[j] === '/' && content[j+1] === '>') isSelfClosing = true;
      j++;
    }
    if (!isSelfClosing) {
      const line = content.substr(0, i).split('\n').length;
      stack.push({ name: 'div', line });
    }
    i = j;
    continue;
  }
  
  if (content.substr(i, 6) === '</div>') {
    if (stack.length > 0 && stack[stack.length-1].name === 'div') {
      stack.pop();
    } else {
      const line = content.substr(0, i).split('\n').length;
      console.log('Extra </div> at line', line);
    }
    i += 5;
  }
  
  i++;
}
console.log('Unclosed divs:', stack);
