const fs = require("fs");
const path = require("path");
const glob = require("glob");
const excel = require("exceljs");
const { parse } = require("@typescript-eslint/parser");
const walk = require("acorn-walk");

const testDirectory = "e2e/tests";

function parseTags(tags, currentTest) {
  if (!Array.isArray(tags)) {
    tags = [tags]; // Convert single tag to array
  }
  tags.forEach((tag) => {
    if (tag.startsWith("@functionality_")) {
      const parts = tag.split("_");
      currentTest.functionality = parts.slice(1).join("_");
    } else if (tag.startsWith("@priority_")) {
      currentTest.priority = tag.split("_")[1];
    } else if (tag === "@positive") {
      currentTest.scenarioType = "positive";
    } else if (tag === "@negative") {
      currentTest.scenarioType = "negative";
    } else if (tag.startsWith("@sprint_")) {
      currentTest.sprint = tag.split("_")[1];
    } else if (tag.startsWith("@team_")) {
      currentTest.teamName = tag.split("_")[1];
    } else if (tag.startsWith("@us_")) {
      const userStoryData = tag.substring(4);
      currentTest.userStory = `https://jira.app.syfbank.com/browse/${userStoryData}`;
    } else if (tag.startsWith("@testcase_")) {
      currentTest.testCaseId = tag.substring(10); // Extract everything after "@testcase_"
    }
  });
}

function extractDataFromFile(filePath, testType) {
  // console.log(filePath);
  const fileName = path.basename(filePath);
  const data = fs.readFileSync(filePath, "utf-8");
  const ast = parse(data, {
    sourceType: "module",
    ecmaVersion: "latest",
    loc: true,
    range: true,
    tokens: true,
  });
  const testData = [];

  function processTestNode(node, inheritedTags = {}) {
    if (
      node.type === "CallExpression" &&
      node.callee.name === "test" &&
      node.arguments.length >= 2 &&
      (node.arguments[0].type === "Literal" || node.arguments[0].type === "TemplateLiteral")
    ) {
      const testName = node.arguments[0].value || node.arguments[0].quasis[0].value.raw;
      const currentTest = {
        fileName,
        testName,
        functionality: inheritedTags.functionality || "",
        testType,
        priority: inheritedTags.priority || "",
        scenarioType: inheritedTags.scenarioType || "",
        sprint: inheritedTags.sprint || "",
        teamName: inheritedTags.teamName || "",
        userStory: inheritedTags.userStory || "",
        testCaseId: inheritedTags.testCaseId || "",
      };

      if (node.arguments[1] && node.arguments[1].type === "ObjectExpression") {
        const tagProperty = node.arguments[1].properties.find((prop) => prop.key.name === "tag");
        if (tagProperty) {
          let tags;
          if (tagProperty.value.type === "ArrayExpression") {
            tags = tagProperty.value.elements.map((el) => el.value);
          } else if (tagProperty.value.type === "Literal") {
            tags = tagProperty.value.value;
          }
          parseTags(tags, currentTest);
        }
      }

      testData.push(currentTest);
    }
  }

  function processDescribeBlock(node) {
    let describeTags = {};

    if (node.arguments[1] && node.arguments[1].type === "ObjectExpression") {
      const tagProperty = node.arguments[1].properties.find((prop) => prop.key.name === "tag");
      if (tagProperty) {
        let tags;
        if (tagProperty.value.type === "ArrayExpression") {
          tags = tagProperty.value.elements.map((el) => el.value);
        } else if (tagProperty.value.type === "Literal") {
          tags = tagProperty.value.value;
        }
        parseTags(tags, describeTags);
      }
    }

    const testsBlock = node.arguments[2];
    if (
      testsBlock.type === "ArrowFunctionExpression" &&
      testsBlock.body.type === "BlockStatement"
    ) {
      testsBlock.body.body.forEach((statement) => {
        if (
          statement.type === "ExpressionStatement" &&
          statement.expression.type === "CallExpression"
        ) {
          processTestNode(statement.expression, describeTags);
        }
      });
    }
  }

  function traverseAST(node) {
    if (node.type === "Program") {
      node.body.forEach(traverseAST);
    } else if (node.type === "ExpressionStatement") {
      traverseAST(node.expression);
    } else if (node.type === "CallExpression") {
      if (
        node.callee.type === "MemberExpression" &&
        node.callee.object.name === "test" &&
        node.callee.property.name === "describe"
      ) {
        processDescribeBlock(node);
      } else if (node.callee.name === "test") {
        processTestNode(node);
      }
    }
  }

  traverseAST(ast);

  return testData;
}

function getTestFiles(directory) {
  const normalizedDirectory = path.posix.join(...directory.split(path.sep));
  return glob.sync(path.posix.join(normalizedDirectory, "**/*.{spec.js,spec.ts}"));
}

function determineTestType(filePath) {
  const normalizedPath = filePath.split(path.sep).join(path.posix.sep);

  if (normalizedPath.includes("e2e/tests/api/")) {
    return "API";
  } else if (normalizedPath.includes("e2e/tests/ui/visual-tests/")) {
    return "Visual";
  } else if (normalizedPath.includes("e2e/tests/ui/")) {
    return "UI";
  }
  return "";
}

function processTestFiles(directory) {
  const testFiles = getTestFiles(directory);
  return testFiles.flatMap((file) => {
    const testType = determineTestType(file);
    return extractDataFromFile(file, testType);
  });
}

function writeDataToExcel(data, outputFile) {
  const workbook = new excel.Workbook();
  const worksheet = workbook.addWorksheet("Test Data");

  worksheet.columns = [
    { header: "File Name", key: "fileName", width: 30 },
    { header: "Test Name", key: "testName", width: 50 },
    { header: "Functionality", key: "functionality", width: 30 },
    { header: "Test Type", key: "testType", width: 15 },
    { header: "Priority", key: "priority", width: 15 },
    { header: "Scenario Type", key: "scenarioType", width: 15 },
    { header: "Team Name", key: "teamName", width: 15 },
    { header: "Sprint", key: "sprint", width: 15 },
    { header: "User Story", key: "userStory", width: 20 },
    { header: "Test Case ID", key: "testCaseId", width: 20 },
  ];

  data.forEach((test) => {
    worksheet.addRow(test);
  });

  workbook.xlsx
    .writeFile(outputFile)
    .then(() => {
      console.log(`Report generated successfully`);
    })
    .catch((error) => {
      console.error("Error generating report", error);
    });
}

console.log("Generating report...please wait");
const testData = processTestFiles(testDirectory);
writeDataToExcel(testData, "Test_Data.xlsx");
