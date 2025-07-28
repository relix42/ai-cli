#!/usr/bin/env node

/**
 * Script to update all package references from @google/gemini-cli-core to @relix42/grooveforge-core
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';
import path from 'path';

const OLD_PACKAGE_NAME = '@google/gemini-cli-core';
const NEW_PACKAGE_NAME = '@relix42/grooveforge-core';

async function updatePackageReferences() {
  console.log('🔄 Updating package references...');
  
  // Find all TypeScript and JavaScript files in packages/cli/src
  const files = await glob('packages/cli/src/**/*.{ts,tsx,js,jsx}', {
    cwd: process.cwd(),
    absolute: true
  });
  
  let updatedFiles = 0;
  let totalReplacements = 0;
  
  for (const file of files) {
    try {
      const content = readFileSync(file, 'utf8');
      const updatedContent = content.replaceAll(OLD_PACKAGE_NAME, NEW_PACKAGE_NAME);
      
      if (content !== updatedContent) {
        writeFileSync(file, updatedContent, 'utf8');
        const replacements = (content.match(new RegExp(OLD_PACKAGE_NAME.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
        console.log(`✅ Updated ${path.relative(process.cwd(), file)} (${replacements} replacements)`);
        updatedFiles++;
        totalReplacements += replacements;
      }
    } catch (error) {
      console.error(`❌ Error updating ${file}:`, error.message);
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`   Files updated: ${updatedFiles}`);
  console.log(`   Total replacements: ${totalReplacements}`);
  console.log(`   ✅ Package references updated successfully!`);
}

updatePackageReferences().catch(console.error);