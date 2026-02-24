import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Label } from "@/components/ui/label";

const lineData = [
  { month: "Янв", revenue: 186, expenses: 80 },
  { month: "Фев", revenue: 305, expenses: 200 },
  { month: "Мар", revenue: 237, expenses: 120 },
  { month: "Апр", revenue: 473, expenses: 190 },
  { month: "Май", revenue: 509, expenses: 230 },
  { month: "Июн", revenue: 614, expenses: 140 },
];

const barData = [
  { name: "React", value: 68 },
  { name: "Vue", value: 42 },
  { name: "Angular", value: 35 },
  { name: "Svelte", value: 28 },
];

const pieData = [
  { name: "Основной долг", value: 3200000, fill: "hsl(var(--success))" },
  { name: "Проценты", value: 1450000, fill: "hsl(var(--destructive))" },
  { name: "Комиссия", value: 150000, fill: "hsl(var(--warning))" },
];

const lineConfig: ChartConfig = {
  revenue: { label: "Выручка", color: "hsl(var(--primary))" },
  expenses: { label: "Расходы", color: "hsl(var(--destructive))" },
};

const barConfig: ChartConfig = {
  value: { label: "Популярность", color: "hsl(var(--primary))" },
};

const pieConfig: ChartConfig = {
  principal: { label: "Основной долг", color: "hsl(var(--success))" },
  interest: { label: "Проценты", color: "hsl(var(--destructive))" },
  commission: { label: "Комиссия", color: "hsl(var(--warning))" },
};

export function ChartsShowcase() {
  return (
    <div className="space-y-6">
      {/* Line Chart */}
      <div>
        <Label className="mb-2 block">Line Chart — Выручка и расходы</Label>
        <ChartContainer config={lineConfig} className="h-[250px] w-full">
          <LineChart data={lineData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Line type="monotone" dataKey="revenue" stroke="var(--color-revenue)" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="expenses" stroke="var(--color-expenses)" strokeWidth={2} dot={false} />
          </LineChart>
        </ChartContainer>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Bar Chart */}
        <div>
          <Label className="mb-2 block">Bar Chart — Популярность фреймворков</Label>
          <ChartContainer config={barConfig} className="h-[200px] w-full">
            <BarChart data={barData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="value" fill="var(--color-value)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </div>

        {/* Donut Chart */}
        <div>
          <Label className="mb-2 block">Donut Chart — Структура платежей</Label>
          <ChartContainer config={pieConfig} className="h-[200px] w-full">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent />} />
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                strokeWidth={2}
              >
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <ChartLegend content={<ChartLegendContent />} />
            </PieChart>
          </ChartContainer>
        </div>
      </div>

      {/* Area Chart */}
      <div>
        <Label className="mb-2 block">Area Chart — Выручка</Label>
        <ChartContainer config={lineConfig} className="h-[200px] w-full">
          <AreaChart data={lineData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area type="monotone" dataKey="revenue" stroke="var(--color-revenue)" fill="var(--color-revenue)" fillOpacity={0.15} />
          </AreaChart>
        </ChartContainer>
      </div>
    </div>
  );
}
