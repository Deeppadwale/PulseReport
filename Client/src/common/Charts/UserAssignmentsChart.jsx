import React, { useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, Cell
} from 'recharts';
import { ChevronDown, ChevronUp, Filter, Users, CheckCircle, Clock } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-xl">
                <p className="font-bold text-gray-900 mb-2">{`${label}`}</p>
                <div className="flex items-center mb-1">
                    <div className="w-3 h-3 rounded-full bg-green-600 mr-2"></div>
                    <p className="text-sm text-gray-700">{`Confirmed: ${payload[0].value}`}</p>
                </div>
                <div className="flex items-center mb-1">
                    <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
                    <p className="text-sm text-gray-700">{`Pending: ${payload[1].value}`}</p>
                </div>
                <div className="border-t border-gray-200 mt-2 pt-2">
                    <p className="text-sm font-semibold text-gray-800">{`Total Assigned: ${payload[0].value + payload[1].value}`}</p>
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

function UserAssignmentsChart({ data }) {
    const [sortBy, setSortBy] = useState('total');
    const [sortOrder, setSortOrder] = useState('desc');
    const [activeBar, setActiveBar] = useState(null);

    // Process data for chart
    const processChartData = () => {
        let chartData = Object.keys(data).map(userId => ({
            id: userId,
            name: data[userId].userName,
            confirmed: data[userId].confirmed,
            pending: data[userId].pending,
            total: data[userId].confirmed + data[userId].pending,
        }));

        // Sort data
        chartData.sort((a, b) => {
            if (sortOrder === 'asc') {
                return a[sortBy] - b[sortBy];
            } else {
                return b[sortBy] - a[sortBy];
            }
        });

        return chartData;
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

    if (chartData.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-80 text-gray-500 bg-gray-50 rounded-lg p-6">
                <Users className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg">No user assignment data available.</p>
                <p className="text-sm mt-2">Assign sponsors to users to see data here.</p>
            </div>
        );
    }

    // Color gradients for bars
    const confirmedColors = ['#166534', '#22c55e', '#4ade80', '#86efac'];
    const pendingColors = ['#ea580c', '#f97316', '#fdba74', '#fed7aa'];

    return (
        <>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                    <Users className="h-5 w-5 mr-2 text-blue-600" />
                    User Assignments Overview
                </h2>

                <div className="flex items-center space-x-2 mt-2 md:mt-0">
                    <span className="text-sm text-gray-600">Sort by:</span>
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => handleSort('total')}
                            className={`px-3 py-1 text-sm rounded-md transition-colors ${sortBy === 'total' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600'}`}
                        >
                            Total
                        </button>
                        <button
                            onClick={() => handleSort('confirmed')}
                            className={`px-3 py-1 text-sm rounded-md transition-colors ${sortBy === 'confirmed' ? 'bg-white shadow-sm text-green-600' : 'text-gray-600'}`}
                        >
                            Confirmed
                        </button>
                        <button
                            onClick={() => handleSort('pending')}
                            className={`px-3 py-1 text-sm rounded-md transition-colors ${sortBy === 'pending' ? 'bg-white shadow-sm text-amber-600' : 'text-gray-600'}`}
                        >
                            Pending
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                    <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                        <span className="text-sm font-medium text-green-800">Total Confirmed</span>
                    </div>
                    <p className="text-2xl font-bold text-green-900 mt-2">
                        {chartData.reduce((sum, item) => sum + item.confirmed, 0)}
                    </p>
                </div>

                <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                    <div className="flex items-center">
                        <Clock className="h-5 w-5 text-amber-600 mr-2" />
                        <span className="text-sm font-medium text-amber-800">Total Pending</span>
                    </div>
                    <p className="text-2xl font-bold text-amber-900 mt-2">
                        {chartData.reduce((sum, item) => sum + item.pending, 0)}
                    </p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <div className="flex items-center">
                        <Users className="h-5 w-5 text-blue-600 mr-2" />
                        <span className="text-sm font-medium text-blue-800">Total Assignments</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-900 mt-2">
                        {chartData.reduce((sum, item) => sum + item.total, 0)}
                    </p>
                </div>
            </div>

            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 60,
                        }}
                        barGap={0}
                        barCategoryGap="15%"
                         style={{ cursor: 'pointer' }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis
                            dataKey="name"
                            angle={-45}
                            textAnchor="end"
                            height={60}
                            tick={{ fontSize: 12 }}
                            interval={0}
                        />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend content={<CustomLegend />} />
                        <Bar
                            dataKey="confirmed"
                            name="Confirmed Sponsors"
                            stackId="a"
                            onClick={handleBarClick}
                        >
                            {chartData.map((entry, index) => (
                                <Cell
                                    key={`confirmed-${index}`}
                                    fill={confirmedColors[index % confirmedColors.length]}
                                    stroke={activeBar === index ? "#000" : "#fff"}
                                    strokeWidth={activeBar === index ? 2 : 0}
                                    opacity={activeBar === null || activeBar === index ? 1 : 0.7}
                                />
                            ))}
                        </Bar>
                        <Bar
                            dataKey="pending"
                            name="Pending Sponsors"
                            stackId="a"
                            onClick={handleBarClick}
                        >
                            {chartData.map((entry, index) => (
                                <Cell
                                    key={`pending-${index}`}
                                    fill={pendingColors[index % pendingColors.length]}
                                    stroke={activeBar === index ? "#000" : "#fff"}
                                    strokeWidth={activeBar === index ? 2 : 0}
                                    opacity={activeBar === null || activeBar === index ? 1 : 0.7}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </>
    );
}

export default UserAssignmentsChart;