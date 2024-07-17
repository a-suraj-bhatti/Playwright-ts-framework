const fs = require("fs");
const path = require("path");
const glob = require("glob");
const excel = require("exceljs");
const { parse } = require("@typescript-eslint/parser");
const walk = require("acorn-walk");

const testDirectory = "e2e/tests";

function parseTags(tags, currentTest) {
  tags.forEach((tag) => {
    if (tag.startsWith("@functionality_")) {
        const parts = tag.split('_');
        currentTest.functionality = parts.slice(1).join('_');
    } else if (tag.startsWith("@priority_")) {
      currentTest.priority = tag.split("_")[1];
    } else if (tag === "@positive") {
      currentTest.scenarioType = "positive";
    } else if (tag === "@negative") {
      currentTest.scenarioType = "negative";
    }
  });
}

function extractDataFromFile(filePath, testType) {
  console.log(filePath);
  const data = fs.readFileSync(filePath, "utf-8");
  const ast = parse(data, {
    sourceType: "module",
    ecmaVersion: 2020,
    loc: true,
    range: true,
    tokens: true,
  });
  const testData = [];

  walk.simple(ast, {
    CallExpression(node) {
      if (
        node.callee.name === "test" &&
        node.arguments.length >= 2 &&
        (node.arguments[0].type === "Literal" || node.arguments[0].type === "TemplateLiteral")
      ) {
        const testName = node.arguments[0].value || node.arguments[0].quasis[0].value.raw;
        const currentTest = { testName, functionality: "", testType, priority: "", scenarioType: "" };

        if (node.arguments[1].type === "ObjectExpression") {
          const tagProperty = node.arguments[1].properties.find((prop) => prop.key.name === "tag");
          if (tagProperty) {
            const tags = tagProperty.value.elements.map((el) => el.value);
            parseTags(tags, currentTest);
          }
        }

        testData.push(currentTest);
      }
    },
  });

  return testData;
}

function getTestFiles(directory) {
  return glob.sync(path.join(directory, "**/*.{spec.js,spec.ts}"));
}

function determineTestType(filePath) {
  if (filePath.includes("e2e/tests/api/")) {
    return "API";
  } else if (filePath.includes("e2e/tests/ui/visual-tests/")) {
    return "Visual";
  } else if (filePath.includes("e2e/tests/ui/")) {
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
    { header: "Test Name", key: "testName", width: 50 },
    { header: "Functionality", key: "functionality", width: 30 },
    { header: "Test Type", key: "testType", width: 15 },
    { header: "Priority", key: "priority", width: 15 },
    { header: "Scenario Type", key: "scenarioType", width: 15 },
  ];

  data.forEach((test) => {
    worksheet.addRow(test);
  });

  workbook.xlsx
    .writeFile(outputFile)
    .then(() => {
      console.log(`Data successfully written to ${outputFile}`);
    })
    .catch((error) => {
      console.error("Error writing to Excel file", error);
    });
}

const testData = processTestFiles(testDirectory);
writeDataToExcel(testData, "Test_Data.xlsx");