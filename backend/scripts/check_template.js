const fs = require('fs');
const content = fs.readFileSync('modern-frontend/src/app/pages/VendorDashboardPage.tsx', 'utf-8');
const lines = content.split('\n');
lines.forEach((line, i) => {
  if (line.includes('`') && line.includes('[0.')) {
    console.log(`${i+1}: ${line.trim()}`);
  }
});
