'use client';
import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const data = {
  labels: ['Princípios de Programação', 'Proteção de Dados com Java', 'Segurança da Informação com Java'],
  values: [43351, 37756, 33987],
};

const BarChart = () => {
  
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: 'Downloads',
        data: data.values,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'eBook Downloads',
      },
    },
  };

  return <Bar data={chartData} options={options} />;
};

export default BarChart;
