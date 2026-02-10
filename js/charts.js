const Charts = {
    chart: null,

    init: () => {
        const ctx = document.getElementById('utilizationChart').getContext('2d');

        Charts.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [], // Time steps (1, 2, 3...)
                datasets: [{
                    label: 'Memory Utilization (%)',
                    data: [],
                    borderColor: '#F9A66C', // Orange
                    backgroundColor: 'rgba(249, 166, 108, 0.2)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: {
                            color: 'rgba(74, 97, 99, 0.1)' // Slate
                        },
                        ticks: {
                            color: '#4A6163'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#4A6163'
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: '#4A6163'
                        }
                    }
                }
            }
        });

        Charts.stepCounter = 0;
    },

    update: (utilization) => {
        if (!Charts.chart) return;

        Charts.stepCounter++;
        const label = `Step ${Charts.stepCounter}`;

        // Add new data
        Charts.chart.data.labels.push(label);
        Charts.chart.data.datasets[0].data.push(utilization);

        // Keep only last 20 points
        if (Charts.chart.data.labels.length > 20) {
            Charts.chart.data.labels.shift();
            Charts.chart.data.datasets[0].data.shift();
        }

        Charts.chart.update();
    },

    reset: () => {
        if (!Charts.chart) return;
        Charts.chart.data.labels = [];
        Charts.chart.data.datasets[0].data = [];
        Charts.stepCounter = 0;
        Charts.chart.update();
    }
};
