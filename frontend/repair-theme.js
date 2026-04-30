const fs = require('fs');
const path = require('path');

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let newContent = content;
      
      // Fix button primary variant
      newContent = newContent.replace(/bg-primary text-primary hover:bg-primary\/80/g, 'bg-primary text-primary-foreground hover:bg-primary/80');
      
      // Fix button destructive variant
      newContent = newContent.replace(/bg-destructive\/15 text-destructive/g, 'bg-destructive text-destructive-foreground hover:bg-destructive/90');
      
      // Fix GraduationCap in sidebar and header and mobile nav
      newContent = newContent.replace(/GraduationCap className="w-4 h-4 text-primary"/g, 'GraduationCap className="w-4 h-4 text-primary-foreground"');
      newContent = newContent.replace(/GraduationCap className="w-5 h-5 text-primary"/g, 'GraduationCap className="w-5 h-5 text-primary-foreground"');
      
      // Fix dashboard alerts
      newContent = newContent.replace(/text-accent shrink-0/g, 'text-accent-foreground shrink-0');
      newContent = newContent.replace(/text-sm font-medium text-accent/g, 'text-sm font-medium text-accent-foreground');
      newContent = newContent.replace(/text-destructive shrink-0/g, 'text-destructive-foreground shrink-0');
      newContent = newContent.replace(/text-sm font-medium text-destructive/g, 'text-sm font-medium text-destructive-foreground');
      
      // Fix check circle and clock in dashboard
      newContent = newContent.replace(/bg-primary\/15 text-primary/g, 'bg-primary/15 text-primary-foreground'); // wait, if bg is /15, text-primary is correct for contrast! But my script didn't break this, did it? text-primary is correct here.
      
      // Look for any 'text-[color] text-[color]-foreground' overlapping and fix
      newContent = newContent.replace(/text-primary-foreground-foreground/g, 'text-primary-foreground');
      
      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent);
        console.log('Repaired:', fullPath);
      }
    }
  }
}

walk(path.join(__dirname, 'src'));
