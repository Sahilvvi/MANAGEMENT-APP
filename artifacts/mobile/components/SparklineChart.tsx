import React from "react";
import { View } from "react-native";

interface SparklineChartProps {
  data: number[];
  color: string;
  height?: number;
  gap?: number;
}

export function SparklineChart({ data, color, height = 40, gap = 3 }: SparklineChartProps) {
  if (!data.length) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  return (
    <View style={{ height, flexDirection: "row", alignItems: "flex-end", gap }}>
      {data.map((val, i) => {
        const pct = Math.max(0.1, (val - min) / range);
        const isLast = i === data.length - 1;
        const isNewest = i >= data.length - 3;
        return (
          <View
            key={i}
            style={{
              flex: 1,
              height: Math.round(pct * height),
              backgroundColor: color,
              opacity: isLast ? 1 : isNewest ? 0.75 : 0.35 + (i / (data.length - 1)) * 0.45,
              borderRadius: 3,
            }}
          />
        );
      })}
    </View>
  );
}
