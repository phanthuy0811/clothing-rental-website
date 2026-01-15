document.addEventListener("DOMContentLoaded", function () {
    const ctx = document.getElementById("revenueChart").getContext("2d");
    new Chart(ctx, {
        type: "line",
        data: {
            labels: ["Tháng 1", "Tháng 2", "Tháng 3"],
            datasets: [{
                label: "Doanh thu",
                data: [50000000, 70000000, 90000000],
                backgroundColor: "rgba(41, 128, 185, 0.2)",
                borderColor: "rgba(41, 128, 185, 1)",
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, // Giữ kích thước biểu đồ
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    onClick: null // Vô hiệu hóa toggle khi bấm vào legend
                }
            }
        }
    });
});
