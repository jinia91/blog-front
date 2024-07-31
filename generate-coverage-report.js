const fs = require('fs');

const coverageSummary = JSON.parse(fs.readFileSync('./coverage/coverage-summary.json', 'utf8'));

let markdownReport = `
## Test Coverage Report

| File        | Statements | Branches | Functions | Lines |
| ----------- | ---------- | -------- | --------- | ----- |
`;

for (const [file, metrics] of Object.entries(coverageSummary)) {
  if (file !== 'total') {
    markdownReport += `| ${file} | ${metrics.statements.pct}% | ${metrics.branches.pct}% | ${metrics.functions.pct}% | ${metrics.lines.pct}% |\n`;
  }
}

markdownReport += `
## Summary

| Metric      | Percentage |
| ----------- | ---------- |
| Statements  | ${coverageSummary.total.statements.pct}% |
| Branches    | ${coverageSummary.total.branches.pct}% |
| Functions   | ${coverageSummary.total.functions.pct}% |
| Lines       | ${coverageSummary.total.lines.pct}% |
`;

fs.writeFileSync('coverage-report.md', markdownReport);
