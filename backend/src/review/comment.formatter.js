const confidenceWeight = (
  confidence
) => {

  switch (confidence) {
    case "high":
      return 3;

    case "medium":
      return 2;

    case "low":
      return 1;

    default:
      return 0;
  }
};

const severityWeight = (
  severity
) => {

  switch (severity) {
    case "high":
      return 3;

    case "medium":
      return 2;

    case "low":
      return 1;

    default:
      return 0;
  }
};

const issueScore = (
  issue
) => {

  return (
    severityWeight(issue.severity) +
    confidenceWeight(issue.confidence)
  );
};

const getSeverityDot = (
  severity
) => {

  switch (severity) {
    case "high":
      return "🔴";

    case "medium":
      return "🟡";

    case "low":
      return "🟢";

    default:
      return "⚪";
  }
};

const getRiskLevel = (
  issues
) => {

  if (issues.length === 0) {
    return "Low";
  }

  const maxSeverity = Math.max(
    ...issues.map(issue =>
      severityWeight(issue.severity)
    )
  );

  switch (maxSeverity) {
    case 3:
      return "High";

    case 2:
      return "Medium";

    default:
      return "Low";
  }
};

const filterIssues = (
  issues
) => {

  return issues.filter(issue => {

    // Remove weak low confidence findings
    if (
      issue.confidence === "low" &&
      issue.severity !== "high"
    ) {
      return false;
    }

const explanation =
  typeof issue.explanation === "string"
    ? issue.explanation.toLowerCase()
    : "";

    // Remove generic software advice
    const genericPatterns = [
      "regularly update",
      "maintenance requirements",
      "could lead to issues",
      "best practice",
      "might confuse readers"
    ];

    const isGeneric =
      genericPatterns.some(pattern =>
        explanation.includes(pattern)
      );

    if (
      isGeneric &&
      issue.severity !== "high"
    ) {
      return false;
    }

    return true;
  });
};


const getTopIssues = (
  issues
) => {

  return issues
    .sort(
      (a, b) =>
        issueScore(b) -
        issueScore(a)
    )
    .slice(0, 5);
};

const formatIssue = (
  issue,
  index
) => {

  const dot =
    getSeverityDot(issue.severity);

  let output =
`### ${dot} ${issue.title}

${issue.explanation}
`;

  if (issue.impact) {
    output += `\n**Impact**\n${issue.impact}\n`;
  }

  if (issue.suggestion) {
    output += `\n**Suggestion**\n${issue.suggestion}\n`;
  }

  output +=
`\n<sub>Type: ${issue.type} • Severity: ${issue.severity} • Confidence: ${issue.confidence}</sub>
`;

  if (issue.file) {
    output +=
`\n<sub>File: ${issue.file}</sub>\n`;
  }

  return output;
};

export const formatComment = (
  data
) => {

  const {
    summary,
    metrics
  } = data;

  const issues =
    filterIssues(data.issues || []);

  let comment =
`# Tzylo Review

`;

  if (summary) {
    comment += `${summary}\n\n`;
  }

  comment +=
`## Summary

🔴 High: ${metrics.high}  
🟡 Medium: ${metrics.medium}  
🟢 Low: ${metrics.low}  

**Risk Level:** ${getRiskLevel(issues)}

`;

  if (issues.length === 0) {

    comment +=
`---

## Result

🟢 No significant engineering concerns detected.
`;

    return comment.trim();
  }

  comment +=
`---

## Findings

`;

  issues.forEach((issue, index) => {

    comment += formatIssue(
      issue,
      index
    );

    comment += `\n---\n\n`;
  });

  comment += `\n\n---\n*Powered by [Tzylo](https://tzylo.com) · [Install free](https://github.com/apps/tzylo)*`


  return comment.trim();
};

export const formatSummaryComment = (
  data,
  issues
) => {

  const {
    summary,
    metrics
  } = data;

  let comment =
`# Tzylo Review

`;

  if (summary) {
    comment += `${summary}\n\n`;
  }

  comment +=
`## Summary

🔴 High: ${metrics.high}
🟡 Medium: ${metrics.medium}
🟢 Low: ${metrics.low}

**Risk Level:** ${getRiskLevel(issues)}

---

React on finding comments:

👍 valid
👎 wrong
😕 unclear
🚀 known
👀 out of scope

---

*Powered by [Tzylo](https://tzylo.com)*
`;

  return comment.trim();
};

export const formatFindingComment = (
  issue
) => {

  const dot =
    getSeverityDot(
      issue.severity
    );

  let output =
`${dot} **${issue.title}**

${issue.explanation}
`;

  if (issue.suggestion) {

    output +=
`\n**Suggestion**
${issue.suggestion}\n`;
  }

  output +=
`\n<sub>
Type: ${issue.type}
• Severity: ${issue.severity}
• Confidence: ${issue.confidence}
</sub>`;

  if (issue.file) {

    output +=
`\n<sub>File: ${issue.file}</sub>`;
  }

  output +=
`\n\nReact: 👍 👎 😕 🚀 👀`;

  return output.trim();
};

export const formatReviewComments = (
  data
) => {

  const filtered =
    filterIssues(
      data.issues || []
    );

  const topIssues =
    getTopIssues(filtered);

  return {

    summaryComment:
      formatSummaryComment(
        data,
        topIssues
      ),

    findings:
      topIssues.map(issue => ({

        issue,

        comment:
          formatFindingComment(
            issue
          )

      }))
  };
};