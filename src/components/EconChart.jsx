import { useEffect, useRef } from 'react'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Filler,
    Legend,
} from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'
import { ALL_CHART_LABELS, ALL_INFLATION, ALL_GDP, ALL_EXPORT } from '../data/economicData'

ChartJS.register(
    CategoryScale, LinearScale, PointElement, LineElement,
    BarElement, Title, Tooltip, Filler, Legend
)

const BASE_OPTS = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 600 },
    plugins: {
        legend: { display: false },
        tooltip: {
            backgroundColor: 'rgba(0,15,30,0.9)',
            borderColor: '#00f5ff',
            borderWidth: 1,
            titleColor: '#00f5ff',
            bodyColor: '#cceeff',
            titleFont: { family: 'Roboto Mono', size: 10 },
            bodyFont: { family: 'Roboto Mono', size: 10 },
        },
    },
    scales: {
        x: {
            ticks: { color: '#446688', font: { family: 'Roboto Mono', size: 9 } },
            grid: { color: 'rgba(0,100,150,0.1)' },
        },
        y: {
            ticks: { color: '#446688', font: { family: 'Roboto Mono', size: 9 } },
            grid: { color: 'rgba(0,100,150,0.1)' },
        },
    },
}

export function InflationChart({ year }) {
    const yearIndex = ALL_CHART_LABELS.findIndex((y) => Number(y) >= year)
    const slice = yearIndex === -1 ? ALL_CHART_LABELS.length : Math.max(1, yearIndex + 1)

    const data = {
        labels: ALL_CHART_LABELS.slice(0, slice),
        datasets: [
            {
                data: ALL_INFLATION.slice(0, slice),
                fill: true,
                tension: 0.5,
                borderColor: '#ff4444',
                backgroundColor: 'rgba(255,40,40,0.12)',
                pointBackgroundColor: ALL_INFLATION.slice(0, slice).map((v) =>
                    v > 100 ? '#ff2200' : v > 10 ? '#ff8800' : '#00ff88'
                ),
                pointRadius: 4,
                pointHoverRadius: 6,
            },
        ],
    }

    return (
        <Line
            data={data}
            options={{
                ...BASE_OPTS,
                scales: {
                    ...BASE_OPTS.scales,
                    y: {
                        ...BASE_OPTS.scales.y,
                        title: { display: true, text: '% / năm', color: '#446688', font: { size: 9, family: 'Roboto Mono' } },
                    },
                },
            }}
        />
    )
}

export function GDPChart({ year }) {
    const yearIndex = ALL_CHART_LABELS.findIndex((y) => Number(y) >= year)
    const slice = yearIndex === -1 ? ALL_CHART_LABELS.length : Math.max(1, yearIndex + 1)

    const data = {
        labels: ALL_CHART_LABELS.slice(0, slice),
        datasets: [
            {
                data: ALL_GDP.slice(0, slice),
                backgroundColor: ALL_GDP.slice(0, slice).map((v) =>
                    v < 0 ? 'rgba(255,40,40,0.6)' : 'rgba(0,245,255,0.4)'
                ),
                borderColor: ALL_GDP.slice(0, slice).map((v) =>
                    v < 0 ? '#ff4444' : '#00f5ff'
                ),
                borderWidth: 1.5,
                borderRadius: 4,
            },
        ],
    }

    return (
        <Bar
            data={data}
            options={{
                ...BASE_OPTS,
                scales: {
                    ...BASE_OPTS.scales,
                    y: {
                        ...BASE_OPTS.scales.y,
                        title: { display: true, text: '% tăng trưởng', color: '#446688', font: { size: 9, family: 'Roboto Mono' } },
                    },
                },
            }}
        />
    )
}

export function ExportChart({ year }) {
    const yearIndex = ALL_CHART_LABELS.findIndex((y) => Number(y) >= year)
    const slice = yearIndex === -1 ? ALL_CHART_LABELS.length : Math.max(1, yearIndex + 1)

    const data = {
        labels: ALL_CHART_LABELS.slice(0, slice),
        datasets: [
            {
                data: ALL_EXPORT.slice(0, slice),
                fill: true,
                tension: 0.4,
                borderColor: '#00ff88',
                backgroundColor: 'rgba(0,255,136,0.1)',
                pointBackgroundColor: '#00ff88',
                pointRadius: 4,
            },
        ],
    }

    return (
        <Line
            data={data}
            options={{
                ...BASE_OPTS,
                scales: {
                    ...BASE_OPTS.scales,
                    y: {
                        ...BASE_OPTS.scales.y,
                        title: { display: true, text: 'Tỉ USD', color: '#446688', font: { size: 9, family: 'Roboto Mono' } },
                    },
                },
            }}
        />
    )
}
