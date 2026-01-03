import React, { useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    Cell, Legend
} from 'recharts';
import { ChevronDown, ChevronUp, DollarSign, Award, TrendingUp, Filter, BarChart3 } from 'lucide-react';

const CustomSponsorTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-xl">
                <p className="font-bold text-gray-900 mb-2">{`${label}`}</p>
                <div className="flex items-center mb-1">
                    <div className="w-3 h-3 rounded-full bg-indigo-600 mr-2"></div>
                    <p className="text-sm text-gray-700">{`Amount: ₹${data.amount.toLocaleString()}`}</p>
                </div>
                <div className="border-t border-gray-200 mt-2 pt-2">
                    <p className="text-sm font-semibold text-gray-800">
                        Status: <span className={data.status === 'Confirmed' ? 'text-green-600' : 'text-amber-600'}>
                            {data.status}
                        </span>
                    </p>
                </div>
            </div>
        );
    }
    return null;
};

const CustomLegend = ({ payload }) => {
    return (
        <div className="flex justify-center items-center space-x-4 mt-4">
            {payload.map((entry, index) => (
                <div key={`item-${index}`} className="flex items-center">
                    <div
                        className="w-4 h-4 rounded mr-2"
                        style={{ backgroundColor: entry.color }}
                    ></div>
                    <span className="text-sm text-gray-700">{entry.value}</span>
                </div>
            ))}
        </div>
    );
};

function TopSponsorsChart({ data }) {
    const [sortBy, setSortBy] = useState('amount');
    const [sortOrder, setSortOrder] = useState('desc');
    const [activeBar, setActiveBar] = useState(null);
    const [viewMode, setViewMode] = useState('chart');

    const processChartData = () => {
        if (!data || data.length === 0) return [];

        let chartData = [...data];

        chartData.sort((a, b) => {
            if (sortBy === 'name') {
                if (sortOrder === 'asc') {
                    return a.name.localeCompare(b.name);
                } else {
                    return b.name.localeCompare(a.name);
                }
            } else {
                if (sortOrder === 'asc') {
                    return a.amount - b.amount;
                } else {
                    return b.amount - a.amount;
                }
            }
        });

        return chartData.slice(0, 5);
    };

    const chartData = processChartData();

    const handleBarClick = (data, index, event) => {
        setActiveBar(activeBar === index ? null : index);
    };

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('desc');
        }
    };

    if (!data || data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-80 text-gray-500 bg-gray-50 rounded-lg p-6">
                <Award className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg">No sponsorship data available.</p>
                <p className="text-sm mt-2">Add sponsors to see data here.</p>
            </div>
        );
    }

    const barColors = ['#4f46e5', '#6366f1', '#818cf8', '#93c5fd', '#bfdbfe'];

    const totalAmount = chartData.reduce((sum, item) => sum + item.amount, 0);
    const topSponsor = chartData.length > 0 ? chartData[0].name : 'N/A';
    const confirmedSponsors = chartData.filter(item => item.status === 'Confirmed').length;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-indigo-600" />
                    Top 5 Sponsors
                </h2>

                <div className="flex items-center space-x-4 mt-2 md:mt-0">
                    <div className="flex items-center">
                        <span className="text-sm text-gray-600 mr-2">View:</span>
                        <div className="flex bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('chart')}
                                className={`px-3 py-1 text-sm rounded-md transition-colors ${viewMode === 'chart' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-600'}`}
                            >
                                <BarChart3 className="h-4 w-4 inline mr-1" />
                                Chart
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`px-3 py-1 text-sm rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-600'}`}
                            >
                                <Filter className="h-4 w-4 inline mr-1" />
                                List
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Sort by:</span>
                        <div className="flex bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => handleSort('amount')}
                                className={`px-3 py-1 text-sm rounded-md transition-colors ${sortBy === 'amount' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-600'}`}
                            >
                                Amount
                            </button>
                        </div>
                        <button
                            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                            className="p-2 bg-gray-100 rounded-lg text-gray-600 hover:bg-gray-200 transition-colors"
                        >
                            {sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-6">


                <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                    <div className="flex items-center">
                        <TrendingUp className="h-5 w-5 text-amber-600 mr-2" />
                        <span className="text-sm font-medium text-amber-800">Top Sponsor</span>
                    </div>
                    <p className="text-2xl font-bold text-amber-900 mt-2 truncate" title={topSponsor}>
                        {topSponsor}
                    </p>
                </div>
            </div>

            {viewMode === 'chart' ? (
                <div className="h-80 ml-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={chartData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                            barGap={8}
                            barCategoryGap="20%"
                            style={{ cursor: 'pointer' }}
                        >
                            <CartesianGrid strokeDasharray="3" vertical={false} stroke="#e5e7eb" />
                            <XAxis
                                dataKey="name"
                                angle={-45}
                                textAnchor="end"
                                height={60}
                                tick={{ fontSize: 9 }}
                                interval={0}
                            />

                            <Tooltip content={<CustomSponsorTooltip />} />
                            <Legend content={<CustomLegend />} />
                            <YAxis
                                tickFormatter={(value) => {
                                    if (value >= 1000000) {
                                        return `₹${(value / 1000000).toFixed(1)}M`;
                                    } else if (value >= 1000) {
                                        return `₹${(value / 1000).toFixed(0)}K`;
                                    }
                                    return `₹${value}`;
                                }}
                                width={50}
                                tick={{ fontSize: 10 }}
                            />
                            <Bar
                                dataKey="amount"
                                name="Sponsorship Amount"
                                onClick={handleBarClick}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={barColors[index % barColors.length]}
                                        stroke={activeBar === index ? "#000" : "#fff"}
                                        strokeWidth={activeBar === index ? 2 : 0}
                                        opacity={activeBar === null || activeBar === index ? 1 : 0.7}
                                        radius={[4, 4, 0, 0]}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Sponsor Name
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Amount
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {chartData.map((sponsor, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {sponsor.name}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                        ₹{sponsor.amount.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

        </div>
    );
}

export default TopSponsorsChart;