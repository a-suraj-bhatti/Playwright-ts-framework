const xlsx = require('xlsx');
const fs = require('fs');

// Read Excel file
const workbook = xlsx.readFile('Test_Data.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = xlsx.utils.sheet_to_json(worksheet);

// Process data for charts
const functionalities = {};
const sprintData = {};
const teamData = {};
const testTypes = new Set();
const scenarioTypes = new Set();

data.forEach(row => {
  functionalities[row.Functionality] = (functionalities[row.Functionality] || 0) + 1;
  sprintData[row.Sprint] = (sprintData[row.Sprint] || 0) + 1;
  
  const teamName = row.teamName || 'Unknown';
  teamData[teamName] = (teamData[teamName] || 0) + 1;
  
  testTypes.add(row['Test Type']);
  scenarioTypes.add(row['Scenario Type']);
});

// Create HTML content
const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Automation Report</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        .chart-container { width: 45%; margin: 20px auto; }
        #filters { margin-bottom: 20px; }
        select { margin-right: 10px; }
    </style>
</head>
<body>
    <h1>Test Automation Report</h1>
    
    <div id="filters">
        <select id="teamFilter">
            <option value="">All Teams</option>
            ${Object.keys(teamData).map(team => `<option value="${team}">${team}</option>`).join('')}
        </select>
        <select id="functionalityFilter">
            <option value="">All Functionalities</option>
            ${Object.keys(functionalities).map(func => `<option value="${func}">${func}</option>`).join('')}
        </select>
        <select id="testTypeFilter">
            <option value="">All Test Types</option>
            ${Array.from(testTypes).map(type => `<option value="${type}">${type}</option>`).join('')}
        </select>
        <select id="scenarioTypeFilter">
            <option value="">All Scenario Types</option>
            ${Array.from(scenarioTypes).map(type => `<option value="${type}">${type}</option>`).join('')}
        </select>
    </div>

    <div class="chart-container">
        <canvas id="functionalityChart"></canvas>
    </div>
    <div class="chart-container">
        <canvas id="sprintChart"></canvas>
    </div>
    <div class="chart-container">
        <canvas id="teamChart"></canvas>
    </div>

    <script>
    const data = ${JSON.stringify(data)};
    let filteredData = [...data];

    let functionalityChart, sprintChart, teamChart;

    function updateCharts() {
        const functionalities = {};
        const sprintData = {};
        const teamData = {};

        filteredData.forEach(row => {
            functionalities[row.Functionality] = (functionalities[row.Functionality] || 0) + 1;
            sprintData[row.Sprint] = (sprintData[row.Sprint] || 0) + 1;
            const teamName = row.teamName || 'Unknown';
            teamData[teamName] = (teamData[teamName] || 0) + 1;
        });

        functionalityChart.data.labels = Object.keys(functionalities);
        functionalityChart.data.datasets[0].data = Object.values(functionalities);
        functionalityChart.update();

        sprintChart.data.labels = Object.keys(sprintData);
        sprintChart.data.datasets[0].data = Object.values(sprintData);
        sprintChart.update();

        teamChart.data.labels = Object.keys(teamData);
        teamChart.data.datasets[0].data = Object.values(teamData);
        teamChart.update();
    }

    function applyFilters() {
        const teamFilter = document.getElementById('teamFilter').value;
        const functionalityFilter = document.getElementById('functionalityFilter').value;
        const testTypeFilter = document.getElementById('testTypeFilter').value;
        const scenarioTypeFilter = document.getElementById('scenarioTypeFilter').value;

        filteredData = data.filter(row => 
            (teamFilter === '' || (row.teamName || 'Unknown') === teamFilter) &&
            (functionalityFilter === '' || row.Functionality === functionalityFilter) &&
            (testTypeFilter === '' || row['Test Type'] === testTypeFilter) &&
            (scenarioTypeFilter === '' || row['Scenario Type'] === scenarioTypeFilter)
        );

        updateCharts();
    }

    document.getElementById('teamFilter').addEventListener('change', applyFilters);
    document.getElementById('functionalityFilter').addEventListener('change', applyFilters);
    document.getElementById('testTypeFilter').addEventListener('change', applyFilters);
    document.getElementById('scenarioTypeFilter').addEventListener('change', applyFilters);

    function initCharts() {
        // Create functionality pie chart
        functionalityChart = new Chart(document.getElementById('functionalityChart'), {
            type: 'pie',
            data: {
                labels: Object.keys(${JSON.stringify(functionalities)}),
                datasets: [{
                    data: Object.values(${JSON.stringify(functionalities)}),
                    backgroundColor: Object.keys(${JSON.stringify(functionalities)}).map(() => 
                        '#' + Math.floor(Math.random()*16777215).toString(16)
                    )
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Tests by Functionality'
                    }
                }
            }
        });

        // Create sprint bar chart
        sprintChart = new Chart(document.getElementById('sprintChart'), {
            type: 'bar',
            data: {
                labels: Object.keys(${JSON.stringify(sprintData)}),
                datasets: [{
                    label: 'Tests per Sprint',
                    data: Object.values(${JSON.stringify(sprintData)}),
                    backgroundColor: 'rgba(75, 192, 192, 0.6)'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Tests by Sprint'
                    }
                }
            }
        });

        // Create team bar chart
        teamChart = new Chart(document.getElementById('teamChart'), {
            type: 'bar',
            data: {
                labels: Object.keys(${JSON.stringify(teamData)}),
                datasets: [{
                    label: 'Tests per Team',
                    data: Object.values(${JSON.stringify(teamData)}),
                    backgroundColor: 'rgba(153, 102, 255, 0.6)'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Tests by Team'
                    }
                }
            }
        });
    }

    // Initialize charts when the page loads
    window.onload = initCharts;
    </script>
</body>
</html>
`;

// Write HTML file
fs.writeFileSync('test_report.html', htmlContent);
console.log('HTML report generated: test_report.html');