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

const BASE_URL = "https://anaweza-backend.up.railway.app";

function AdminHome() {
  const navigate = useNavigate();

  // State Management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [populations, setPopulations] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [accessibilities, setAccessibilities] = useState([]);

  // State for data forms
  const [accessibilityData, setAccessibilityData] = useState({
    health_facility_id: "",
    people_served: "",
    avg_travel_time: "",
    distance_to_nearest_facility: "",
  });

  const [populationData, setPopulationData] = useState({
    district: "",
    sector: "",
    total_population: "",
    male_population: "",
    female_population: "",
    children_under_5: "",
    youth_population: "",
    adult_population: "",
    elderly_population: "",
    population_density: "",
    socioeconomic_status: "LOW",
    unemployment_rate: "",
    literacy_rate: "",
  });

  const [allocationData, setAllocationData] = useState({
    health_facility_id: "",
    description: "",
    personnel_count: "",
    duration_in_days: "",
  });

  // Chart Data State
  const [chartData, setChartData] = useState({
    histogram: { labels: [], datasets: [] },
    doughnut: { labels: [], datasets: [] },
  });

  // Fetch Functions
  const fetchAllocations = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/users/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAllocations(data);
      } else {
        setError("Failed to fetch resource allocations");
      }
    } catch (err) {
      setError("Error fetching resource allocations");
    } finally {
      setLoading(false);
    }
  };


  // Chart Configuration
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom" },
      tooltip: { enabled: true },
    },
  };

  const lineChartOptions = {
    ...chartOptions,
    scales: {
      y: { beginAtZero: true },
      x: { grid: { display: false } },
    },
  };

  const areaChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        stacked: true,
      },
      x: { grid: { display: false } },
    },
    plugins: {
      filler: { propagate: true },
    },
  };

  const doughnutOptions = {
    ...chartOptions,
    cutout: "70%",
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.label}: ${context.raw} users`;
          },
        },
      },
    },
  };

  // Modified Data Preparation Function
  const processDashboardChartData = (userData) => {
    if (!userData.length) return;

    // User Registration Trends
    const userDates = [...new Set(userData.map(user => 
      new Date(user.created_at).toISOString().split('T')[0]
    ))].sort();

    const lastUserDays = userDates.slice(-5);
    const roles = ['admin', 'analyst', 'data_entry_clerk'];

    const usersByRole = roles.reduce((acc, role) => {
      acc[role] = lastUserDays.map(date => 
        userData.filter(user => 
          user.role === role && 
          new Date(user.created_at).toISOString().split('T')[0] === date
        ).length
      );
      return acc;
    }, {});

    const roleCounts = userData.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});

    const displayUserDates = lastUserDays.map(date => {
      const displayDate = new Date(date);
      return displayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    return {
      histogram: {
        labels: displayUserDates,
        datasets: roles.map((role, index) => ({
          label: role.charAt(0).toUpperCase() + role.slice(1),
          data: usersByRole[role],
          backgroundColor: COLORS[index],
          borderColor: COLORS[index],
          borderWidth: 1,
        })),
      },
      doughnut: {
        labels: roles.map(role => role.charAt(0).toUpperCase() + role.slice(1)),
        datasets: [{
          data: roles.map(role => roleCounts[role] || 0),
          backgroundColor: COLORS.slice(0, roles.length),
          borderColor: COLORS.slice(0, roles.length),
          borderWidth: 1,
        }],
      },
    };
  };

  // Prepare Data for Various Charts
  const prepareFacilityTypeLineData = () => {
    const typeCounts = facilities.reduce((acc, facility) => {
      acc[facility.facility_type] = (acc[facility.facility_type] || 0) + 1;
      return acc;
    }, {});

    return {
      labels: Object.keys(typeCounts),
      datasets: [
        {
          label: "Facility Types",
          data: Object.values(typeCounts),
          borderColor: COLORS[0],
          backgroundColor: COLORS[0] + "80",
        },
      ],
    };
  };

  const prepareFacilityStatusAreaData = () => {
    const statusCounts = facilities.reduce((acc, facility) => {
      acc[facility.status] = (acc[facility.status] || 0) + 1;
      return acc;
    }, {});

    return {
      labels: Object.keys(statusCounts),
      datasets: [
        {
          label: "Facility Status",
          data: Object.values(statusCounts),
          backgroundColor: COLORS[1] + "80",
          borderColor: COLORS[1],
        },
      ],
    };
  };

  const preparePopulationAgeColumnData = () => {
    const ageGroups = populations.reduce(
      (acc, pop) => ({
        children: acc.children + parseInt(pop.children_under_5),
        youth: acc.youth + parseInt(pop.youth_population),
        adults: acc.adults + parseInt(pop.adult_population),
        elderly: acc.elderly + parseInt(pop.elderly_population),
      }),
      { children: 0, youth: 0, adults: 0, elderly: 0 }
    );

    return {
      labels: ["Children (0-5)", "Youth", "Adults", "Elderly"],
      datasets: [
        {
          label: "Population Age Distribution",
          data: [
            ageGroups.children,
            ageGroups.youth,
            ageGroups.adults,
            ageGroups.elderly,
          ],
          backgroundColor: COLORS.slice(0, 4),
        },
      ],
    };
  };

  const userDistributionGaugeData = () => {
    const roleCounts = ["admin", "analyst", "data_entry_clerk"].map(
      (role) => userData.filter((user) => user.role === role).length
    );

    return {
      labels: ["Admin", "Analyst", "Data Entry Clerk"],
      datasets: [{ data: roleCounts }],
    };
  };

  // Resource Allocation Data
  const resourceAllocationData = () => {
    const durationDistribution = [
      {
        name: "0-15 Days",
        value: allocations.filter((a) => a.duration_in_days <= 15).length,
      },
      {
        name: "16-30 Days",
        value: allocations.filter(
          (a) => a.duration_in_days > 15 && a.duration_in_days <= 30
        ).length,
      },
      {
        name: "31-60 Days",
        value: allocations.filter(
          (a) => a.duration_in_days > 30 && a.duration_in_days <= 60
        ).length,
      },
      {
        name: "60+ Days",
        value: allocations.filter((a) => a.duration_in_days > 60).length,
      },
    ];

    return {
      labels: durationDistribution.map((item) => item.name),
      datasets: [
        {
          data: durationDistribution.map((item) => item.value),
          backgroundColor: COLORS,
        },
      ],
    };
  };

  // Summary Card Component
  const SummaryCard = ({ title, value, icon: Icon, bgColor }) => (
    <div className={`${bgColor} rounded-lg shadow-lg p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white text-sm">{title}</p>
          <h3 className="text-white text-2xl font-bold">{value}</h3>
        </div>
        <Icon className="h-12 w-12 text-white opacity-75" />
      </div>
    </div>
  );

  // Chart Section Component
  const ChartSection = ({ title, total, children }) => (
    <div className="bg-white p-6 rounded-lg shadow-md h-64">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-black">{title}</h3>
        <span className="text-sm text-gray-600">Total: {total}</span>
      </div>
      <div className="h-48">{children}</div>
    </div>
  );

 // Updated useEffect
 useEffect(() => {
  const fetchAllData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const usersRes = await fetch(`${BASE_URL}/users/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const usersData = await usersRes.json();
      const users = usersData.users || [];
      setUserData(users);
      
      // Process chart data after setting user data
      const chartDataResult = processDashboardChartData(users);
      if (chartDataResult) {
        setChartData(chartDataResult);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.message);
    }

    // Fetch other data
    await Promise.all([
      fetchAllocations(),

    ]);
  };

  fetchAllData();
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


  // Modified Facility Type Chart (now Area Chart)
  const prepareFacilityTypeAreaData = () => {
    const typeCounts = facilities.reduce((acc, facility) => {
      acc[facility.facility_type] = (acc[facility.facility_type] || 0) + 1;
      return acc;
    }, {});

    return {
      labels: Object.keys(typeCounts),
      datasets: [{
        label: 'Facility Types',
        data: Object.values(typeCounts),
        fill: true,
        borderColor: COLORS[0],
        backgroundColor: `${COLORS[0]}40`,
        tension: 0.4
      }]
    };
  };



  
  const prepareIncidentStatusData = () => {
    const statusCounts = incidents.reduce((acc, incident) => {
      acc[incident.status] = (acc[incident.status] || 0) + 1;
      return acc;
    }, {});
  
    return {
      labels: Object.keys(statusCounts),
      datasets: [
        {
          label: "Incident Status Distribution",
          data: Object.values(statusCounts),
          backgroundColor: COLORS.slice(0, Object.keys(statusCounts).length),
        },
      ],
    };
  };
  

 // Modified incident trend data preparation
 const prepareIncidentTrendData = () => {
  // Define status colors
  const statusColors = {
    'ACTIVE': '#FF8042',
    'RESOLVED': '#00C49F',
    'UNDER_INVESTIGATION': '#FFBB28',
    'CONTAINED': '#0088FE'
  };

  // Group incidents by date and status
  const incidentsByDateAndStatus = incidents.reduce((acc, incident) => {
    const date = new Date(incident.created_at).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = {
        'ACTIVE': 0,
        'RESOLVED': 0,
        'UNDER_INVESTIGATION': 0,
        'CONTAINED': 0
      };
    }
    acc[date][incident.status]++;
    return acc;
  }, {});

  // Sort dates
  const sortedDates = Object.keys(incidentsByDateAndStatus).sort((a, b) => 
    new Date(a) - new Date(b)
  );

  // Create datasets for each status
  const datasets = Object.keys(statusColors).map(status => ({
    label: status.replace(/_/g, ' '),
    data: sortedDates.map(date => incidentsByDateAndStatus[date][status]),
    fill: true,
    backgroundColor: `${statusColors[status]}80`,
    borderColor: statusColors[status],
    tension: 0.4
  }));

  return {
    labels: sortedDates,
    datasets: datasets
  };
};

// Modified area chart options for stacked view
const stackedAreaOptions = {
  ...chartOptions,
  scales: {
    x: {
      grid: { display: false }
    },
    y: {
      stacked: true,
      beginAtZero: true
    }
  },
  plugins: {
    ...chartOptions.plugins,
    tooltip: {
      mode: 'index',
      intersect: false
    }
  },
  interaction: {
    mode: 'nearest',
    axis: 'x',
    intersect: false
  }
};



  // Add horizontal bar chart options
  const horizontalBarOptions = {
    ...chartOptions,
    indexAxis: 'y',
    scales: {
      x: {
        beginAtZero: true,
      },
      y: {
        grid: { display: false }
      }
    }
  };


  return (
    <div className=" ml-4 p-6 space-y-6 justify-center">
      <h1 className="text-blue-950 font-extrabold text-center text-4xl mb-8">
        Healthcare Analytics Dashboard
      </h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard
          title="Total Users"
          value={userData.length}
          icon={Users}
          bgColor="bg-gradient-to-r from-blue-500 to-blue-600"
        />
        <SummaryCard
          title="Total Facilities"
          value={facilities.length}
          icon={Building2}
          bgColor="bg-gradient-to-r from-green-500 to-green-600"
        />
        <SummaryCard
          title="Total Incidents"
          value={incidents.length}
          icon={Activity}
          bgColor="bg-gradient-to-r from-red-500 to-red-600"
        />
        <SummaryCard
          title="Resource Allocations"
          value={allocations.length}
          icon={PieChart}
          bgColor="bg-gradient-to-r from-purple-500 to-purple-600"
        />
      </div>

      {/* Analytics Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {/* User Registration Trends */}
        <ChartSection title="User Registration Trends" total={userData.length}>
          <Bar data={chartData.histogram} options={chartOptions} />
        </ChartSection>

        {/* Update the User Distribution to use a sliced Pie chart */}
    <ChartSection title="User Distribution" total={userData.length}>
      <Pie 
        data={chartData.doughnut} 
        options={{
          ...chartOptions,
          plugins: {
            ...chartOptions.plugins,
            legend: {
              position: 'bottom'
            }
          },
          rotation: -90,
          circumference: 360,
        }} 
      />
    </ChartSection>

    {/* Updated Incident Trend Over Time */}
           <ChartSection 
              title="Incident Trends by Status" 
              total={incidents.length}
            >
              <Line
                data={prepareIncidentTrendData()}
                options={stackedAreaOptions}
              />
            </ChartSection>
    
            {/* Incident Status Distribution */}
            <ChartSection 
              title="Incidents by Status" 
              total={incidents.length}
            >
              <Bar
                data={prepareIncidentStatusData()}
                options={horizontalBarOptions}
              />
            </ChartSection>

        {/* Facility Types */}
        {/* Replace the Line chart with Area chart */}
    <ChartSection title="Facility Types" total={facilities.length}>
      <Line
        data={prepareFacilityTypeAreaData()}
        options={{
          ...lineChartOptions,
          plugins: {
            ...lineChartOptions.plugins,
            filler: {
              propagate: true
            }
          }
        }}
      />
    </ChartSection>

        {/* Facility Status */}
        <ChartSection title="Facility Status" total={facilities.length}>
          <Line
            data={prepareFacilityStatusAreaData()}
            options={areaChartOptions}
            type="area"
          />
        </ChartSection>

        {/* Population Age Distribution */}
        <ChartSection
          title="Population Age Groups"
          total={populations.reduce(
            (sum, pop) => sum + pop.total_population,
            0
          )}
        >
          <Bar data={preparePopulationAgeColumnData()} options={chartOptions} />
        </ChartSection>

        {/* Resource Allocation Distribution */}
        <ChartSection
          title="Resource Allocation Durations"
          total={allocations.length}
        >
          <Pie data={resourceAllocationData()} options={doughnutOptions} />
        </ChartSection>
      </div>
    </div>
  );
}
export default AdminHome;
