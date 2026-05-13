const fs = require('fs');
const path = require('path');

const storePath = path.join(__dirname, 'lib', 'store.js');
let content = fs.readFileSync(storePath, 'utf8');

// Replace { 'Content-Type': 'application/json' } with getHeaders()
content = content.replace(/headers:\s*{\s*'Content-Type':\s*'application\/json'\s*}/g, 'headers: getHeaders()');

// Replace { method: 'DELETE' } with { method: 'DELETE', headers: getHeadersNoCT() }
content = content.replace(/{ method: 'DELETE' }/g, "{ method: 'DELETE', headers: getHeadersNoCT() }");

// Also replace await fetch(`${API_BASE_URL}/all`) with getHeadersNoCT()
content = content.replace(/await fetch\(`\$\{API_BASE_URL\}\/all`\)/g, "await fetch(`${API_BASE_URL}/all`, { headers: getHeadersNoCT() })");

fs.writeFileSync(storePath, content);
console.log('Patched store.js successfully');
