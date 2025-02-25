/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Activity, Building2, PieChart } from "lucide-react";

import {
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,

} from "chart.js";
import { Chart as ChartJS, registerables } from 'chart.js';

import { Bar, Doughnut, Line, Pie } from "react-chartjs-2";
import GaugeChart from "react-gauge-chart";

ChartJS.register(
  ...registerables,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
];

const BASE_URL = "http://127.0.0.1:8000";

function Job_seeker_home() {
  const navigate = useNavigate();

  // State Management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);



 


 // Updated useEffect
 useEffect(() => {


}, [navigate]);



  if (loading) {
    return (
      <div className="mt-20 p-6 flex items-center justify-center">
        <div className="text-lg font-semibold text-gray-600">
          Loading dashboard data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-20 p-6 flex items-center justify-center">
        <div className="text-lg font-semibold text-red-600">Error: {error}</div>
      </div>
    );
  }



  



  return (
    <div className=" ml-4 p-6 space-y-6 justify-center">



    </div>
  );
}
export default Job_seeker_home;
