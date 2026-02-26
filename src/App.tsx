import { useState, useRef, useEffect } from 'react';
import { useTripStore } from './store/useTripStore';
import { calculateSettlements } from './utils/settlement';
import { toPng } from 'html-to-image';
import { Plus, Download, RefreshCcw, Moon, Sun, Share2 } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL, 
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function App() {
  const { members, expenses, addMember, addExpense, theme, toggleTheme, resetTrip }: any = useTripStore();
  
  const [name, setName] = useState('');
  const [amt, setAmt] = useState('');
  const [payer, setPayer] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isUnequal, setIsUnequal] = useState(false);
  const [customAllocations, setCustomAllocations] = useState<Record<string, string>>({});
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tripId = params.get('tripId');
    if (tripId) {
      const loadTrip = async () => {
        const { data, error } = await supabase.from('trip_sync').select('data').eq('id', tripId).single();
        if (data && !error) {
          useTripStore.setState({ members: data.data.members, expenses: data.data.expenses });
        }
      };
      loadTrip();
    }
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    theme === 'dark' ? root.classList.add('dark') : root.classList.remove('dark');
  }, [theme]);

  const settlements = calculateSettlements(members, expenses);

  // Logic to calculate how much of the total amount is yet to be assigned to members
  const totalAssigned = Object.values(customAllocations).reduce((acc, val) => acc + Number(val || 0), 0);
  const remainingBalance = Number(amt || 0) - totalAssigned;

  const handleAddMember = () => {
    if (name.trim()) { addMember(name); setName(''); }
  };

  const handleAddExpense = () => {
    if (!payer || !amt) return;
    let allocations: Record<string, number> | undefined = undefined;

    if (isUnequal) {
      allocations = {};
      members.forEach((m: any) => {
        allocations![m.id] = Number(customAllocations[m.id] || 0);
      });
    }

    addExpense(payer, Number(amt), allocations);
    setAmt(''); setPayer(''); setCustomAllocations({}); setIsUnequal(false);
  };

  const handleShare = async () => {
    try {
      setIsSyncing(true);
      const { data, error } = await supabase.from('trip_sync').insert([{ data: { members, expenses } }]).select();
      if (error) throw error;
      const shareUrl = `${window.location.origin}?tripId=${data[0].id}`;
      window.open(`https://wa.me/?text=${encodeURIComponent('View our split summary: ' + shareUrl)}`, '_blank');
    } catch (err) { alert("Sync failed. Check Supabase keys."); } finally { setIsSyncing(false); }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] text-slate-900 dark:text-slate-100 p-6 transition-colors duration-500 font-sans">
      <div className="max-w-md mx-auto space-y-8">
        
        {/* Header - Brand Identity */}
        <header className="flex justify-between items-center py-4">
          <div className="flex flex-col">
            <h1 className="text-3xl font-[900] text-indigo-600 dark:text-indigo-400 tracking-tighter italic leading-none">
              SPLIT.IT
            </h1>
            <span className="text-[10px] font-bold opacity-40 uppercase tracking-[0.2em] ml-1">Beta v1.0</span>
          </div>
          <div className="flex gap-3">
            <button onClick={toggleTheme} className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-indigo-500/5 border border-slate-100 dark:border-slate-700 active:scale-90 transition-all">
              {theme === 'light' ? <Moon size={20} className="text-slate-600"/> : <Sun size={20} className="text-yellow-400"/>}
            </button>
            <button onClick={() => confirm("Wipe current trip?") && resetTrip()} className="p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-2xl shadow-xl shadow-rose-500/5 active:scale-90 transition-all">
              <RefreshCcw size={20}/>
            </button>
          </div>
        </header>

        {/* Step 1: Members - Card Style */}
        <section className="group bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-50 dark:border-slate-700 transition-all hover:border-indigo-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-4 bg-indigo-500 rounded-full" />
            <label className="text-[11px] font-black uppercase tracking-widest opacity-40">The Squad</label>
          </div>
          <div className="flex gap-2 mb-5">
            <input value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddMember()} placeholder="Add friend..." className="flex-1 p-4 bg-slate-50 dark:bg-slate-900 rounded-[1.2rem] outline-none ring-indigo-400/20 focus:ring-4 transition-all font-medium"/>
            <button onClick={handleAddMember} className="bg-indigo-600 hover:bg-indigo-700 text-white w-14 rounded-[1.2rem] shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-95 flex items-center justify-center"><Plus /></button>
          </div>
          <div className="flex flex-wrap gap-2">
            {members.map((m: any) => (
              <span key={m.id} className="bg-indigo-50/50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 px-4 py-2 rounded-xl text-xs font-bold border border-indigo-100/50 dark:border-indigo-500/20 animate-in zoom-in-95 duration-300">
                {m.name}
              </span>
            ))}
          </div>
        </section>

        {/* Step 2: Expense - Custom Dropdown & Input Style */}
        <section className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-50 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-4 bg-emerald-500 rounded-full" />
            <label className="text-[11px] font-black uppercase tracking-widest opacity-40">Expense Details</label>
          </div>
          <div className="space-y-3">
            <select value={payer} onChange={e => setPayer(e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-slate-900 rounded-[1.2rem] outline-none font-bold text-slate-500 appearance-none border-none cursor-pointer">
              <option value="">Who paid the bill?</option>
              {members.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                <input type="number" value={amt} onChange={e => setAmt(e.target.value)} placeholder="0.00" className="w-full p-4 pl-8 bg-slate-50 dark:bg-slate-900 rounded-[1.2rem] outline-none font-black text-xl"/>
              </div>
              <button onClick={handleAddExpense} className="bg-slate-900 dark:bg-indigo-500 text-white px-8 rounded-[1.2rem] font-black hover:opacity-90 active:scale-95 transition-all shadow-lg">ADD</button>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-6 px-1">
            <button 
              onClick={() => setIsUnequal(!isUnequal)}
              className={`text-[11px] font-bold px-4 py-2 rounded-full transition-all border ${isUnequal ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-transparent text-slate-400 border-slate-200 dark:border-slate-700'}`}
            >
              {isUnequal ? '✓ Itemized Split' : '+ Custom Split'}
            </button>
          </div>

          {isUnequal && (
            <div className="mt-4 space-y-3 p-5 bg-slate-50 dark:bg-slate-900/80 rounded-[1.5rem] border border-indigo-50 dark:border-indigo-900/20 animate-in slide-in-from-top-4 duration-500">
              <div className="flex justify-between items-end mb-2">
                 <span className="text-[10px] font-black text-indigo-500 uppercase">Share per person</span>
                 <div className="text-right">
                   <span className={`text-lg font-black ${remainingBalance === 0 ? 'text-emerald-500' : 'text-rose-500'}`}>₹{remainingBalance}</span>
                   <span className="text-[8px] block opacity-40 font-bold uppercase tracking-tighter">Remaining</span>
                 </div>
              </div>
              {members.map((m: any) => (
                <div key={m.id} className="flex justify-between items-center group/item">
                  <span className="text-sm font-bold opacity-70 group-hover/item:opacity-100 transition-opacity">{m.name}</span>
                  <input type="number" placeholder="0" value={customAllocations[m.id] || ''} onChange={(e) => setCustomAllocations({...customAllocations, [m.id]: e.target.value})} className="w-24 p-2 bg-white dark:bg-slate-800 rounded-xl text-right text-sm font-black border border-slate-100 dark:border-slate-700 outline-none focus:ring-2 ring-indigo-500/20 transition-all"/>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Results - Premium Card Design */}
        <section ref={ref} className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-indigo-700 dark:from-indigo-500 dark:to-indigo-600 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-indigo-500/30">
          <div className="relative z-10">
            <h2 className="text-2xl font-[900] mb-8 tracking-tighter italic uppercase flex items-center gap-3">
              Settlements
              <div className="h-px flex-1 bg-white/20" />
            </h2>
            {settlements.length === 0 ? (
              <div className="py-10 text-center opacity-40 font-bold italic tracking-tight">No debts yet. Happy splitting!</div>
            ) : (
              <div className="space-y-4">
                {settlements.map((s: any, i: number) => (
                  <div key={i} className="flex justify-between items-center bg-white/10 backdrop-blur-xl p-5 rounded-[1.8rem] border border-white/10 shadow-inner">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black opacity-50 uppercase tracking-widest mb-1">From {s.from}</span>
                      <span className="font-bold text-lg tracking-tight">Pay to {s.to}</span>
                    </div>
                    <span className="font-[900] text-3xl text-yellow-300 tracking-tighter">₹{s.amount}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Decorative background shape */}
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
        </section>

        {/* Action Buttons */}
        {members.length > 0 && (
          <footer className="grid grid-cols-2 gap-4 pb-12">
            <button onClick={() => ref.current && toPng(ref.current, { backgroundColor: theme === 'dark' ? '#1E293B' : '#F8FAFC' }).then(data => { const l = document.createElement('a'); l.download='bill.png'; l.href=data; l.click(); })} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white p-5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col items-center gap-2 border border-slate-100 dark:border-slate-700">
              <Download size={18} className="text-indigo-500"/> Save Image
            </button>
            <button onClick={handleShare} disabled={isSyncing} className="bg-slate-900 dark:bg-indigo-500 text-white p-5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-xl flex flex-col items-center gap-2 disabled:opacity-50">
              <Share2 size={18} className={isSyncing ? "animate-spin" : ""}/> {isSyncing ? "Syncing" : "WhatsApp"}
            </button>
          </footer>
        )}
      </div>
    </div>
  );
}
