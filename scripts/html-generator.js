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
  functionalities[row.Functionality || 'Unspecified'] = (functionalities[row.Functionality || 'Unspecified'] || 0) + 1;
  sprintData[row.Sprint || 'Unspecified'] = (sprintData[row.Sprint || 'Unspecified'] || 0) + 1;
  
  const teamName = row['Team Name'] || 'Unspecified';
  teamData[teamName] = (teamData[teamName] || 0) + 1;
  
  testTypes.add(row['Test Type'] || 'Unspecified');
  scenarioTypes.add(row['Scenario Type'] || 'Unspecified');
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
    <script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2.0.0"></script>
    <link href="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css" rel="stylesheet" />
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js"></script>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f0f0f0;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            text-align: center;
        }
        .charts-container {
            display: flex;
            flex-wrap: wrap;
            justify-content: space-around;
        }
        .chart-container {
            width: 30%;
            min-width: 300px;
            height: 300px;
            margin: 20px 0;
            background-color: white;
            border-radius: 8px;
            padding: 15px;
            box-shadow: 0 0 5px rgba(0,0,0,0.1);
        }
        #filters {
            margin-bottom: 20px;
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
        }
        .filter-group {
            display: flex;
            flex-direction: column;
            flex: 1;
            min-width: 200px;
        }
        label {
            margin-bottom: 5px;
            font-weight: bold;
            color: #555;
        }
        .select2-container {
            width: 100% !important;
        }
        .select2-container--default .select2-selection--single {
            height: 38px;
            padding: 5px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        .select2-container--default .select2-selection--single .select2-selection__arrow {
            height: 36px;
        }
        @media (max-width: 1200px) {
            .chart-container { width: 45%; }
        }
        @media (max-width: 768px) {
            .chart-container { width: 100%; }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Test Automation Report</h1>
        
        <div id="filters">
            <div class="filter-group">
                <label for="teamFilter">Team:</label>
                <select id="teamFilter" class="select2">
                    <option value="">All Teams</option>
                </select>
            </div>
            <div class="filter-group">
                <label for="functionalityFilter">Functionality:</label>
                <select id="functionalityFilter" class="select2">
                    <option value="">All Functionalities</option>
                </select>
            </div>
            <div class="filter-group">
                <label for="sprintFilter">Sprint:</label>
                <select id="sprintFilter" class="select2">
                    <option value="">All Sprints</option>
                </select>
            </div>
            <div class="filter-group">
                <label for="testTypeFilter">Test Type:</label>
                <select id="testTypeFilter" class="select2">
                    <option value="">All Test Types</option>
                </select>
            </div>
            <div class="filter-group">
                <label for="scenarioTypeFilter">Scenario Type:</label>
                <select id="scenarioTypeFilter" class="select2">
                    <option value="">All Scenario Types</option>
                </select>
            </div>
        </div>

        <div class="charts-container">
            <div class="chart-container">
                <canvas id="functionalityChart"></canvas>
            </div>
            <div class="chart-container">
                <canvas id="sprintChart"></canvas>
            </div>
            <div class="chart-container">
                <canvas id="teamChart"></canvas>
            </div>
        </div>
    </div>

    <script>
    const data = ${JSON.stringify(data)};
    const functionalities = ${JSON.stringify(functionalities)};
    const sprintData = ${JSON.stringify(sprintData)};
    const teamData = ${JSON.stringify(teamData)};

    let filteredData = [...data];

    let functionalityChart, sprintChart, teamChart;

    function updateCharts() {
        const functionalities = {};
        const sprintData = {};
        const teamData = {};

        filteredData.forEach(row => {
            functionalities[row.Functionality || 'Unspecified'] = (functionalities[row.Functionality || 'Unspecified'] || 0) + 1;
            sprintData[row.Sprint || 'Unspecified'] = (sprintData[row.Sprint || 'Unspecified'] || 0) + 1;
            const teamName = row['Team Name'] || 'Unspecified';
            teamData[teamName] = (teamData[teamName] || 0) + 1;
        });

        updateChart(functionalityChart, functionalities);
        updateChart(sprintChart, sprintData);
        updateChart(teamChart, teamData);
    }

    function updateChart(chart, data) {
        chart.data.labels = Object.keys(data);
        chart.data.datasets[0].data = Object.values(data);
        chart.update();
    }

    function applyFilters() {
        const teamFilter = $('#teamFilter').val();
        const functionalityFilter = $('#functionalityFilter').val();
        const sprintFilter = $('#sprintFilter').val();
        const testTypeFilter = $('#testTypeFilter').val();
        const scenarioTypeFilter = $('#scenarioTypeFilter').val();

        filteredData = data.filter(row => 
            (teamFilter === '' || (row['Team Name'] || 'Unspecified') === teamFilter) &&
            (functionalityFilter === '' || (row.Functionality || 'Unspecified') === functionalityFilter) &&
            (sprintFilter === '' || (row.Sprint || 'Unspecified') === sprintFilter) &&
            (testTypeFilter === '' || (row['Test Type'] || 'Unspecified') === testTypeFilter) &&
            (scenarioTypeFilter === '' || (row['Scenario Type'] || 'Unspecified') === scenarioTypeFilter)
        );

        updateCharts();
    }

    function initCharts() {
        Chart.register(ChartDataLabels);

        // Populate filter options
        populateFilter('teamFilter', [...new Set(data.map(row => row['Team Name'] || 'Unspecified'))]);
        populateFilter('functionalityFilter', [...new Set(data.map(row => row.Functionality || 'Unspecified'))]);
        populateFilter('sprintFilter', [...new Set(data.map(row => row.Sprint || 'Unspecified'))]);
        populateFilter('testTypeFilter', [...new Set(data.map(row => row['Test Type'] || 'Unspecified'))]);
        populateFilter('scenarioTypeFilter', [...new Set(data.map(row => row['Scenario Type'] || 'Unspecified'))]);

        // Initialize Select2 for all dropdowns
        $('.select2').select2({
            placeholder: "Select an option",
            allowClear: true
        });

        // Create functionality pie chart
        functionalityChart = createPieChart('functionalityChart', 'Tests by Functionality', functionalities);

        // Create sprint bar chart
        sprintChart = createBarChart('sprintChart', 'Tests by Sprint', sprintData, 'rgba(255, 159, 64, 0.6)');

        // Create team bar chart
        teamChart = createBarChart('teamChart', 'Tests by Team', teamData, 'rgba(75, 192, 192, 0.6)');

        // Add event listeners for filters
        $('.select2').on('change', applyFilters);
    }

    function createPieChart(elementId, title, data) {
        return new Chart(document.getElementById(elementId), {
            type: 'pie',
            data: {
                labels: Object.keys(data),
                datasets: [{
                    data: Object.values(data),
                    backgroundColor: Object.keys(data).map(() => 
                        '#' + Math.floor(Math.random()*16777215).toString(16)
                    )
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: title,
                        font: { size: 16 }
                    },
                    legend: {
                        display: false
                    },
                    datalabels: {
                        color: '#fff',
                        font: { weight: 'bold', size: 12 },
                        formatter: (value, ctx) => {
                            let sum = ctx.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                            let percentage = (value * 100 / sum).toFixed(2) + "%";
                            return ctx.chart.data.labels[ctx.dataIndex] + "\\n" + percentage;
                        }
                    }
                }
            }
        });
    }

    function createBarChart(elementId, title, data, backgroundColor) {
        return new Chart(document.getElementById(elementId), {
            type: 'bar',
            data: {
                labels: Object.keys(data),
                datasets: [{
                    label: title,
                    data: Object.values(data),
                    backgroundColor: backgroundColor
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: title,
                        font: { size: 16 }
                    }
                }
            }
        });
    }

    function populateFilter(filterId, options) {
        const filter = document.getElementById(filterId);
        options.sort().forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.textContent = option;
            filter.appendChild(optionElement);
        });
    }

    // Initialize charts when the page loads
    $(document).ready(initCharts);
    </script>
</body>
</html>
`;

// Write HTML file
fs.writeFileSync('test_report.html', htmlContent);
console.log('HTML report generated: test_report.html');