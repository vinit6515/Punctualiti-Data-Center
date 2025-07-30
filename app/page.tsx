"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Bell, Settings, HelpCircle, User, BarChart3, Database, Server, Monitor, Zap, Activity } from "lucide-react"

// Comprehensive data for different filter combinations
const allData = {
  rackSpace: {
    default: [
      { name: "Level 1", Available: 0, Sold: 297, Loss: 143 },
      { name: "Level 2", Available: 152, Sold: 212, Loss: 76 },
      { name: "Level 3", Available: 0, Sold: 386, Loss: 24 },
      { name: "Level 4", Available: 0, Sold: 360, Loss: 25 },
      { name: "Level 5", Available: 0, Sold: 369, Loss: 16 },
      { name: "Level 6", Available: 0, Sold: 234, Loss: 151 },
       { name: "Level 7", Available: 0, Sold: 0, Loss: 0 }
    ]
  },
  whiteSpace: {
    "complex1-site1": [
      { name: "Level 1", Available: 85, Used: 10},
      { name: "Level 2", Available: 85, Used: 5},
      { name: "Level 3", Available: 50, Used: 15 },
      { name: "Level 4", Available: 95, Used: 8},
      { name: "Level 5", Available: 95, Used: 12},
      { name: "Level 6", Available: 50, Used: 20 },
    ],
    default: [
      { name: "Level 1", Available: 11500, Used: 0},
      { name: "Level 2", Available: 4000, Used: 7500},
      { name: "Level 3", Available: 0, Used: 11500},
      { name: "Level 4", Available: 0, Used: 10500},
      { name: "Level 5", Available: 0, Used: 10500},
      { name: "Level 6", Available: 0, Used: 10500},
      { name: "Level 7", Available: 0, Used: 0},
    ],
  },
itCapacityBar: {
  default: [
    { name: "Level 1", Available: 491, Sold: 2709, Allocated: 2709 },
    { name: "Level 2", Available: 2402.25, Sold: 797.75, Allocated: 794.38 },
    { name: "Level 3", Available: -30.00, Sold: 1630.00, Allocated: 1623.50 },
    { name: "Level 4", Available: 0.00, Sold: 1600.00, Allocated: 1600.00 },
    { name: "Level 5", Available: 0.00, Sold: 1600.00, Allocated: 1600.00 },
    { name: "Level 6", Available: -138.00, Sold: 1738.00, Allocated: 1727.80 },
    { name: "Level 7", Available: -72.00, Sold: 1672.00, Allocated: 1672.00 },
  ],
},

  itCapacityPie: {
    default: [
      { name: "Level 1", value: 0.00, color: "#6B7280" },
      { name: "Level 2", value: 268.45, color: "#10B981" },
      { name: "Level 3", value: 1233.00, color: "#3B82F6" },
      { name: "Level 4", value: 742.69, color: "#EF4444" },
      { name: "Level 5", value: 0.00, color: "#F59E0B" },
      { name: "Level 6", value: 947.00, color: "#EC4899" },
      { name: "Level 7", value: 754.00, color: "#8B5CF6" },
    ]
  },
}

// Compact Professional Tooltips
const CompactTooltip = ({ active, payload, label, type = "rack" }: any) => {
  if (active && payload && payload.length) {
    const total = payload.reduce((sum: number, entry: any) => sum + entry.value, 0)
    
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-2 text-xs">
        <p className="font-medium text-gray-700 mb-1">{label}</p>
        <div className="space-y-0.5">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                <div 
                  className="w-2 h-2 rounded-sm" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-gray-600">{entry.dataKey}:</span>
              </div>
              <span className="font-medium">{entry.value}{type === "capacity" ? "Kw" : ""}</span>
            </div>
          ))}
        </div>
        {total > 0 && (
          <div className="border-t border-gray-100 mt-1 pt-1">
            <div className="flex justify-between text-gray-500">
              <span>Total:</span>
              <span className="font-medium">{total}{type === "capacity" ? "Kw" : ""}</span>
            </div>
          </div>
        )}
      </div>
    )
  }
  return null
}

const PieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const entry = payload[0]
    const percentage = ((entry.value / 1000) * 100).toFixed(1)
    
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-2 text-xs">
        <div className="font-medium text-gray-700 mb-1">{entry.name}</div>
        <div className="space-y-0.5">
          <div className="flex justify-between">
            <span className="text-gray-600">Value:</span>
            <span className="font-medium">{entry.value} Kw</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Percentage:</span>
            <span className="font-medium">{percentage}%</span>
          </div>
        </div>
      </div>
    )
  }
  return null
}

export default function Dashboard() {
  const [filters, setFilters] = useState({
    complex: "",
    site: "",
    from: "",
    to: "",
  })

  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }
  const resetFilters = () => {
    setFilters({ complex: "", site: "", from: "", to: "" })
  }
  // Get filtered data based on current filter selection
  const getFilteredData = (dataType: keyof typeof allData) => {
    const filterKey = filters.complex && filters.site ? `${filters.complex}-${filters.site}` : "default"
    return allData[dataType][filterKey as keyof (typeof allData)[typeof dataType]] || allData[dataType].default
  }
  const rackSpaceData = useMemo(() => getFilteredData("rackSpace"), [filters])
  const whiteSpaceData = useMemo(() => getFilteredData("whiteSpace"), [filters])
  const itCapacityBarData = useMemo(() => getFilteredData("itCapacityBar"), [filters])
type PieDataPoint = { name: string; value: number; color: string };
const itCapacityPieData: PieDataPoint[] = useMemo(() => {
  const rawData = getFilteredData("itCapacityPie") as any[];
  return rawData.filter((d): d is PieDataPoint => d && typeof d.color === "string");
}, [filters]);

  const capacityStats = {
    total: 14400,
    sold: 11746.75,
    unsold: 2653.25,
    percentage: ((11746.75 / 14400) * 100).toFixed(1),
  }

  const GaugeChart = () => {
    const data = [
      { name: "Sold", value: capacityStats.sold, color: "#10B981" },
      { name: "Unsold", value: capacityStats.unsold, color: "#EF4444" },
    ]
    
    return (
      <div className="relative">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              startAngle={180}
              endAngle={0}
              innerRadius={60}
              outerRadius={80}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<PieTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{capacityStats.percentage}%</div>
            <div className="text-sm text-gray-500">-42%</div>
          </div>
        </div>
      </div>
    )
  }



const AnimatedPieChart = () => {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={itCapacityPieData}
          cx="50%"
          cy="50%"
          outerRadius={80}
          dataKey="value"
          labelLine={false}

        >
          {itCapacityPieData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<PieTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  )
}

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4 space-y-4">
        <div className="w-8 h-8 rounded flex items-center justify-center text-white font-bold">
          <img src="./temp.svg" alt="" />
        </div>
        <div className="flex flex-col space-y-3">
          <Button variant="ghost" size="icon" className="w-10 h-10 text-blue-600 bg-blue-50">
            <BarChart3 className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="w-10 h-10 hover:bg-gray-100">
            <Database className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="w-10 h-10 hover:bg-gray-100">
            <Server className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="w-10 h-10 hover:bg-gray-100">
            <Monitor className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="w-10 h-10 hover:bg-gray-100">
            <Zap className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="w-10 h-10 hover:bg-gray-100">
            <Activity className="w-5 h-5" />
          </Button>
        </div>
        <div className="mt-auto flex flex-col space-y-3">
          <Button variant="ghost" size="icon" className="w-10 h-10 hover:bg-gray-100">
            <Settings className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="w-10 h-10 hover:bg-gray-100">
            <HelpCircle className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="w-10 h-10 hover:bg-gray-100">
            <User className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-500">Data Center Management</p>
            </div>
            <div className="flex items-center space-x-4">
              <Bell className="w-5 h-5 text-gray-400" />
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-4 mt-4">
            <Select value={filters.complex} onValueChange={(value) => handleFilterChange("complex", value)}>
              <SelectTrigger className="w-32 h-9">
                <SelectValue placeholder="Complex" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="complex1">Complex 1</SelectItem>
                <SelectItem value="complex2">Complex 2</SelectItem>
                <SelectItem value="complex3">Complex 3</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.site} onValueChange={(value) => handleFilterChange("site", value)}>
              <SelectTrigger className="w-24 h-9">
                <SelectValue placeholder="Site" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="site1">Site 1</SelectItem>
                <SelectItem value="site2">Site 2</SelectItem>
                <SelectItem value="site3">Site 3</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.from} onValueChange={(value) => handleFilterChange("from", value)}>
              <SelectTrigger className="w-24 h-9">
                <SelectValue placeholder="From" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="jan">Jan</SelectItem>
                <SelectItem value="feb">Feb</SelectItem>
                <SelectItem value="mar">Mar</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.to} onValueChange={(value) => handleFilterChange("to", value)}>
              <SelectTrigger className="w-24 h-9">
                <SelectValue placeholder="To" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dec">Dec</SelectItem>
                <SelectItem value="nov">Nov</SelectItem>
                <SelectItem value="oct">Oct</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={resetFilters} className="h-9">
              Reset
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 h-9">
              Apply Filters
            </Button>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 p-6 space-y-6 overflow-auto">
          {/* Top Row - Rack Space and White Space */}
          <div className="grid grid-cols-2 gap-6">
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-lg font-semibold text-gray-800">Rack Space</CardTitle>
                <Select defaultValue="site">
                  <SelectTrigger className="w-20 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="site">Site</SelectItem>
                    <SelectItem value="level">Level</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={rackSpaceData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip content={(props) => <CompactTooltip {...props} type="rack" />} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="Available" stackId="a" fill="#10B981" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="Sold" stackId="a" fill="#EF4444" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="Loss" stackId="a" fill="#F59E0B" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex items-center justify-center space-x-6 mt-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                    <span className="text-sm text-gray-600">Available</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
                    <span className="text-sm text-gray-600">Used</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-sm"></div>
                    <span className="text-sm text-gray-600">Loss</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-lg font-semibold text-gray-800">White Space</CardTitle>
                <Select defaultValue="site">
                  <SelectTrigger className="w-20 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="site">Site</SelectItem>
                    <SelectItem value="level">Level</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={whiteSpaceData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip content={(props) => <CompactTooltip {...props} type="space" />} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="Available" stackId="a" fill="#10B981" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="Used" stackId="a" fill="#EF4444" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex items-center justify-center space-x-6 mt-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                    <span className="text-sm text-gray-600">Available</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
                    <span className="text-sm text-gray-600">Used</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bottom Row - IT Capacity Charts */}
          <div className="grid grid-cols-3 gap-6">
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-gray-800">IT Capacity</CardTitle>
                <div className="bg-gray-800 text-white p-3 rounded-lg text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div>Total: <span className="font-semibold">14400 Kw</span></div>
                    <div>Sold: <span className="font-semibold text-green-400">11746.75 Kw</span></div>
                    <div>Used: <span className="font-semibold text-blue-400">11726.68 Kw</span></div>
                    <div>Unsold: <span className="font-semibold text-red-400">2653.25 Kw</span></div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={itCapacityBarData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip content={(props) => <CompactTooltip {...props} type="capacity" />} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="Available" stackId="a" fill="#10B981" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="Sold" stackId="a" fill="#F59E0B" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="Allocated" stackId="a" fill="#3B82F6" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex items-center justify-center space-x-4 mt-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                    <span className="text-xs text-gray-600">Available</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-sm"></div>
                    <span className="text-xs text-gray-600">Sold</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
                    <span className="text-xs text-gray-600">Allocated</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-lg font-semibold text-gray-800">IT Capacity</CardTitle>
                <div className="flex space-x-2">
                  {/* <Select defaultValue="complex">
                    <SelectTrigger className="w-20 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="complex">Complex</SelectItem>
                      <SelectItem value="site">Site</SelectItem>
                    </SelectContent>
                  </Select> */}
                </div>
              </CardHeader>
              <CardContent>
                <GaugeChart />
                <div className="mt-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Capacity:</span>
                    <span className="font-semibold">{capacityStats.total} Kw</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                      <span className="text-gray-600">Sold Capacity:</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{capacityStats.sold} Kw</div>
                      <div className="text-xs text-green-600">{capacityStats.percentage}%</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
                      <span className="text-gray-600">Unsold Capacity:</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{capacityStats.unsold} Kw</div>
                      <div className="text-xs text-red-600">
                        {(100 - parseFloat(capacityStats.percentage)).toFixed(1)} %
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-lg font-semibold text-gray-800">IT Capacity Distribution</CardTitle>
                {/* <div className="flex space-x-2">
                  <Select defaultValue="complex">
                    <SelectTrigger className="w-20 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="complex">Complex</SelectItem>
                      <SelectItem value="site">Site</SelectItem>
                    </SelectContent>
                  </Select>
                </div> */}
              </CardHeader>
              <CardContent>
                <AnimatedPieChart />
                <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
                  {itCapacityPieData.map((entry, index) => (
                    <div key={index} className="flex items-center space-x-1">
                      <div 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="text-xs text-gray-600">{entry.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}