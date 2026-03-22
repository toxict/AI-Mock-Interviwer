import fs from 'fs';
import path from 'path';
import { transformFileSync } from '@babel/core';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIRS_TO_PROCESS = ['src', 'config', 'lib', 'scripts', 'handlers', 'layouts', 'provider', 'routes', 'components'];

function processDirectory(directory) {
  if (!fs.existsSync(directory)) return;
  const files = fs.readdirSync(directory);
  
  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      if (fullPath.endsWith('.d.ts')) {
         fs.unlinkSync(fullPath);
         console.log(`Deleted ${fullPath}`);
         continue;
      }
      
      const isTsx = fullPath.endsWith('.tsx');
      let ext = isTsx ? '.jsx' : '.js';
      
      try {
        const result = transformFileSync(fullPath, {
          presets: [
            ['@babel/preset-typescript', { isTSX: true, allExtensions: true }]
          ],
          plugins: ['@babel/plugin-syntax-jsx'],
          retainLines: true,
          generatorOpts: {
             retainLines: true,
             comments: true,
          }
        });
        
        const newPath = fullPath.slice(0, -(isTsx ? 4 : 3)) + ext;
        
        let code = result.code;
        // Strip empty export {} that babel might leave behind if it was completely a type file
        // Or if the file became empty
        
        fs.writeFileSync(newPath, code);
        fs.unlinkSync(fullPath);
        console.log(`Converted ${fullPath} -> ${newPath}`);
      } catch (err) {
        console.error(`Failed to convert ${fullPath}`, err);
      }
    }
  }
}

for (const dir of DIRS_TO_PROCESS) {
  processDirectory(path.join(__dirname, dir));
}

// Convert vite.config.ts specifically
const viteConfigPath = path.join(__dirname, 'vite.config.ts');
if (fs.existsSync(viteConfigPath)) {
  const result = transformFileSync(viteConfigPath, {
     presets: [
        ['@babel/preset-typescript', { isTSX: true, allExtensions: true }]
     ],
     plugins: ['@babel/plugin-syntax-jsx'],
     retainLines: true,
  });
  
  fs.writeFileSync(path.join(__dirname, 'vite.config.js'), result.code);
  fs.unlinkSync(viteConfigPath);
  console.log('Converted vite.config.ts -> vite.config.js');
}
