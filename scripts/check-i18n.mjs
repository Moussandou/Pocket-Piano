import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');
const srcDir = path.join(rootDir, 'src');
const localesDir = path.join(srcDir, 'locales');

const locales = ['en', 'fr'];
const localeData = {};

// Load locale files
locales.forEach(lang => {
    const filePath = path.join(localesDir, `${lang}.json`);
    if (fs.existsSync(filePath)) {
        localeData[lang] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } else {
        console.error(`Missing locale file: ${filePath}`);
    }
});

function getAllKeys(obj, prefix = '') {
    let keys = [];
    for (const key in obj) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (typeof obj[key] === 'object' && obj[key] !== null) {
            keys = keys.concat(getAllKeys(obj[key], fullKey));
        } else {
            keys.push(fullKey);
        }
    }
    return keys;
}

const enKeys = getAllKeys(localeData.en || {});
const frKeys = getAllKeys(localeData.fr || {});

// 1. Check if keys match between languages
console.log('--- Checking Key Consistency ---');
const missingInFr = enKeys.filter(k => !frKeys.includes(k));
const missingInEn = frKeys.filter(k => !enKeys.includes(k));

if (missingInFr.length > 0) console.error(`Missing in FR: ${missingInFr.join(', ')}`);
if (missingInEn.length > 0) console.error(`Missing in EN: ${missingInEn.join(', ')}`);
if (missingInFr.length === 0 && missingInEn.length === 0) console.log('✅ Keys match between EN and FR.');

// 2. Scan src for used keys
console.log('\n--- Scanning for Used Keys ---');
const usedKeys = new Set();
const hardcodedWarnings = [];

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
            if (file !== 'locales' && file !== 'assets') walkDir(filePath);
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            const content = fs.readFileSync(filePath, 'utf8');

            // Extract t('key') or t("key") or t(`key`)
            const tRegex = /\bt\(['"`]([^'"`]+)['"`]\)/g;
            let match;
            while ((match = tRegex.exec(content)) !== null) {
                usedKeys.add(match[1]);
            }

            // Simple heuristic for hardcoded strings in JSX (lines starting with > and having letters)
            // This is very basic and might have false positives, but it's a start.
            const lines = content.split('\n');
            lines.forEach((line, idx) => {
                // Look for text between tags: >Text<
                const jsxTextMatch = />([^<>{}\n]+)</g;
                let jMatch;
                while ((jMatch = jsxTextMatch.exec(line)) !== null) {
                    const text = jMatch[1].trim();
                    if (text && /[a-zA-Z]/.test(text) && !text.includes('var(') && !text.includes('className')) {
                        hardcodedWarnings.push(`${path.relative(rootDir, filePath)}:${idx + 1} - Potential hardcoded string: "${text}"`);
                    }
                }
            });
        }
    });
}

walkDir(srcDir);

const missingFromCode = [...usedKeys].filter(k => !enKeys.includes(k));
if (missingFromCode.length > 0) {
    console.error(`❌ Keys used in code but missing from locales: ${missingFromCode.join(', ')}`);
} else {
    console.log('✅ All keys used in code are defined in locales.');
}

const unusedKeys = enKeys.filter(k => !usedKeys.has(k));
if (unusedKeys.length > 0) {
    console.log(`⚠️ Unused keys in locales: ${unusedKeys.join(', ')}`);
}

if (hardcodedWarnings.length > 0) {
    console.log('\n--- Potential Hardcoded Strings ---');
    hardcodedWarnings.slice(0, 20).forEach(w => console.warn(w));
    if (hardcodedWarnings.length > 20) console.log(`... and ${hardcodedWarnings.length - 20} more.`);
}

if (missingInFr.length > 0 || missingInEn.length > 0 || missingFromCode.length > 0) {
    process.exit(1);
} else {
    console.log('\n✅ i18n Check Passed!');
}
