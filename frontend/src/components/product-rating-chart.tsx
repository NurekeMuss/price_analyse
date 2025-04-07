"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { useTheme } from "next-themes"

export default function ProductRatingChart() {
  const { theme } = useTheme()

  // Generate sample data - 6 months of ratings
  const data = [
    { month: "Jan", rating: 4.2 },
    { month: "Feb", rating: 4.3 },
    { month: "Mar", rating: 4.1 },
    { month: "Apr", rating: 4.5 },
    { month: "May", rating: 4.7 },
    { month: "Jun", rating: 4.6 },
  ]

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis domain={[3.5, 5]} />
        <Tooltip
          formatter={(value: number) => [value.toFixed(1), "Rating"]}
          labelFormatter={(label) => `Month: ${label}`}
        />
        <Legend />
        <Bar dataKey="rating" name="Rating" fill="#0ea5e9" />
      </BarChart>
    </ResponsiveContainer>
  )
}

