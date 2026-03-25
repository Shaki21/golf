/**
 * Benchmark Dashboard Component
 * Design System v3.0 - Premium Light
 *
 * MIGRATED TO PAGE ARCHITECTURE - Minimal inline styles (dynamic colors)
 */

import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, BarChart, Bar, Cell } from 'recharts';
import { Target, TrendingUp, Calendar, Award, ChevronRight, Users, Zap, Clock } from 'lucide-react';
import { PageTitle, SectionTitle, SubSectionTitle } from '../typography';

// Session type colors (hex values for charts)
const sessionTypeColors = {
  teknikk: '#2C5F7F',   // blue (info)
  golfslag: '#4A7C59',  // green (success)
  spill: '#10456A',     // dark blue (primaryDark)
};

// Sample benchmark data following Team Norway protocols
const players = [
  { id: 1, name: 'Magnus Eriksen', age: 17, handicap: 2.4 },
  { id: 2, name: 'Sofie Andersen', age: 16, handicap: 4.1 },
  { id: 3, name: 'Lars Nilsen', age: 18, handicap: 1.8 },
];

const benchmarkCycles = [
  { cycle: 1, date: '2025-10-20', label: 'Cycle 1' },
  { cycle: 2, date: '2025-11-10', label: 'Cycle 2' },
  { cycle: 3, date: '2025-12-01', label: 'Cycle 3' },
  { cycle: 4, date: '2025-12-22', label: 'Cycle 4 (Next)', isNext: true },
];

// Trackman-based benchmark categories (Team Norway protocol)
const benchmarkCategories = {
  driver: {
    name: 'Driver Performance',
    metrics: ['Ball Speed', 'Club Speed', 'Smash Factor', 'Launch Angle', 'Spin Rate', 'Carry Distance'],
    unit: ['mph', 'mph', '', '°', 'rpm', 'yards']
  },
  iron: {
    name: 'Iron Precision',
    metrics: ['Dispersion', 'Distance Control', 'Trajectory Control', 'Spin Consistency'],
    unit: ['yards', '%', '%', '%']
  },
  shortGame: {
    name: 'Short Game',
    metrics: ['Pitch Accuracy', 'Chip Proximity', 'Bunker Save %', 'Up & Down %'],
    unit: ['%', 'feet', '%', '%']
  },
  putting: {
    name: 'Putting',
    metrics: ['3-6ft Make %', '6-10ft Make %', 'Lag Putting', 'Green Reading'],
    unit: ['%', '%', 'avg dist', '%']
  },
  mental: {
    name: 'Mental Performance',
    metrics: ['Focus Score', 'Pressure Response', 'Recovery Rate', 'Routine Consistency'],
    unit: ['%', '%', '%', '%']
  }
};

// Sample player benchmark data across cycles
const playerBenchmarks = {
  1: { // Magnus
    driver: [
      { cycle: 1, ballSpeed: 162, clubSpeed: 112, smashFactor: 1.45, launchAngle: 11.2, spinRate: 2650, carry: 275 },
      { cycle: 2, ballSpeed: 165, clubSpeed: 114, smashFactor: 1.45, launchAngle: 12.1, spinRate: 2480, carry: 282 },
      { cycle: 3, ballSpeed: 168, clubSpeed: 115, smashFactor: 1.46, launchAngle: 12.5, spinRate: 2350, carry: 288 },
    ],
    radar: [
      { cycle: 1, driver: 78, iron: 82, shortGame: 70, putting: 75, mental: 68 },
      { cycle: 2, driver: 82, iron: 84, shortGame: 74, putting: 78, mental: 72 },
      { cycle: 3, driver: 86, iron: 87, shortGame: 78, putting: 82, mental: 78 },
    ],
    scores: [
      { cycle: 1, scoring: 73.2, fairwaysHit: 62, greensInReg: 58, puttsPerRound: 31.5 },
      { cycle: 2, scoring: 72.1, fairwaysHit: 68, greensInReg: 64, puttsPerRound: 30.2 },
      { cycle: 3, scoring: 70.8, fairwaysHit: 71, greensInReg: 69, puttsPerRound: 29.1 },
    ]
  },
  2: { // Sofie
    driver: [
      { cycle: 1, ballSpeed: 142, clubSpeed: 98, smashFactor: 1.45, launchAngle: 13.5, spinRate: 2850, carry: 225 },
      { cycle: 2, ballSpeed: 145, clubSpeed: 100, smashFactor: 1.45, launchAngle: 13.2, spinRate: 2720, carry: 232 },
      { cycle: 3, ballSpeed: 148, clubSpeed: 102, smashFactor: 1.45, launchAngle: 13.0, spinRate: 2600, carry: 240 },
    ],
    radar: [
      { cycle: 1, driver: 72, iron: 78, shortGame: 82, putting: 80, mental: 75 },
      { cycle: 2, driver: 75, iron: 80, shortGame: 84, putting: 82, mental: 78 },
      { cycle: 3, driver: 78, iron: 83, shortGame: 88, putting: 85, mental: 82 },
    ],
    scores: [
      { cycle: 1, scoring: 76.5, fairwaysHit: 58, greensInReg: 52, puttsPerRound: 30.8 },
      { cycle: 2, scoring: 75.2, fairwaysHit: 62, greensInReg: 56, puttsPerRound: 30.1 },
      { cycle: 3, scoring: 73.8, fairwaysHit: 65, greensInReg: 61, puttsPerRound: 29.4 },
    ]
  },
  3: { // Lars
    driver: [
      { cycle: 1, ballSpeed: 170, clubSpeed: 118, smashFactor: 1.44, launchAngle: 10.8, spinRate: 2420, carry: 290 },
      { cycle: 2, ballSpeed: 172, clubSpeed: 119, smashFactor: 1.45, launchAngle: 11.2, spinRate: 2380, carry: 295 },
      { cycle: 3, ballSpeed: 174, clubSpeed: 120, smashFactor: 1.45, launchAngle: 11.5, spinRate: 2320, carry: 302 },
    ],
    radar: [
      { cycle: 1, driver: 88, iron: 80, shortGame: 72, putting: 70, mental: 74 },
      { cycle: 2, driver: 90, iron: 82, shortGame: 75, putting: 74, mental: 76 },
      { cycle: 3, driver: 92, iron: 85, shortGame: 79, putting: 78, mental: 80 },
    ],
    scores: [
      { cycle: 1, scoring: 71.8, fairwaysHit: 72, greensInReg: 62, puttsPerRound: 31.2 },
      { cycle: 2, scoring: 71.0, fairwaysHit: 74, greensInReg: 66, puttsPerRound: 30.5 },
      { cycle: 3, scoring: 69.5, fairwaysHit: 76, greensInReg: 70, puttsPerRound: 29.8 },
    ]
  }
};

const getImprovement = (current, previous) => {
  if (!previous) return null;
  return ((current - previous) / previous * 100).toFixed(1);
};

const MetricCard = ({ title, value, unit, change, icon: Icon }) => (
  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
    <div className="flex items-center justify-between mb-2">
      <span className="text-gray-500 text-sm font-medium">{title}</span>
      {Icon && <Icon className="w-4 h-4 text-forest-600" />}
    </div>
    <div className="flex items-baseline gap-2">
      <span className="text-2xl font-bold text-gray-900">{value}</span>
      <span className="text-gray-400 text-sm">{unit}</span>
    </div>
    {change && (
      <div className={`mt-1 text-sm font-medium ${parseFloat(change) >= 0 ? 'text-forest-600' : 'text-red-500'}`}>
        {parseFloat(change) >= 0 ? '↑' : '↓'} {Math.abs(change)}%
      </div>
    )}
  </div>
);

const CycleTimeline = ({ cycles, currentCycle }) => (
  <div className="flex items-center gap-2 overflow-x-auto pb-2">
    {cycles.map((cycle, idx) => (
      <div key={cycle.cycle} className="flex items-center">
        <div 
          className={`flex flex-col items-center px-4 py-2 rounded-lg transition-all ${
            cycle.cycle === currentCycle 
              ? 'bg-forest-600 text-white' 
              : cycle.isNext 
                ? 'bg-amber-100 text-amber-700 border-2 border-dashed border-amber-400' 
                : 'bg-gray-100 text-gray-600'
          }`}
        >
          <span className="text-xs font-medium">{cycle.label}</span>
          <span className="text-xs opacity-75">{new Date(cycle.date).toLocaleDateString('no-NO', { day: 'numeric', month: 'short' })}</span>
        </div>
        {idx < cycles.length - 1 && (
          <ChevronRight className="w-4 h-4 text-gray-300 mx-1" />
        )}
      </div>
    ))}
  </div>
);

const RadarChartComponent = ({ data }) => {
  const radarData = [
    { subject: 'Driver', A: data.driver, fullMark: 100 },
    { subject: 'Irons', A: data.iron, fullMark: 100 },
    { subject: 'Short Game', A: data.shortGame, fullMark: 100 },
    { subject: 'Putting', A: data.putting, fullMark: 100 },
    { subject: 'Mental', A: data.mental, fullMark: 100 },
  ];

  return (
    <ResponsiveContainer width="100%" height={250}>
      <RadarChart data={radarData}>
        <PolarGrid stroke="#D1D5DB" />
        <PolarAngleAxis dataKey="subject" tick={{ fill: '#4B5563', fontSize: 12 }} />
        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#6B7280', fontSize: 10 }} />
        <Radar name="Score" dataKey="A" stroke="#4A7C59" fill="#4A7C59" fillOpacity={0.3} strokeWidth={2} />
      </RadarChart>
    </ResponsiveContainer>
  );
};

const ProgressChart = ({ data, dataKey, name, color }) => (
  <ResponsiveContainer width="100%" height={200}>
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
      <XAxis dataKey="cycle" tick={{ fill: '#4B5563', fontSize: 12 }} tickFormatter={(v) => `C${v}`} />
      <YAxis tick={{ fill: '#4B5563', fontSize: 12 }} domain={['auto', 'auto']} />
      <Tooltip
        contentStyle={{
          backgroundColor: 'white',
          border: '1px solid #D1D5DB',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}
      />
      <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={3} dot={{ fill: color, strokeWidth: 2, r: 5 }} name={name} />
    </LineChart>
  </ResponsiveContainer>
);

const ComparisonBar = ({ data, players }) => {
  const chartData = players.map(p => ({
    name: p.name.split(' ')[0],
    score: playerBenchmarks[p.id].radar[2].driver + 
           playerBenchmarks[p.id].radar[2].iron + 
           playerBenchmarks[p.id].radar[2].shortGame + 
           playerBenchmarks[p.id].radar[2].putting + 
           playerBenchmarks[p.id].radar[2].mental
  }));

  const colors = ['#4A7C59', sessionTypeColors.golfslag, sessionTypeColors.teknikk];

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={chartData} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
        <XAxis type="number" domain={[0, 500]} tick={{ fill: '#4B5563', fontSize: 12 }} />
        <YAxis dataKey="name" type="category" tick={{ fill: '#4B5563', fontSize: 12 }} width={60} />
        <Tooltip />
        <Bar dataKey="score" radius={[0, 4, 4, 0]}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default function BenchmarkDashboard() {
  const [selectedPlayer, setSelectedPlayer] = useState(players[0]);
  const [selectedCycle, setSelectedCycle] = useState(3);
  const playerData = playerBenchmarks[selectedPlayer.id];
  const currentRadar = playerData.radar[selectedCycle - 1];
  const currentDriver = playerData.driver[selectedCycle - 1];
  const currentScores = playerData.scores[selectedCycle - 1];
  const previousScores = selectedCycle > 1 ? playerData.scores[selectedCycle - 2] : null;

  const daysUntilNext = Math.ceil((new Date('2025-12-22') - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-forest-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-forest-600 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <PageTitle className="text-2xl font-bold text-gray-900">TIER Golf Group</PageTitle>
              <p className="text-gray-500">Benchmark Evaluation Engine</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">Team Norway Protocol • 3-Week Testing Cycles • Trackman 4 Integrated</p>
        </div>

        {/* Timeline & Next Test Alert */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center justify-between mb-4">
            <SectionTitle className="font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-forest-600" />
              Benchmark Cycles 2025
            </SectionTitle>
            <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-full">
              <Clock className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-700">Next test in {daysUntilNext} days</span>
            </div>
          </div>
          <CycleTimeline cycles={benchmarkCycles} currentCycle={selectedCycle} />
        </div>

        {/* Player Selection */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <SectionTitle className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-forest-600" />
            Select Player
          </SectionTitle>
          <div className="flex gap-3">
            {players.map((player) => (
              <button
                key={player.id}
                onClick={() => setSelectedPlayer(player)}
                className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                  selectedPlayer.id === player.id
                    ? 'border-forest-500 bg-forest-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold text-gray-900">{player.name}</div>
                <div className="text-sm text-gray-500">Age {player.age} • HCP {player.handicap}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <MetricCard 
            title="Scoring Average" 
            value={currentScores.scoring} 
            unit="strokes"
            change={previousScores ? getImprovement(previousScores.scoring, currentScores.scoring) : null}
            icon={Award}
          />
          <MetricCard 
            title="Ball Speed" 
            value={currentDriver.ballSpeed} 
            unit="mph"
            change={selectedCycle > 1 ? getImprovement(currentDriver.ballSpeed, playerData.driver[selectedCycle - 2].ballSpeed) : null}
            icon={Zap}
          />
          <MetricCard 
            title="Greens in Reg" 
            value={currentScores.greensInReg} 
            unit="%"
            change={previousScores ? getImprovement(currentScores.greensInReg, previousScores.greensInReg) : null}
            icon={Target}
          />
          <MetricCard 
            title="Putts/Round" 
            value={currentScores.puttsPerRound} 
            unit="avg"
            change={previousScores ? getImprovement(previousScores.puttsPerRound, currentScores.puttsPerRound) : null}
            icon={TrendingUp}
          />
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Performance Radar */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <SubSectionTitle className="font-semibold text-gray-900 mb-4">Performance Profile</SubSectionTitle>
            <RadarChartComponent data={currentRadar} />
            <div className="grid grid-cols-5 gap-2 mt-4">
              {Object.entries(currentRadar).filter(([k]) => k !== 'cycle').map(([key, value]) => (
                <div key={key} className="text-center">
                  <div className="text-lg font-bold text-forest-600">{value}</div>
                  <div className="text-xs text-gray-500 capitalize">{key}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Scoring Trend */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <SubSectionTitle className="font-semibold text-gray-900 mb-4">Scoring Progression</SubSectionTitle>
            <ProgressChart 
              data={playerData.scores} 
              dataKey="scoring" 
              name="Scoring Avg" 
              color="#10456A"
            />
            <div className="mt-4 p-3 bg-forest-50 rounded-lg">
              <div className="text-sm text-forest-800">
                <span className="font-semibold">Trend:</span> {selectedPlayer.name} has improved by{' '}
                <span className="font-bold">
                  {(playerData.scores[0].scoring - currentScores.scoring).toFixed(1)} strokes
                </span>{' '}
                since Cycle 1
              </div>
            </div>
          </div>
        </div>

        {/* Driver Metrics */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <SubSectionTitle className="font-semibold text-gray-900 mb-4">Trackman Driver Analysis</SubSectionTitle>
          <div className="grid md:grid-cols-2 gap-6">
            <ProgressChart 
              data={playerData.driver} 
              dataKey="carry" 
              name="Carry Distance" 
              color="{sessionTypeColors.golfslag}"
            />
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-sm text-gray-500 mb-1">Club Speed</div>
                <div className="text-xl font-bold text-gray-900">{currentDriver.clubSpeed} mph</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-sm text-gray-500 mb-1">Smash Factor</div>
                <div className="text-xl font-bold text-gray-900">{currentDriver.smashFactor}</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-sm text-gray-500 mb-1">Launch Angle</div>
                <div className="text-xl font-bold text-gray-900">{currentDriver.launchAngle}°</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-sm text-gray-500 mb-1">Spin Rate</div>
                <div className="text-xl font-bold text-gray-900">{currentDriver.spinRate} rpm</div>
              </div>
            </div>
          </div>
        </div>

        {/* Team Comparison */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <SubSectionTitle className="font-semibold text-gray-900 mb-4">Team Comparison (Cycle 3)</SubSectionTitle>
          <ComparisonBar data={playerBenchmarks} players={players} />
          <div className="mt-4 text-sm text-gray-500 text-center">
            Combined performance score across all 5 benchmark categories (max 500)
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-400">
          TIER Golf Group AS • Fredrikstad • Team Norway Protocol v1.0
        </div>
      </div>
    </div>
  );
}
