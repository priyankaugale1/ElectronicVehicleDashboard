import React, { useState } from 'react';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { useTable, usePagination, useGlobalFilter } from 'react-table';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, LineElement, PointElement, ArcElement } from 'chart.js';
import { data } from '../Dashboard/Dataset';
import './Dashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  ArcElement
);

// Generate chart data for electric vehicle types
const electricVehicleTypes = data.reduce((acc, row) => {
  const type = row.ElectricVehicleType;
  acc[type] = (acc[type] || 0) + 1;
  return acc;
}, {});

// Generate chart data for vehicle makes distribution
const vehicleMakes = data.reduce((acc, row) => {
  const make = row.Make;
  acc[make] = (acc[make] || 0) + 1;
  return acc;
}, {});

// Generate chart data for electric range over the years
const electricRangeData = data.reduce((acc, row) => {
  const year = row.ModelYear;
  const range = row.ElectricRange;
  acc[year] = acc[year] || [];
  acc[year].push(range);
  return acc;
}, {});

const averageElectricRangePerYear = Object.keys(electricRangeData).map(year => ({
  year,
  avgRange: electricRangeData[year].reduce((sum, value) => sum + value, 0) / electricRangeData[year].length
}));

// Electric Vehicle Types Bar Chart Data
const electricVehicleTypeChartData = {
  labels: Object.keys(electricVehicleTypes),
  datasets: [
    {
      label: 'Electric Vehicle Types',
      data: Object.values(electricVehicleTypes),
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1
    }
  ]
};

// Vehicle Makes Pie Chart Data
const vehicleMakesChartData = {
  labels: Object.keys(vehicleMakes),
  datasets: [
    {
      label: 'Vehicle Makes',
      data: Object.values(vehicleMakes),
      backgroundColor: [
        'rgba(255, 99, 132, 0.6)',
        'rgba(54, 162, 235, 0.6)',
        'rgba(255, 206, 86, 0.6)',
        'rgba(75, 192, 192, 0.6)',
        'rgba(153, 102, 255, 0.6)',
        'rgba(255, 159, 64, 0.6)'
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)'
      ],
      borderWidth: 1
    }
  ]
};

// Electric Range Line Chart Data
const electricRangeLineChartData = {
  labels: averageElectricRangePerYear.map(item => item.year),
  datasets: [
    {
      label: 'Average Electric Range (miles)',
      data: averageElectricRangePerYear.map(item => item.avgRange),
      fill: false,
      borderColor: 'rgba(75, 192, 192, 1)',
      tension: 0.1
    }
  ]
};

const columns = [
  { Header: 'VIN', accessor: 'VIN' },
  { Header: 'County', accessor: 'County' },
  { Header: 'City', accessor: 'City' },
  { Header: 'State', accessor: 'State' },
  { Header: 'Postal Code', accessor: 'PostalCode' },
  { Header: 'Model Year', accessor: 'ModelYear' },
  { Header: 'Make', accessor: 'Make' },
  { Header: 'Model', accessor: 'Model' },
  { Header: 'Electric Vehicle Type', accessor: 'ElectricVehicleType' },
  { Header: 'Electric Range', accessor: 'ElectricRange' }
];

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    page,
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    pageOptions,
    state: { pageIndex },
    setGlobalFilter
  } = useTable(
    {
      columns,
      data,
      initialState: { pageSize: 5 },
      globalFilter: searchQuery
    },
    useGlobalFilter,
    usePagination
  );

  // Handle search input change
  const handleSearchChange = event => {
    setSearchQuery(event.target.value);
    setGlobalFilter(event.target.value);
  };

  return (
    <div className="dashboard-container">
      <h1 className="main-title">Electric Vehicle Dashboard(Key Insights)</h1>

      <section className="insights-section">
        <div className="content-wrapper">
          <div className="card">
            <h3 className="card-title">Vehicle Data</h3>
            <div className="search-wrapper">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search vehicles..."
                className="search-input"
              />
            </div>

            <table {...getTableProps()} className="data-table">
              <thead>
                {headerGroups.map(headerGroup => (
                  <tr {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map(column => (
                      <th {...column.getHeaderProps()}>{column.render('Header')}</th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody {...getTableBodyProps()}>
                {page.map(row => {
                  prepareRow(row);
                  return (
                    <tr {...row.getRowProps()}>
                      {row.cells.map(cell => (
                        <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="pagination">
              <span className="arrow" onClick={() => previousPage()} disabled={!canPreviousPage}>
                &#x276E;
              </span>
              <span className="page-info">
                Page <strong>{pageIndex + 1}</strong> of <strong>{pageOptions.length}</strong>
              </span>
              <span className="arrow" onClick={() => nextPage()} disabled={!canNextPage}>
                &#x276F;
              </span>
            </div>
          </div>

          <div className="charts-container">
            <div className="card chart-card">
              <h3 className="card-title">Electric Vehicle Types Distribution</h3>
              <Bar
                data={electricVehicleTypeChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    title: { display: true, text: 'Electric Vehicle Types Distribution' }
                  }
                }}
              />
            </div>

            <div className="card chart-card">
              <h3 className="card-title">Vehicle Makes Distribution</h3>
              <Pie
                data={vehicleMakesChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    title: { display: true, text: 'Vehicle Makes Distribution' }
                  }
                }}
              />
            </div>

            <div className="card chart-card">
              <h3 className="card-title">Average Electric Range Over Years</h3>
              <Line
                data={electricRangeLineChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    title: { display: true, text: 'Average Electric Range Over Years' }
                  }
                }}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
