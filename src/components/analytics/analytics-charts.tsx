"use client";

import { useState } from "react";

// ==========================================
// REGISTRATION TREND CHART (SVG LINE & AREA)
// ==========================================
interface TrendDataPoint {
    date: string;
    count: number;
}

interface TrendProps {
    data: TrendDataPoint[];
}

export function RegistrationTrendChart({ data }: TrendProps) {
    const [hoverIndex, setHoverIndex] = useState<number | null>(null);

    const width = 500;
    const height = 200;
    const paddingLeft = 40;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 30;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    const maxCount = Math.max(...data.map((d) => d.count), 5); // default min 5 for scaling
    const pointsCount = data.length;

    // Generate coordinates
    const coordinates = data.map((d, i) => {
        const x = paddingLeft + (i / Math.max(pointsCount - 1, 1)) * chartWidth;
        const y = paddingTop + chartHeight - (d.count / maxCount) * chartHeight;
        return { x, y, ...d };
    });

    // Create Path Strings
    let linePath = "";
    let areaPath = "";

    if (coordinates.length > 0) {
        linePath = `M ${coordinates[0].x} ${coordinates[0].y} ` + 
            coordinates.slice(1).map(c => `L ${c.x} ${c.y}`).join(" ");
        
        areaPath = `${linePath} L ${coordinates[coordinates.length - 1].x} ${paddingTop + chartHeight} L ${coordinates[0].x} ${paddingTop + chartHeight} Z`;
    }

    return (
        <div className="rounded-2xl border p-6 bg-card space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-lg">Registration Trend</h3>
                    <p className="text-xs text-muted-foreground">Momentum over the last 30 days</p>
                </div>
                {hoverIndex !== null && (
                    <div className="text-right">
                        <span className="text-xs text-muted-foreground">{data[hoverIndex].date}:</span>{" "}
                        <span className="text-sm font-bold text-primary">{data[hoverIndex].count} sign-ups</span>
                    </div>
                )}
            </div>

            <div className="relative w-full aspect-[5/2]">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
                    <defs>
                        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--primary, #3b82f6)" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="var(--primary, #3b82f6)" stopOpacity="0.0" />
                        </linearGradient>
                    </defs>

                    {/* Grid lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                        const y = paddingTop + ratio * chartHeight;
                        const labelValue = Math.round(maxCount * (1 - ratio));
                        return (
                            <g key={idx}>
                                <line
                                    x1={paddingLeft}
                                    y1={y}
                                    x2={width - paddingRight}
                                    y2={y}
                                    stroke="currentColor"
                                    className="text-border/40"
                                    strokeDasharray="4 4"
                                />
                                <text
                                    x={paddingLeft - 10}
                                    y={y + 4}
                                    textAnchor="end"
                                    className="text-[10px] fill-muted-foreground font-semibold"
                                >
                                    {labelValue}
                                </text>
                            </g>
                        );
                    })}

                    {/* Area fill */}
                    {areaPath && (
                        <path d={areaPath} fill="url(#areaGradient)" />
                    )}

                    {/* Line stroke */}
                    {linePath && (
                        <path
                            d={linePath}
                            fill="none"
                            stroke="var(--primary, #3b82f6)"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    )}

                    {/* Interaction grid & dots */}
                    {coordinates.map((c, i) => (
                        <g key={i}>
                            {/* Hover capture bar */}
                            <rect
                                x={c.x - (chartWidth / Math.max(pointsCount - 1, 1)) / 2}
                                y={paddingTop}
                                width={chartWidth / Math.max(pointsCount - 1, 1)}
                                height={chartHeight}
                                fill="transparent"
                                className="cursor-pointer"
                                onMouseEnter={() => setHoverIndex(i)}
                                onMouseLeave={() => setHoverIndex(null)}
                            />

                            {/* Active Point Circle */}
                            {(hoverIndex === i || pointsCount <= 10) && (
                                <circle
                                    cx={c.x}
                                    cy={c.y}
                                    r={hoverIndex === i ? 5 : 3.5}
                                    fill="var(--primary, #3b82f6)"
                                    stroke="white"
                                    strokeWidth="1.5"
                                    className="pointer-events-none transition-all duration-100"
                                />
                            )}
                        </g>
                    ))}

                    {/* X Axis Labels */}
                    {coordinates.length > 0 && [0, Math.floor(pointsCount / 2), pointsCount - 1].map((idx) => {
                        const c = coordinates[idx];
                        if (!c) return null;
                        return (
                            <text
                                key={idx}
                                x={c.x}
                                y={height - 5}
                                textAnchor="middle"
                                className="text-[10px] fill-muted-foreground font-semibold"
                            >
                                {c.date}
                            </text>
                        );
                    })}
                </svg>
            </div>
        </div>
    );
}

// ==========================================
// CATEGORY DOUGHNUT CHART (SVG STROKE CIRCLE)
// ==========================================
interface CategoryDataPoint {
    category: string;
    count: number;
}

interface CategoryProps {
    data: CategoryDataPoint[];
}

export function CategoryDoughnutChart({ data }: CategoryProps) {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const total = data.reduce((sum, item) => sum + item.count, 0);

    const colors = [
        "#6366f1", // Indigo
        "#10b981", // Emerald
        "#f59e0b", // Amber
        "#ef4444", // Rose
        "#8b5cf6", // Violet
        "#06b6d4", // Cyan
    ];

    // Compute segments
    let accumulatedPercent = 0;
    const segments = data.map((item, idx) => {
        const percent = total > 0 ? item.count / total : 0;
        const strokeDasharray = `${percent * 100} ${100 - percent * 100}`;
        const strokeDashoffset = 100 - accumulatedPercent * 100 + 25; // Rotate 25% (90deg)
        accumulatedPercent += percent;

        return {
            ...item,
            percent,
            strokeDasharray,
            strokeDashoffset,
            color: colors[idx % colors.length],
        };
    });

    return (
        <div className="rounded-2xl border p-6 bg-card space-y-4">
            <div>
                <h3 className="font-bold text-lg">Registrations by Category</h3>
                <p className="text-xs text-muted-foreground">Distribution across event types</p>
            </div>

            {total === 0 ? (
                <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
                    No category data available
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    {/* Doughnut SVG */}
                    <div className="relative flex justify-center items-center">
                        <svg viewBox="0 0 42 42" className="w-36 h-36 overflow-visible">
                            <circle
                                cx="21"
                                cy="21"
                                r="15.915"
                                fill="transparent"
                                stroke="currentColor"
                                className="text-border/20"
                                strokeWidth="4.5"
                            />
                            {segments.map((seg, i) => (
                                <circle
                                    key={i}
                                    cx="21"
                                    cy="21"
                                    r="15.915"
                                    fill="transparent"
                                    stroke={seg.color}
                                    strokeWidth={activeIndex === i ? "6" : "4.5"}
                                    strokeDasharray={seg.strokeDasharray}
                                    strokeDashoffset={seg.strokeDashoffset}
                                    className="transition-all duration-200 cursor-pointer origin-center"
                                    onMouseEnter={() => setActiveIndex(i)}
                                    onMouseLeave={() => setActiveIndex(null)}
                                />
                            ))}
                        </svg>

                        {/* Center text */}
                        <div className="absolute flex flex-col items-center justify-center">
                            <span className="text-2xl font-bold">
                                {activeIndex !== null ? segments[activeIndex].count : total}
                            </span>
                            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                                {activeIndex !== null ? segments[activeIndex].category : "Total Tickets"}
                            </span>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="space-y-2">
                        {segments.map((seg, i) => (
                            <div
                                key={i}
                                className={`flex items-center justify-between p-2 rounded-xl border transition ${
                                    activeIndex === i ? "bg-muted/40 border-primary/20" : "border-transparent"
                                }`}
                                onMouseEnter={() => setActiveIndex(i)}
                                onMouseLeave={() => setActiveIndex(null)}
                            >
                                <div className="flex items-center gap-2">
                                    <span
                                        className="w-3 h-3 rounded-full shrink-0"
                                        style={{ backgroundColor: seg.color }}
                                    />
                                    <span className="text-sm font-semibold text-foreground truncate max-w-[120px]">
                                        {seg.category || "General"}
                                    </span>
                                </div>
                                <div className="text-right text-xs">
                                    <span className="font-bold text-foreground">{seg.count}</span>{" "}
                                    <span className="text-muted-foreground">
                                        ({Math.round(seg.percent * 100)}%)
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ==========================================
// WEEKDAY HEATMAP GRID CHART
// ==========================================
interface HeatmapProps {
    data: { day: string; count: number }[]; // Mon-Sun
}

export function RegistrationHeatmap({ data }: HeatmapProps) {
    const [hoverDay, setHoverDay] = useState<number | null>(null);

    const maxVal = Math.max(...data.map(d => d.count), 1);
    
    // Day order
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const orderedData = dayNames.map((name) => {
        const item = data.find(d => d.day.slice(0, 3).toLowerCase() === name.toLowerCase());
        return {
            day: name,
            count: item ? item.count : 0
        };
    });

    return (
        <div className="rounded-2xl border p-6 bg-card space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-lg">Registration Heatmap</h3>
                    <p className="text-xs text-muted-foreground">Sign-ups distribution by weekday</p>
                </div>
                {hoverDay !== null && (
                    <div className="text-xs font-bold text-muted-foreground">
                        {orderedData[hoverDay].day}: <span className="text-foreground">{orderedData[hoverDay].count} sign-ups</span>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-7 gap-2">
                {orderedData.map((d, i) => {
                    // Compute intensity color
                    const intensity = d.count / maxVal;
                    let bgStyle = "bg-muted";
                    if (d.count > 0) {
                        if (intensity < 0.25) bgStyle = "bg-primary/20 text-primary";
                        else if (intensity < 0.5) bgStyle = "bg-primary/45 text-primary-foreground";
                        else if (intensity < 0.75) bgStyle = "bg-primary/70 text-primary-foreground";
                        else bgStyle = "bg-primary text-primary-foreground";
                    }

                    return (
                        <div
                            key={i}
                            onMouseEnter={() => setHoverDay(i)}
                            onMouseLeave={() => setHoverDay(null)}
                            className={`aspect-square flex flex-col items-center justify-between p-2 rounded-xl transition cursor-pointer border border-transparent hover:border-primary/40 ${bgStyle}`}
                        >
                            <span className="text-[10px] font-bold opacity-60 uppercase">{d.day}</span>
                            <span className="text-base font-extrabold">{d.count}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ==========================================
// CHECK-IN FLOW VELOCITY (SVG BAR CHART)
// ==========================================
interface FlowDataPoint {
    hour: string;
    count: number;
}

interface FlowProps {
    data: FlowDataPoint[];
}

export function CheckInFlowChart({ data }: FlowProps) {
    const [hoverIndex, setHoverIndex] = useState<number | null>(null);

    const width = 500;
    const height = 200;
    const paddingLeft = 40;
    const paddingRight = 20;
    const paddingTop = 25;
    const paddingBottom = 30;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    const maxCount = Math.max(...data.map(d => d.count), 5);
    const barsCount = data.length;
    const barWidth = barsCount > 0 ? (chartWidth / barsCount) * 0.75 : 0;
    const barSpacing = barsCount > 0 ? (chartWidth / barsCount) * 0.25 : 0;

    return (
        <div className="rounded-2xl border p-6 bg-card space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-lg">Check-In Velocity</h3>
                    <p className="text-xs text-muted-foreground">Attendee entries recorded by hour</p>
                </div>
                {hoverIndex !== null && (
                    <div className="text-right">
                        <span className="text-xs text-muted-foreground">{data[hoverIndex].hour}:</span>{" "}
                        <span className="text-sm font-bold text-green-600 dark:text-green-400">{data[hoverIndex].count} entries</span>
                    </div>
                )}
            </div>

            <div className="relative w-full aspect-[5/2]">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
                    {/* Horizontal Grid lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                        const y = paddingTop + ratio * chartHeight;
                        const labelValue = Math.round(maxCount * (1 - ratio));
                        return (
                            <g key={idx}>
                                <line
                                    x1={paddingLeft}
                                    y1={y}
                                    x2={width - paddingRight}
                                    y2={y}
                                    stroke="currentColor"
                                    className="text-border/40"
                                    strokeDasharray="4 4"
                                />
                                <text
                                    x={paddingLeft - 10}
                                    y={y + 4}
                                    textAnchor="end"
                                    className="text-[10px] fill-muted-foreground font-semibold"
                                >
                                    {labelValue}
                                </text>
                            </g>
                        );
                    })}

                    {/* Bars rendering */}
                    {data.map((d, i) => {
                        const barHeight = (d.count / maxCount) * chartHeight;
                        const x = paddingLeft + i * (barWidth + barSpacing) + barSpacing / 2;
                        const y = paddingTop + chartHeight - barHeight;

                        return (
                            <g key={i}>
                                {/* Animated bar rect */}
                                <rect
                                    x={x}
                                    y={y}
                                    width={barWidth}
                                    height={barHeight}
                                    rx={Math.min(3, barWidth / 2)}
                                    fill={hoverIndex === i ? "var(--primary, #10b981)" : "#10b981"}
                                    opacity={hoverIndex === i ? 1 : 0.75}
                                    className="transition-all duration-150"
                                />

                                {/* Invisible hover target */}
                                <rect
                                    x={x - barSpacing / 2}
                                    y={paddingTop}
                                    width={barWidth + barSpacing}
                                    height={chartHeight}
                                    fill="transparent"
                                    className="cursor-pointer"
                                    onMouseEnter={() => setHoverIndex(i)}
                                    onMouseLeave={() => setHoverIndex(null)}
                                />
                            </g>
                        );
                    })}

                    {/* X axis labels (show every few labels to avoid crowding) */}
                    {data.map((d, i) => {
                        if (barsCount > 8 && i % 2 !== 0) return null;
                        const x = paddingLeft + i * (barWidth + barSpacing) + barWidth / 2 + barSpacing / 2;
                        return (
                            <text
                                key={i}
                                x={x}
                                y={height - 5}
                                textAnchor="middle"
                                className="text-[9px] fill-muted-foreground font-semibold"
                            >
                                {d.hour}
                            </text>
                        );
                    })}
                </svg>
            </div>
        </div>
    );
}

// ==========================================
// REGISTRATION TRAFFIC SOURCES (SVG BAR LIST)
// ==========================================
interface SourceDataPoint {
    source: string;
    count: number;
}

interface SourceProps {
    data: SourceDataPoint[];
}

export function RegistrationSourceChart({ data }: SourceProps) {
    const total = data.reduce((sum, d) => sum + d.count, 0);

    const colors: Record<string, string> = {
        instagram: "bg-pink-500",
        whatsapp: "bg-green-500",
        direct: "bg-blue-500",
        ambassador: "bg-purple-500",
        poster: "bg-amber-500",
    };

    return (
        <div className="rounded-2xl border p-6 bg-card space-y-4">
            <div>
                <h3 className="font-bold text-lg">Registration Channels</h3>
                <p className="text-xs text-muted-foreground">Where your attendees discovered the event</p>
            </div>

            <div className="space-y-4">
                {data.map((d, idx) => {
                    const percentage = total > 0 ? (d.count / total) * 100 : 0;
                    const key = d.source.toLowerCase();
                    const barColor = colors[key] || "bg-primary";

                    return (
                        <div key={idx} className="space-y-2">
                            <div className="flex justify-between items-center text-sm font-semibold text-foreground">
                                <span className="capitalize">{d.source}</span>
                                <span>
                                    {d.count} <span className="text-xs text-muted-foreground font-normal">({Math.round(percentage)}%)</span>
                                </span>
                            </div>
                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${barColor} transition-all duration-500`}
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
