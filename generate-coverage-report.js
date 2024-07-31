const fs = require('fs');

const coverageSummary = JSON.parse(fs.readFileSync('./coverage/coverage-summary.json', 'utf8'));

const markdownReport = `
## Test Coverage Report

| Metric      | Percentage |
| ----------- | ---------- |
| Statements  | ${coverageSummary.total.statements.pct}% |
| Branches    | ${coverageSummary.total.branches.pct}% |
| Functions   | ${coverageSummary.total.functions.pct}% |
| Lines       | ${coverageSummary.total.lines.pct}% |
`;

fs.writeFileSync('coverage-report.md', markdownReport);
