const fs = require('fs');
const content = fs.readFileSync('c:\\Users\\Aluno\\Downloads\\meirelesmodasoficial\\index.css', 'utf8');

let level = 0;
let lines = content.split('\n');
let stack = [];

for (let i = 0; i < lines.length; i++) {
  let line = lines[i];
  let trimmed = line.trim();
  
  if (trimmed.startsWith('@media')) {
    stack.push({ type: 'media', line: i + 1, content: trimmed, levelBefore: level });
  }
  
  for (let j = 0; j < line.length; j++) {
    let char = line[j];
    if (char === '{') {
      level++;
    } else if (char === '}') {
      level--;
      // If we just closed a block at level 1 (or 0 inside a media query), let's check
      if (level < 0) {
        console.log(`Negative level on line ${i + 1}`);
        level = 0;
      }
    }
  }
  
  // If we closed a media query block, check if it matched
  if (stack.length > 0 && level === stack[stack.length - 1].levelBefore) {
    let media = stack.pop();
    console.log(`Media query opened on line ${media.line} closed on line ${i + 1}`);
  }
}

if (stack.length > 0) {
  console.log('Unclosed media queries at the end of the file:');
  for (let media of stack) {
    console.log(`Line ${media.line}: ${media.content}`);
  }
} else {
  console.log('All media queries closed successfully!');
}
