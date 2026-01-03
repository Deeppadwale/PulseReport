import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#22c55e', '#eab308'];

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-white p-3 border border-gray-300 rounded-md shadow-lg">
                <p className="font-semibold text-gray-900">{`${data.name}: ${data.value}`}</p>
            </div>
        );
    }
    return null;
};

function SponsorStatusChart({ confirmed, pending }) {
    const data = [
        { name: 'Confirmed', value: confirmed },
        { name: 'Pending', value: pending },
    ];

    if (confirmed === 0 && pending === 0) {
        return (
            <div className="flex items-center justify-center h-full text-gray-500">
                No sponsorship data available.
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={200}>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    style={{ cursor: 'pointer' }}
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                    verticalAlign="bottom"
                    align="center"
                    layout="horizontal"
                    iconType="circle"
                    wrapperStyle={{ paddingTop: '10px' }}
                />
            </PieChart>
        </ResponsiveContainer>
    );
}

export default SponsorStatusChart;