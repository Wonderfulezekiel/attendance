const fs = require('fs');
const path = require('path');

const replacements = [
  // amber -> accent
  [/\bamber-500\b/g, 'accent'],
  [/\bamber-400\b/g, 'accent'],
  [/\bamber-900\b/g, 'accent-foreground'],
  [/\bg-amber\b/g, 'bg-accent'],
  [/\btext-amber\b/g, 'text-accent-foreground'],
  
  // green -> primary
  [/\bgreen-500\b/g, 'primary'],
  [/\bgreen-400\b/g, 'primary'],
  [/\bgreen-900\b/g, 'primary-foreground'],
  [/\bg-green\b/g, 'bg-primary'],
  [/\btext-green\b/g, 'text-primary'],
  
  // red -> destructive
  [/\bred-500\b/g, 'destructive'],
  [/\bred-400\b/g, 'destructive'],
  [/\bred-900\b/g, 'destructive-foreground'],
  [/\bg-red\b/g, 'bg-destructive'],
  [/\btext-red\b/g, 'text-destructive'],
];

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let newContent = content;
      for (const [regex, replacement] of replacements) {
        newContent = newContent.replace(regex, replacement);
      }
      
      // Cleanup edge cases
      newContent = newContent.replace(/text-accent-foreground-\w+/g, 'text-accent-foreground');
      newContent = newContent.replace(/bg-accent-\w+/g, 'bg-accent');
      newContent = newContent.replace(/text-primary-\w+/g, 'text-primary');
      newContent = newContent.replace(/bg-primary-\w+/g, 'bg-primary');
      newContent = newContent.replace(/text-destructive-\w+/g, 'text-destructive');
      newContent = newContent.replace(/bg-destructive-\w+/g, 'bg-destructive');
      
      // Fix badge background
      newContent = newContent.replace(/bg-accent-foreground/g, 'bg-accent'); // fix for some potential issues
      
      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent);
        console.log('Updated:', fullPath);
      }
    }
  }
}

walk(path.join(__dirname, 'src'));
