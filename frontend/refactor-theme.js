const fs = require('fs');
const path = require('path');

const replacements = [
  [/bg-bg-primary/g, 'bg-background'],
  [/bg-bg-surface/g, 'bg-card'],
  [/bg-bg-elevated/g, 'bg-popover'],
  [/bg-bg-hover/g, 'bg-muted hover:bg-muted/80'],
  [/bg-bg-input/g, 'bg-input'],
  [/text-text-primary/g, 'text-foreground'],
  [/text-text-secondary/g, 'text-muted-foreground'],
  [/text-text-muted/g, 'text-muted-foreground'],
  [/text-text-inverse/g, 'text-primary-foreground'],
  [/border-border-subtle/g, 'border-border/50'],
  [/border-border-default/g, 'border-border'],
  [/border-border-strong/g, 'border-primary/50'],
  [/rounded-\[var\(--radius-sm\)\]/g, 'rounded-sm'],
  [/rounded-\[var\(--radius-md\)\]/g, 'rounded-md'],
  [/rounded-\[var\(--radius-lg\)\]/g, 'rounded-lg'],
  [/rounded-\[var\(--radius-xl\)\]/g, 'rounded-xl'],
  [/rounded-\[var\(--radius-full\)\]/g, 'rounded-full'],
  [/duration-\[var\(--transition-fast\)\]/g, 'duration-200'],
  [/duration-\[var\(--transition-base\)\]/g, 'duration-300'],
  [/duration-\[var\(--transition-slow\)\]/g, 'duration-500'],
  [/focus-ring/g, 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'],
  // Replace teal-500 with primary
  [/\bteal-500\b/g, 'primary'],
  [/\bteal-400\b/g, 'primary/80'],
  [/\bteal-600\b/g, 'primary/90'],
  [/\bteal-300\b/g, 'primary/60'],
  // Fix cases where it became bg-primary/80 which is fine, but text-bg-primary should be text-primary-foreground
  [/text-bg-background/g, 'text-primary-foreground'],
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
      
      // Cleanup any overlapping artifacts
      newContent = newContent.replace(/text-bg-primary/g, 'text-primary-foreground');
      newContent = newContent.replace(/bg-bg-background/g, 'bg-background'); // in case it was double replaced
      newContent = newContent.replace(/text-text-foreground/g, 'text-foreground');
      
      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent);
        console.log('Updated:', fullPath);
      }
    }
  }
}

walk(path.join(__dirname, 'src'));
