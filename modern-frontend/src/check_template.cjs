const fs = require('fs');
const lines = fs.readFileSync('src/app/pages/VendorDashboardPage.tsx', 'utf-8').split('\n');
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('`') && /\/\d+/.test(line)) {
    console.log(`Line ${i+1}: ${line.trim().substring(0, 160)}`);
  }
}
