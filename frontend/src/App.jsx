import { useState, useEffect } from 'react'
import axios from 'axios'
import { Play, Square, Activity, AlertTriangle, Zap, TrendingUp, BarChart2, Radio, Download } from 'lucide-react'
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
  ComposedChart, Bar, Cell, Label
} from 'recharts'
import clsx from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs) {
  return twMerge(clsx(inputs))
}

const API_URL = 'http://localhost:8000'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/90 border border-slate-700 p-3 rounded-lg shadow-xl backdrop-blur-md">
        <p className="text-slate-400 text-xs mb-1">{label}</p>
        {payload.map((pld, idx) => (
          <div key={idx} className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: pld.color }} />
            <span className="text-slate-300 capitalize">{pld.name.replace('_', ' ')}:</span>
            <span className="font-mono font-bold text-white">
              {typeof pld.value === 'number' ? pld.value.toFixed(4) : pld.value}
            </span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

function App() {
  const [status, setStatus] = useState({ running: false })
  const [config, setConfig] = useState({
    symbol_a: 'btcusdt',
    symbol_b: 'ethusdt',
    timeframe: '1m',
    timeframes: ['1s', '1m', '5m'],
    window: 20,
    threshold: 2.0,
    limit: 200
  })
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  useEffect(() => {
    checkStatus()
    const interval = setInterval(fetchData, 2000)
    return () => clearInterval(interval)
  }, [config])

  const checkStatus = async () => {
    try {
      const res = await axios.get(`${API_URL}/pipeline/status`)
      setStatus(res.data)
    } catch (err) {
      console.error("API offline")
    }
  }

  const fetchData = async () => {
    try {
      const res = await axios.post(`${API_URL}/analytics`, {
        symbol_a: config.symbol_a,
        symbol_b: config.symbol_b,
        timeframe: config.timeframe, 
        window: parseInt(config.window),
        limit: parseInt(config.limit),
        z_score_threshold: parseFloat(config.threshold)
      })
      setData(res.data)
      setError(null)
    } catch (err) {
    }
  }

  const handleStart = async () => {
    setLoading(true)
    try {
      await axios.post(`${API_URL}/pipeline/start`, config)
      checkStatus()
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to start")
    } finally {
      setLoading(false)
    }
  }

  const handleStop = async () => {
    setLoading(true)
    try {
      await axios.post(`${API_URL}/pipeline/stop`)
      checkStatus()
    } catch (err) {
      setError("Failed to stop")
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    try {
       const res = await axios.post(`${API_URL}/analytics/export`, {
         symbol_a: config.symbol_a,
         symbol_b: config.symbol_b,
         timeframe: config.timeframe, 
         window: parseInt(config.window),
         limit: parseInt(config.limit),
         z_score_threshold: parseFloat(config.threshold)
       }, { responseType: 'blob' })
       
       const url = window.URL.createObjectURL(new Blob([res.data]));
       const link = document.createElement('a');
       link.href = url;
       link.setAttribute('download', `pairs_analytics_${config.symbol_a}_${config.symbol_b}.csv`);
       document.body.appendChild(link);
       link.click();
       link.remove();
    } catch (err) {
       setError("Export failed")
    }
  }

  const mainChartData = data?.timestamps?.map((t, i) => ({
    time: new Date(t).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit', second:'2-digit' }),
    z_score: data.z_score[i],
    spread: data.spread[i]
  })) || []

  const formatCandle = (ohlcv) => {
     if (!ohlcv) return []
     return ohlcv.slice(-50).map(c => ({
        ...c,
        time: new Date(c.time).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' }),
        color: c.close > c.open ? '#10b981' : '#ef4444', 
        mid: (c.close + c.open) / 2, // for line approx
        range: [c.low, c.high]
     }))
  }
  
  const candlesA = formatCandle(data?.ohlcv_a)
  const candlesB = formatCandle(data?.ohlcv_b)

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30">
        
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-cyan-500 to-blue-600 p-2 rounded-lg shadow-lg shadow-cyan-500/20">
              <Activity className="text-white h-5 w-5" />
            </div>
            <div>
               <h1 className="font-bold text-xl tracking-wide bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                  Quant<span className="text-cyan-400">Pairs</span>
               </h1>
               <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Algorithmic Trading System</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             <div className={cn(
                "flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono border",
                status.running 
                   ? "bg-green-500/10 border-green-500/20 text-green-400" 
                   : "bg-slate-800 border-slate-700 text-slate-500"
             )}>
                <span className={cn("w-2 h-2 rounded-full", status.running ? "bg-green-400 animate-pulse" : "bg-slate-600")} />
                {status.running ? "SYSTEM ACTIVE" : "SYSTEM IDLE"}
             </div>
          </div>
        </div>
      </nav>

      <div className="max-w-[1600px] mx-auto p-6 grid grid-cols-12 gap-6">
        
        <div className="col-span-12 xl:col-span-3 space-y-6">
           
           <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                 <Radio size={14} /> Configuration
              </h2>
              
              <div className="space-y-4">
                 <div className="pt-2">
                    <label className="text-xs text-slate-500 font-medium ml-1 mb-1 block">Timeframe</label>
                    <div className="flex gap-2 p-1 bg-slate-950 rounded-lg border border-slate-800">
                       {config.timeframes.map((tf) => (
                          <button
                             key={tf}
                             onClick={() => setConfig({...config, timeframe: tf})}
                             className={cn(
                                "flex-1 py-1.5 text-xs font-mono font-medium rounded transition-all",
                                config.timeframe === tf 
                                   ? "bg-slate-800 text-white shadow-sm" 
                                   : "text-slate-500 hover:text-slate-300 hover:bg-slate-900"
                             )}
                          >
                             {tf}
                          </button>
                       ))}
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                       <label className="text-xs text-slate-500 font-medium ml-1">Symbol A</label>
                       <input 
                          value={config.symbol_a}
                          onChange={e => setConfig({...config, symbol_a: e.target.value})}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-cyan-500 font-mono focus:outline-none focus:border-cyan-500/50 transition-colors"
                       />
                    </div>
                    <div className="space-y-1">
                       <label className="text-xs text-slate-500 font-medium ml-1">Symbol B</label>
                       <input 
                          value={config.symbol_b}
                          onChange={e => setConfig({...config, symbol_b: e.target.value})}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-blue-500 font-mono focus:outline-none focus:border-blue-500/50 transition-colors" 
                       />
                    </div>
                 </div>

                 <div className="space-y-4 pt-4 border-t border-slate-800/50">
                    <div>
                        <div className="flex justify-between mb-1">
                            <label className="text-xs text-slate-500">Rolling Window</label>
                            <span className="text-xs font-mono text-cyan-400">{config.window}</span>
                        </div>
                        <input 
                            type="range" min="10" max="100" 
                            value={config.window}
                            onChange={(e) => setConfig({...config, window: e.target.value})}
                            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                        />
                    </div>
                    
                    <div>
                        <div className="flex justify-between mb-1">
                            <label className="text-xs text-slate-500">Alert Threshold</label>
                            <span className="text-xs font-mono text-rose-400">{config.threshold}</span>
                        </div>
                        <input 
                            type="range" min="1.0" max="5.0" step="0.1"
                            value={config.threshold}
                            onChange={(e) => setConfig({...config, threshold: e.target.value})}
                            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                        />
                    </div>
                    
                    <div>
                        <div className="flex justify-between mb-1">
                            <label className="text-xs text-slate-500">Data Limit</label>
                            <span className="text-xs font-mono text-slate-400">{config.limit}</span>
                        </div>
                        <input 
                            type="range" min="50" max="500" step="50"
                            value={config.limit}
                            onChange={(e) => setConfig({...config, limit: e.target.value})}
                            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-slate-500"
                        />
                    </div>
                 </div>
                 
                 <div className="pt-2 flex gap-3">
                    <button 
                       onClick={handleStart}
                       disabled={status.running || loading}
                       className="flex-1 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:hover:bg-cyan-600 text-white py-2.5 rounded-lg text-sm font-semibold shadow-lg shadow-cyan-900/20 transition-all flex items-center justify-center gap-2 group"
                    >
                       <Play size={14} className={cn("transition-transform group-hover:scale-110", status.running && "hidden")} /> 
                       {loading ? "Initializing..." : "Start System"}
                    </button>
                    
                    <button 
                       onClick={handleStop}
                       disabled={!status.running || loading}
                       className="w-12 bg-slate-800 hover:bg-rose-900/50 disabled:opacity-50 text-rose-400 hover:text-white border border-slate-700 hover:border-rose-500/30 rounded-lg flex items-center justify-center transition-all"
                       title="Stop System"
                    >
                       <Square size={16} fill="currentColor" />
                    </button>

                    <button 
                       onClick={handleExport}
                       disabled={!data}
                       className="w-12 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-400 hover:text-white border border-slate-700 rounded-lg flex items-center justify-center transition-all"
                       title="Export CSV"
                    >
                       <Download size={16} />
                    </button>
                 </div>
              </div>
           </div>

           <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                 <Zap size={14} /> Live Metrics
              </h2>
              
              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800/50">
                    <div className="text-xs text-slate-500 mb-1">Hedge Ratio (β)</div>
                    <div className="text-lg font-mono font-medium text-white">
                       {data?.hedge_ratio?.beta?.toFixed(4) ?? "---"}
                    </div>
                 </div>
                 <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800/50">
                    <div className="text-xs text-slate-500 mb-1">Half-Life</div>
                    <div className="text-lg font-mono font-medium text-white">
                       {data?.metrics?.half_life?.toFixed(1) ?? "---"}
                    </div>
                 </div>
              </div>
              
              <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800/50">
                 <div className="flex justify-between items-end mb-2">
                    <div className="text-xs text-slate-500">Current Z-Score</div>
                    <div className={cn(
                       "text-2xl font-mono font-bold",
                       Math.abs(data?.metrics?.current_z_score ?? 0) > 2 ? "text-rose-500" : "text-emerald-400"
                    )}>
                       {data?.metrics?.current_z_score?.toFixed(3) ?? "---"}
                    </div>
                 </div>
                 <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div 
                       className={cn("h-full transition-all duration-500", 
                          Math.abs(data?.metrics?.current_z_score ?? 0) > 2 ? "bg-rose-500" : "bg-emerald-500"
                       )}
                       style={{ width: `${Math.min(Math.abs((data?.metrics?.current_z_score ?? 0) * 20), 100)}%` }}
                    />
                 </div>
              </div>
              
              <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800/50 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Decorrelation</span>
                  <span className="text-sm font-mono text-purple-400">
                     {data ? ((1 - Math.abs(data.correlation)) * 100).toFixed(1) : 0}%
                  </span>
              </div>
           </div>
           
           <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex-1 min-h-[200px] flex flex-col">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                 <AlertTriangle size={14} /> System Alerts
              </h2>
              
              <div className="space-y-3 overflow-y-auto max-h-[300px] pr-1 no-scrollbar">
                 {data?.alerts?.length > 0 ? (
                    data.alerts.map((alert, idx) => (
                       <div key={idx} className="group bg-slate-950/40 hover:bg-slate-950/80 border border-slate-800/50 hover:border-rose-500/30 rounded-lg p-3 transition-all">
                          <div className="flex justify-between items-center mb-1">
                             <div className="flex items-center gap-2">
                                <TrendingUp size={12} className="text-rose-400" />
                                <span className="text-xs font-bold text-slate-200 uppercase tracking-wide">
                                   {alert.alert_type.replace(/_/g, ' ')}
                                </span>
                             </div>
                             <span className="text-[10px] font-mono text-slate-600 group-hover:text-slate-500">
                                {new Date(alert.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}
                             </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-slate-400 font-mono">
                                {alert.message.replace('Z-Score Alert: ', '')}
                            </p>
                          </div>
                       </div>
                    ))
                 ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-2 py-8">
                       <div className="p-3 bg-slate-950 rounded-full">
                          <AlertTriangle size={16} className="opacity-20" />
                       </div>
                       <span className="text-xs italic">No active alerts</span>
                    </div>
                 )}
              </div>
           </div>

        </div>

        <div className="col-span-12 xl:col-span-9 space-y-6">
           
           {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-200 px-4 py-3 rounded-lg flex items-center gap-3">
                 <AlertTriangle size={18} /> {error}
              </div>
           )}
           
           {status.running && mainChartData.length === 0 && !error && (
              <div className="bg-blue-500/10 border border-blue-500/20 text-blue-200 px-4 py-8 rounded-lg text-center animate-pulse">
                 System Initializing... Buffering market data...
              </div>
           )}

           <div className="bg-slate-900 border border-slate-800 rounded-xl p-1 shadow-xl overflow-hidden relative group">
              <div className="absolute top-5 left-5 z-10 pointer-events-none">
                 <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                    <TrendingUp className="text-cyan-500" size={18} /> Statistical Arbitrage Signal
                 </h2>
                 <p className="text-xs text-slate-500 font-mono">Real-time Z-Score Deviation</p>
              </div>
              
              <div className="h-[450px] w-full pt-20 pr-4 pb-2">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mainChartData} margin={{ top: 10, right: 10, left: 15, bottom: 20 }}>
                       <defs>
                          <linearGradient id="colorZ" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis 
                          dataKey="time" 
                          stroke="#475569" 
                          fontSize={11} 
                          tickMargin={10}
                          minTickGap={30}
                       >
                          <Label value="Time" offset={0} position="insideBottom" dy={10} fill="#64748b" fontSize={12} />
                       </XAxis>
                       <YAxis 
                          domain={[-4, 4]} 
                          stroke="#475569" 
                          fontSize={11}
                          tickCount={9} 
                       >
                          <Label value="Z-Score" angle={-90} position="insideLeft" dx={-10} style={{ textAnchor: 'middle' }} fill="#64748b" fontSize={12} />
                       </YAxis>
                       <Tooltip content={<CustomTooltip />} />
                       
                       <ReferenceLine y={2} stroke="#ef4444" strokeDasharray="3 3" strokeOpacity={0.8} />
                       <ReferenceLine y={-2} stroke="#10b981" strokeDasharray="3 3" strokeOpacity={0.8} />
                       <ReferenceLine y={0} stroke="#cbd5e1" strokeWidth={0.5} strokeOpacity={0.5} />
                       
                       <Area 
                          type="monotone" 
                          dataKey="z_score" 
                          stroke="#06b6d4" 
                          fill="url(#colorZ)" 
                          strokeWidth={2}
                          animationDuration={500}
                       />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-slate-300 flex items-center gap-2">
                       <span className="w-2 h-2 rounded-sm bg-cyan-500"></span> {config.symbol_a.toUpperCase()}
                    </h3>
                    <span className="text-xs font-mono text-slate-500">last {candlesA.length} bars</span>
                 </div>
                 <div className="h-[250px] w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={candlesA} margin={{ top: 5, right: 10, left: 15, bottom: 20 }}>
                          <defs>
                             <linearGradient id="colorA" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                             </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="time" stroke="#475569" fontSize={10} minTickGap={30} tickMargin={10}>
                             <Label value="Time" offset={0} position="insideBottom" dy={10} fill="#64748b" fontSize={10} />
                          </XAxis>
                          <YAxis domain={['auto', 'auto']} stroke="#475569" fontSize={10} width={40}>
                             <Label value="Price" angle={-90} position="insideLeft" dx={-10} style={{ textAnchor: 'middle' }} fill="#64748b" fontSize={10} />
                          </YAxis>
                          <Tooltip content={<CustomTooltip />} />
                          <Area type="monotone" dataKey="close" stroke="#06b6d4" fill="url(#colorA)" strokeWidth={1.5} dot={false} />
                       </AreaChart>
                    </ResponsiveContainer>
                 </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-slate-300 flex items-center gap-2">
                       <span className="w-2 h-2 rounded-sm bg-blue-500"></span> {config.symbol_b.toUpperCase()}
                    </h3>
                    <span className="text-xs font-mono text-slate-500">last {candlesB.length} bars</span>
                 </div>
                 <div className="h-[250px] w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={candlesB} margin={{ top: 5, right: 10, left: 15, bottom: 20 }}>
                          <defs>
                             <linearGradient id="colorB" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                             </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="time" stroke="#475569" fontSize={10} minTickGap={30} tickMargin={10}>
                             <Label value="Time" offset={0} position="insideBottom" dy={10} fill="#64748b" fontSize={10} />
                          </XAxis>
                          <YAxis domain={['auto', 'auto']} stroke="#475569" fontSize={10} width={40}>
                             <Label value="Price" angle={-90} position="insideLeft" dx={-10} style={{ textAnchor: 'middle' }} fill="#64748b" fontSize={10} />
                          </YAxis>
                          <Tooltip content={<CustomTooltip />} />
                          <Area type="monotone" dataKey="close" stroke="#3b82f6" fill="url(#colorB)" strokeWidth={1.5} dot={false} />
                       </AreaChart>
                    </ResponsiveContainer>
                 </div>
              </div>

           </div>
           
        </div>
      </div>
    </div>
  )
}

export default App
