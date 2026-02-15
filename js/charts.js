const Charts = {
    chart: null,

    init: () => {
        const ctx = document.getElementById('utilizationChart').getContext('2d');

        // Define gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, 400); // Vertical gradient
        gradient.addColorStop(0, 'rgba(249, 166, 108, 0.4)'); // Deep orange at top
        gradient.addColorStop(1, 'rgba(249, 166, 108, 0.0)'); // Transparent at bottom

        Charts.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [], // Time steps (1, 2, 3...)
                datasets: [{
                    label: 'Memory Utilization (%)',
                    data: [],
                    borderColor: '#F9A66C', // Orange
                    backgroundColor: gradient, // Modern gradient fill
                    borderWidth: 3, // Slightly thicker line
                    pointBackgroundColor: '#FFFFFF', // White points
                    pointBorderColor: '#F9A66C',
                    pointBorderWidth: 2,
                    pointRadius: 4, // More visible points
                    pointHoverRadius: 6,
                    fill: true,
                    tension: 0.4, // Smooth curve
                    cubicInterpolationMode: 'monotone'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false // Hide legend for cleaner look, title is enough
                    },
                    tooltip: {
                        backgroundColor: 'rgba(47, 62, 64, 0.9)', // Dark slate tooltip
                        titleColor: '#F9FAF4',
                        bodyColor: '#F9FAF4',
                        titleFont: {
                            family: "'Inter', sans-serif",
                            size: 13,
                        },
                        bodyFont: {
                            family: "'Inter', sans-serif",
                            size: 12,
                        },
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1,
                        padding: 10,
                        displayColors: false, // Don't show color box
                        callbacks: {
                            label: function (context) {
                                return context.parsed.y + '% Utilization';
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: {
                            color: 'rgba(74, 97, 99, 0.1)', // Subtle slate
                            borderDash: [5, 5], // Dashed grid lines
                            drawBorder: false // No axis line
                        },
                        ticks: {
                            color: '#5D7A7D', // Muted slate text
                            font: {
                                family: "'Inter', sans-serif",
                                size: 11
                            },
                            callback: function (value) {
                                return value + '%';
                            },
                            padding: 10
                        },
                        border: {
                            display: false
                        }
                    },
                    x: {
                        grid: {
                            display: false, // No vertical grid
                            drawBorder: false
                        },
                        ticks: {
                            color: '#5D7A7D',
                            font: {
                                family: "'Inter', sans-serif",
                                size: 10
                            },
                            maxRotation: 0,
                            autoSkip: true,
                            maxTicksLimit: 10
                        },
                        border: {
                            display: false
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index',
                },
                animation: {
                    duration: 1000,
                    easing: 'easeOutQuart'
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

        Charts.chart.update(); // Animations handled by config
    },

    reset: () => {
        if (!Charts.chart) return;
        Charts.chart.data.labels = [];
        Charts.chart.data.datasets[0].data = [];
        Charts.stepCounter = 0;
        Charts.chart.update();
    }
};
