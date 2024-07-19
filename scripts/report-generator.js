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

// function extractDataFromFile(filePath, testType) {
//   console.log(filePath);
//   const data = fs.readFileSync(filePath, "utf-8");
//   const ast = parse(data, {
//     sourceType: "module",
//     ecmaVersion: "latest",  // Use the latest ECMAScript version
//     loc: true,
//     range: true,
//     tokens: true,
//     jsx: true,  // Enable JSX parsing if your tests use it
//     ecmaFeatures: {
//       globalReturn: false,
//       impliedStrict: true,
//       jsx: true,
//     },
//     // Enable all types of statements to be parsed
//     allowImportExportEverywhere: true,
//     allowAwaitOutsideFunction: true,
//     allowReturnOutsideFunction: true,
//     allowSuperOutsideMethod: true,
//   });
//   const testData = [];

//   walk.simple(ast, {
//     CallExpression(node) {
//         console.log(node);
//       if (
//         node.callee.name === "test" &&
//         node.arguments.length >= 2 &&
//         (node.arguments[0].type === "Literal" || node.arguments[0].type === "TemplateLiteral")
//       ) {
//         const testName = node.arguments[0].value || node.arguments[0].quasis[0].value.raw;
//         const currentTest = { testName, functionality: "", testType, priority: "", scenarioType: "" };

//         if (node.arguments[1].type === "ObjectExpression") {
//           const tagProperty = node.arguments[1].properties.find((prop) => prop.key.name === "tag");
//           if (tagProperty) {
//             let tags;
//             if (tagProperty.value.type === "ArrayExpression") {
//               tags = tagProperty.value.elements.map((el) => el.value);
//             } else if (tagProperty.value.type === "Literal") {
//               tags = tagProperty.value.value;
//             }
//             console.log(tags)
//             parseTags(tags, currentTest);
//           }
//         }

//         testData.push(currentTest);
//       }
//     },
//   });

//   return testData;
// }
// function extractDataFromFile(filePath, testType) {
//     console.log(filePath);
//     const data = fs.readFileSync(filePath, "utf-8");
//     const ast = parse(data, {
//       sourceType: "module",
//       ecmaVersion: "latest",
//       loc: true,
//       range: true,
//       tokens: true,
//     });
//     const testData = [];
//     let describeTags = {};
  
//     function processTestNode(node, inheritedTags = {}) {
//       if (
//         node.callee.name === "test" &&
//         node.arguments.length >= 2 &&
//         (node.arguments[0].type === "Literal" || node.arguments[0].type === "TemplateLiteral")
//       ) {
//         const testName = node.arguments[0].value || node.arguments[0].quasis[0].value.raw;
//         const currentTest = { 
//           testName, 
//           functionality: inheritedTags.functionality || "",
//           testType, 
//           priority: inheritedTags.priority || "", 
//           scenarioType: inheritedTags.scenarioType || "" 
//         };
  
//         if (node.arguments[1].type === "ObjectExpression") {
//           const tagProperty = node.arguments[1].properties.find((prop) => prop.key.name === "tag");
//           if (tagProperty) {
//             let tags;
//             if (tagProperty.value.type === "ArrayExpression") {
//               tags = tagProperty.value.elements.map((el) => el.value);
//             } else if (tagProperty.value.type === "Literal") {
//               tags = tagProperty.value.value;
//             }
//             parseTags(tags, currentTest);
//           }
//         }
  
//         testData.push(currentTest);
//       }
//     }
  
//     walk.simple(ast, {
//       CallExpression(node) {
//         if (node.callee.type === "MemberExpression" && 
//             node.callee.object.name === "test" && 
//             node.callee.property.name === "describe") {
//           // Handle test.describe
//           const describeOptions = node.arguments[1];
//           if (describeOptions && describeOptions.type === "ObjectExpression") {
//             const tagProperty = describeOptions.properties.find((prop) => prop.key.name === "tag");
//             if (tagProperty) {
//               describeTags = {};
//               let tags;
//               if (tagProperty.value.type === "ArrayExpression") {
//                 tags = tagProperty.value.elements.map((el) => el.value);
//               } else if (tagProperty.value.type === "Literal") {
//                 tags = tagProperty.value.value;
//               }
//               parseTags(tags, describeTags);
//             }
//           }
//           // Process tests within the describe block
//           const testsBlock = node.arguments[2];
//           if (testsBlock.type === "ArrowFunctionExpression" && testsBlock.body.type === "BlockStatement") {
//             testsBlock.body.body.forEach(statement => {
//               if (statement.type === "ExpressionStatement" && statement.expression.type === "CallExpression") {
//                 processTestNode(statement.expression, describeTags);
//               }
//             });
//           }
//         } else if (node.callee.name === "test") {
//           processTestNode(node);
//         }
//       },
//     });
  
//     return testData;
//   }
function extractDataFromFile(filePath, testType) {
    // console.log(filePath);
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
        node.type === 'CallExpression' &&
        node.callee.name === "test" &&
        node.arguments.length >= 2 &&
        (node.arguments[0].type === "Literal" || node.arguments[0].type === "TemplateLiteral")
      ) {
        const testName = node.arguments[0].value || node.arguments[0].quasis[0].value.raw;
        const currentTest = { 
          testName, 
          functionality: inheritedTags.functionality || "",
          testType, 
          priority: inheritedTags.priority || "", 
          scenarioType: inheritedTags.scenarioType || "" 
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
      if (testsBlock.type === "ArrowFunctionExpression" && testsBlock.body.type === "BlockStatement") {
        testsBlock.body.body.forEach(statement => {
          if (statement.type === "ExpressionStatement" && statement.expression.type === "CallExpression") {
            processTestNode(statement.expression, describeTags);
          }
        });
      }
    }
  
    function traverseAST(node) {
      if (node.type === 'Program') {
        node.body.forEach(traverseAST);
      } else if (node.type === 'ExpressionStatement') {
        traverseAST(node.expression);
      } else if (node.type === 'CallExpression') {
        if (node.callee.type === "MemberExpression" && 
            node.callee.object.name === "test" && 
            node.callee.property.name === "describe") {
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
      console.log(`Report generated successfully`);
    })
    .catch((error) => {
      console.error("Error geenrating report", error);
    });
}

console.log("Generating report...please wait")
const testData = processTestFiles(testDirectory);
writeDataToExcel(testData, "Test_Data.xlsx");