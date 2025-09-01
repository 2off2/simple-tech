import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface FeatureImportanceData {
  feature: string;
  importance: number;
}

interface FeatureImportanceChartProps {
  data: FeatureImportanceData[];
}

export function FeatureImportanceChart({ data }: FeatureImportanceChartProps) {
  // Pegar apenas as 5 features mais importantes e formatar dados
  const chartData = data
    .slice(0, 5)
    .map(item => ({
      feature: item.feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      importance: item.importance * 100 // Converter para porcentagem
    }))
    .reverse(); // Inverter para mostrar o mais importante no topo

  const formatTooltip = (value: number) => {
    return [`${value.toFixed(1)}%`, 'Importância'];
  };

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="horizontal"
          margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            type="number" 
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
            stroke="hsl(var(--muted-foreground))"
          />
          <YAxis 
            type="category" 
            dataKey="feature" 
            width={90}
            tick={{ fontSize: 12 }}
            stroke="hsl(var(--muted-foreground))"
          />
          <Tooltip 
            formatter={formatTooltip}
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "6px"
            }}
          />
          <Bar 
            dataKey="importance" 
            fill="hsl(var(--primary))"
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}