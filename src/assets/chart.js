const ctx = document.getElementById('myChart');
const ctx2 = document.getElementById('myChart2');

const data = {
    labels: [
      'Red',
      'Blue',
      'Yellow'
    ],
    datasets: [{
      label: 'My First Dataset',
      data: [300, 50, 100],
      backgroundColor: [
        'rgb(255, 99, 132)',
        'rgb(54, 162, 235)',
        'rgb(255, 205, 86)'
      ],
      hoverOffset: 4
    }]
  };

new Chart(ctx, {
    type: 'doughnut',
    data: data,
});

new Chart(ctx2, {
    type: 'doughnut',
    data: data,
});