import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();

function walkAndReplace(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist') continue;
      walkAndReplace(fullPath);
    } else if (entry.isFile()) {
      if (['.ico', '.png', '.jpg', '.jpeg', '.zip', '.pdf', 'package-lock.json', 'bun.lock'].some(ext => entry.name.endsWith(ext))) {
        continue;
      }
      try {
        let content = fs.readFileSync(fullPath, 'utf8');
        let updated = content
          .replace(/CALCTOOLS/g, 'GLOVOTOOLS')
          .replace(/CalcTools/g, 'Glovotools')
          .replace(/calctools/g, 'glovotools')
          .replace(/CalcTool/g, 'GlovoTool');
        if (updated !== content) {
          fs.writeFileSync(fullPath, updated, 'utf8');
          console.log(`Updated content: ${fullPath}`);
        }
      } catch (err) {
        // ignore binary read errors
      }
    }
  }
}

function renameFilesInDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  // Process files first, then directories
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist') continue;
      renameFilesInDir(fullPath);
    }
    if (entry.name.includes('CALCTOOLS') || entry.name.includes('calctools') || entry.name.includes('CalcTools')) {
      const newName = entry.name
        .replace(/CALCTOOLS/g, 'GLOVOTOOLS')
        .replace(/CalcTools/g, 'Glovotools')
        .replace(/calctools/g, 'glovotools');
      const newPath = path.join(dir, newName);
      if (fullPath !== newPath) {
        fs.renameSync(fullPath, newPath);
        console.log(`Renamed file: ${fullPath} -> ${newPath}`);
      }
    }
  }
}

console.log('Starting content replacement...');
walkAndReplace(rootDir);
console.log('Starting file renaming...');
renameFilesInDir(rootDir);
console.log('Done!');
