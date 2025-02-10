const xlsx = require("xlsx");
const fs = require("fs");

// Read Excel file
const workbook = xlsx.readFile("Test_Data.xlsx");
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = xlsx.utils.sheet_to_json(worksheet);

// Process data for charts
const functionalities = {};
const sprintData = {};
const teamData = {};
const testTypes = new Set();
const scenarioTypes = new Set();

data.forEach((row) => {
  functionalities[row.Functionality || "Unspecified"] =
    (functionalities[row.Functionality || "Unspecified"] || 0) + 1;
  sprintData[row.Sprint || "Unspecified"] = (sprintData[row.Sprint || "Unspecified"] || 0) + 1;

  const teamName = row["Team Name"] || "Unspecified";
  teamData[teamName] = (teamData[teamName] || 0) + 1;

  testTypes.add(row["Test Type"] || "Unspecified");
  scenarioTypes.add(row["Scenario Type"] || "Unspecified");
});

// Get the last 5 sprints without sorting
const lastFiveSprints = Object.keys(sprintData).slice(-5);
const filteredSprintData = Object.fromEntries(
  lastFiveSprints.map((sprint) => [sprint, sprintData[sprint]]),
);

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
        :root {
            --primary-color: #2c3e50;
            --secondary-color: #3498db;
            --accent-color: #e74c3c;
            --background-color: #ecf0f1;
            --card-background: #ffffff;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
            background-color: var(--background-color);
            color: var(--primary-color);
        }

        .header {
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            color: white;
            padding: 2rem;
            text-align: center;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }

        .header h1 {
            margin: 0;
            font-size: 2.5rem;
            font-weight: 300;
        }

        .container {
            max-width: 1400px;
            margin: 2rem auto;
            padding: 0 20px;
        }

        .dashboard-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-bottom: 2rem;
        }

        .stat-card {
            background: var(--card-background);
            padding: 1.5rem;
            border-radius: 10px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            text-align: center;
            transition: transform 0.3s ease;
        }

        .stat-card:hover {
            transform: translateY(-5px);
        }

        .stat-value {
            font-size: 2rem;
            font-weight: bold;
            color: var(--secondary-color);
        }

        .stat-label {
            color: #666;
            font-size: 0.9rem;
            margin-top: 0.5rem;
        }

        #filters {
            background: var(--card-background);
            padding: 1.5rem;
            border-radius: 10px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            margin-bottom: 2rem;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
        }

        .filter-group {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }

        .filter-group label {
            font-weight: 500;
            color: var(--primary-color);
        }

        .select2-container {
            width: 100% !important;
        }

        .select2-container--default .select2-selection--single {
            height: 40px;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 5px;
        }

        .charts-container {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 2rem;
        }

        .chart-container {
            background: var(--card-background);
            padding: 1.5rem;
            border-radius: 10px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            height: 400px;
        }

        #totalTests {
            background: var(--secondary-color);
            color: white;
            padding: 1rem;
            border-radius: 8px;
            text-align: center;
            font-size: 1.5rem;
            margin-bottom: 2rem;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        @media (max-width: 768px) {
            .charts-container {
                grid-template-columns: 1fr;
            }
            
            .header h1 {
                font-size: 2rem;
            }
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
            width: 8px;
        }

        ::-webkit-scrollbar-track {
            background: #f1f1f1;
        }

        ::-webkit-scrollbar-thumb {
            background: var(--secondary-color);
            border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
            background: var(--primary-color);
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Test Automation Dashboard</h1>
    </div>
    
    <div class="container">
        <div class="dashboard-stats">
            <div class="stat-card">
                <div class="stat-value" id="totalTestsValue">0</div>
                <div class="stat-label">Total Tests</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" id="totalTeams">0</div>
                <div class="stat-label">Teams</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" id="totalFunctionalities">0</div>
                <div class="stat-label">Functionalities</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" id="totalSprints">0</div>
                <div class="stat-label">Sprints</div>
            </div>
        </div>

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

        <div id="totalTests"></div>

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
    const sprintData = ${JSON.stringify(filteredSprintData)};
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

    updateChart(functionalityChart, limitDataToTop7(functionalities));
    updateChart(sprintChart, limitDataToTop7(sprintData));
    updateChart(teamChart, limitDataToTop7(teamData));

    document.getElementById('totalTests').textContent = 'Total Tests: ' + filteredData.length;
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

    populateFilter('teamFilter', [...new Set(data.map(row => row['Team Name'] || 'Unspecified'))]);
    populateFilter('functionalityFilter', [...new Set(data.map(row => row.Functionality || 'Unspecified'))]);
    populateFilter('sprintFilter', [...new Set(data.map(row => row.Sprint || 'Unspecified'))]);
    populateFilter('testTypeFilter', [...new Set(data.map(row => row['Test Type'] || 'Unspecified'))]);
    populateFilter('scenarioTypeFilter', [...new Set(data.map(row => row['Scenario Type'] || 'Unspecified'))]);

    $('.select2').select2({
        placeholder: "Select an option",
        allowClear: true
    });

    // Apply the limit of 7 to the initial data
    const limitedFunctionalities = limitDataToTop7(functionalities);
    const limitedSprintData = limitDataToTop7(sprintData);
    const limitedTeamData = limitDataToTop7(teamData);

    functionalityChart = createHorizontalBarChart('functionalityChart', 'Tests by Functionality', limitedFunctionalities, 'rgba(54, 162, 235, 0.6)');
    sprintChart = createBarChart('sprintChart', 'Tests by Sprint', limitedSprintData, 'rgba(255, 159, 64, 0.6)');
    teamChart = createBarChart('teamChart', 'Tests by Team', limitedTeamData, 'rgba(75, 192, 192, 0.6)');

    $('.select2').on('change', applyFilters);

    document.getElementById('totalTests').textContent = 'Total Tests: ' + data.length;
    updateDashboardStats();
}
    function limitDataToTop7(data) {
    return Object.fromEntries(
        Object.entries(data)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 7)
    );
}

    function createHorizontalBarChart(elementId, title, data, backgroundColor) {
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
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: title,
                        font: { size: 16 },
                        padding: {
                            top: 10,
                            bottom: 30
                        }
                    },
                    legend: {
                        display: false
                    },
                    datalabels: {
                        anchor: 'end',
                        align: 'right',
                        offset: 4,
                        font: { weight: 'bold', size: 12 },
                        formatter: (value) => value,
                        color: 'black'
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: {
                            padding: 5
                        }
                    },
                    y: {
                        ticks: {
                            padding: 5
                        }
                    }
                },
                layout: {
                    padding: {
                        right: 30
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
                        font: { size: 16 },
                        padding: {
                            top: 10,
                            bottom: 30
                        }
                    },
                    legend: {
                        display: false
                    },
                    datalabels: {
                        anchor: 'end',
                        align: 'top',
                        font: { weight: 'bold', size: 12 },
                        formatter: (value) => value
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
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

    function updateDashboardStats() {
        document.getElementById('totalTestsValue').textContent = data.length;
        document.getElementById('totalTeams').textContent = new Set(data.map(row => row['Team Name'] || 'Unspecified')).size;
        document.getElementById('totalFunctionalities').textContent = new Set(data.map(row => row.Functionality || 'Unspecified')).size;
        document.getElementById('totalSprints').textContent = new Set(data.map(row => row.Sprint || 'Unspecified')).size;
    }

    $(document).ready(initCharts);
    </script>
</body>
</html>
`;

// Write HTML file
fs.writeFileSync("test_report.html", htmlContent);
console.log("HTML report generated: test_report.html");
