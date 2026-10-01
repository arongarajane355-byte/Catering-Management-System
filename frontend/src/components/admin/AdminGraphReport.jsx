import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Calendar, TrendingUp, DollarSign, Receipt, CreditCard,
  BarChart3, RefreshCw, Printer, Download, Filter
} from 'lucide-react';

const AdminGraphReport = ({ fallbackBookings = [], fallbackTransactions = [] }) => {
  // Period filter state
  const [period, setPeriod] = useState('monthly'); // 'monthly' | 'yearly' | 'from_to'
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [dateBasis, setDateBasis] = useState('created_at'); // 'created_at' | 'event_date'
  const [chartType, setChartType] = useState('bars'); // 'bars' | 'area'
  const [metricView, setMetricView] = useState('financial'); // 'financial' | 'bookings' | 'combined'

  // Custom From - To dates
  const todayStr = new Date().toISOString().slice(0, 10);
  const thirtyDaysAgoStr = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const [fromDate, setFromDate] = useState(thirtyDaysAgoStr);
  const [toDate, setToDate] = useState(todayStr);
  const [activePreset, setActivePreset] = useState('30days');

  // Data state
  const [loading, setLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [availableYears, setAvailableYears] = useState([new Date().getFullYear()]);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Fetch data whenever filters change
  useEffect(() => {
    fetchAnalytics();
  }, [period, selectedYear, fromDate, toDate, dateBasis]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const params = {
        period,
        year: selectedYear,
        date_basis: dateBasis,
      };
      if (period === 'from_to') {
        params.from = fromDate;
        params.to = toDate;
      }
      const res = await api.get('/admin/reports/analytics', { params });
      if (res.data) {
        setAnalyticsData(res.data);
        if (res.data.available_years && res.data.available_years.length > 0) {
          setAvailableYears(res.data.available_years);
        }
      }
    } catch (err) {
      console.warn('Backend analytics endpoint error, computing fallback:', err);
      computeFallbackAnalytics();
    } finally {
      setLoading(false);
    }
  };

  // Preset Date Range Helper
  const applyPreset = (presetKey) => {
    setActivePreset(presetKey);
    const now = new Date();
    const end = now.toISOString().slice(0, 10);
    let start = '';

    if (presetKey === '7days') {
      start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    } else if (presetKey === '30days') {
      start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    } else if (presetKey === 'this_month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    } else if (presetKey === 'last_3months') {
      start = new Date(now.getFullYear(), now.getMonth() - 2, 1).toISOString().slice(0, 10);
    } else if (presetKey === 'ytd') {
      start = `${now.getFullYear()}-01-01`;
    } else if (presetKey === 'all') {
      start = '2024-01-01';
    }
    if (start) {
      setFromDate(start);
      setToDate(end);
    }
  };

  // Fallback computation from raw bookings & payments if needed
  const computeFallbackAnalytics = () => {
    const dateField = dateBasis === 'event_date' ? 'event_date' : 'created_at';
    let timeline = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    if (period === 'yearly') {
      const yearMap = {};
      fallbackBookings.forEach((b) => {
        const y = new Date(b[dateField] || b.created_at).getFullYear();
        if (!yearMap[y]) yearMap[y] = { label: String(y), year: y, billed_amount: 0, collected_amount: 0, bookings_count: 0, completed_count: 0, payments_count: 0 };
        yearMap[y].billed_amount += parseFloat(b.total_amount || 0);
        yearMap[y].bookings_count += 1;
        if (b.status === 'completed') yearMap[y].completed_count += 1;
      });
      fallbackTransactions.forEach((tx) => {
        const y = new Date(tx.payment_date).getFullYear();
        if (!yearMap[y]) yearMap[y] = { label: String(y), year: y, billed_amount: 0, collected_amount: 0, bookings_count: 0, completed_count: 0, payments_count: 0 };
        yearMap[y].collected_amount += parseFloat(tx.amount_paid || 0);
        yearMap[y].payments_count += 1;
      });
      timeline = Object.values(yearMap).sort((a, b) => a.year - b.year);
    } else if (period === 'monthly') {
      timeline = monthNames.map((name, idx) => {
        const m = idx;
        const bInM = fallbackBookings.filter((b) => {
          const d = new Date(b[dateField] || b.created_at);
          return d.getFullYear() === selectedYear && d.getMonth() === m;
        });
        const pInM = fallbackTransactions.filter((tx) => {
          const d = new Date(tx.payment_date);
          return d.getFullYear() === selectedYear && d.getMonth() === m;
        });
        const billed = bInM.reduce((acc, b) => acc + parseFloat(b.total_amount || 0), 0);
        const collected = pInM.reduce((acc, p) => acc + parseFloat(p.amount_paid || 0), 0);
        const completed = bInM.filter((b) => b.status === 'completed').length;
        return {
          label: name,
          month: idx + 1,
          year: selectedYear,
          billed_amount: billed,
          collected_amount: collected,
          bookings_count: bInM.length,
          completed_count: completed,
          payments_count: pInM.length,
        };
      });
    } else {
      // From - To
      const start = new Date(fromDate + 'T00:00:00');
      const end = new Date(toDate + 'T23:59:59');
      const bFiltered = fallbackBookings.filter((b) => {
        const d = new Date(b[dateField] || b.created_at);
        return d >= start && d <= end;
      });
      const pFiltered = fallbackTransactions.filter((tx) => {
        const d = new Date(tx.payment_date);
        return d >= start && d <= end;
      });
      const dayMap = {};
      const curr = new Date(start);
      while (curr <= end) {
        const ds = curr.toISOString().slice(0, 10);
        const lbl = `${curr.toLocaleDateString('en-US', { month: 'short' })} ${curr.getDate()}`;
        dayMap[ds] = { label: lbl, date: ds, billed_amount: 0, collected_amount: 0, bookings_count: 0, completed_count: 0, payments_count: 0 };
        curr.setDate(curr.getDate() + 1);
      }
      bFiltered.forEach((b) => {
        const ds = new Date(b[dateField] || b.created_at).toISOString().slice(0, 10);
        if (dayMap[ds]) {
          dayMap[ds].billed_amount += parseFloat(b.total_amount || 0);
          dayMap[ds].bookings_count += 1;
          if (b.status === 'completed') dayMap[ds].completed_count += 1;
        }
      });
      pFiltered.forEach((tx) => {
        const ds = new Date(tx.payment_date).toISOString().slice(0, 10);
        if (dayMap[ds]) {
          dayMap[ds].collected_amount += parseFloat(tx.amount_paid || 0);
          dayMap[ds].payments_count += 1;
        }
      });
      timeline = Object.values(dayMap);
    }

    const total_billed = timeline.reduce((acc, t) => acc + t.billed_amount, 0);
    const total_collected = timeline.reduce((acc, t) => acc + t.collected_amount, 0);
    const total_bookings = timeline.reduce((acc, t) => acc + t.bookings_count, 0);
    const completed_bookings = timeline.reduce((acc, t) => acc + t.completed_count, 0);
    const outstanding_balance = Math.max(0, total_billed - total_collected);
    const completion_rate = total_bookings > 0 ? parseFloat(((completed_bookings / total_bookings) * 100).toFixed(1)) : 0;
    const avg_booking_value = total_bookings > 0 ? parseFloat((total_billed / total_bookings).toFixed(2)) : 0;

    setAnalyticsData({
      period,
      year: selectedYear,
      timeline,
      summary: {
        total_billed,
        total_collected,
        outstanding_balance,
        total_bookings,
        completed_bookings,
        completion_rate,
        avg_booking_value,
      },
      status_breakdown: [],
      event_type_breakdown: [],
      payment_methods: [],
    });
  };

  const timeline = analyticsData?.timeline || [];
  const summary = analyticsData?.summary || {
    total_billed: 0,
    total_collected: 0,
    outstanding_balance: 0,
    total_bookings: 0,
    completed_bookings: 0,
    completion_rate: 0,
    avg_booking_value: 0,
  };

  // Maximum scales for charts
  const maxFinancial = Math.max(1000, ...timeline.map((t) => Math.max(t.billed_amount, t.collected_amount)));
  const maxBookings = Math.max(5, ...timeline.map((t) => t.bookings_count));

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Period/Date', 'Bookings Count', 'Completed Bookings', 'Total Billed (PHP)', 'Total Collected (PHP)', 'Outstanding (PHP)', 'Collection Rate (%)'];
    const rows = timeline.map((item) => {
      const balance = Math.max(0, item.billed_amount - item.collected_amount);
      const rate = item.billed_amount > 0 ? ((item.collected_amount / item.billed_amount) * 100).toFixed(1) + '%' : '100%';
      return [
        `"${item.label || item.date}"`,
        item.bookings_count,
        item.completed_count,
        item.billed_amount.toFixed(2),
        item.collected_amount.toFixed(2),
        balance.toFixed(2),
        `"${rate}"`,
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Catering_Report_${period}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Chart Dimensions & Layout
  const chartHeight = 280;
  const chartPaddingTop = 30;
  const chartPaddingBottom = 35;
  const chartPaddingLeft = 65;
  const chartPaddingRight = 20;

  // Format Currency
  const fmtMoney = (val) => '₱' + parseFloat(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtShortMoney = (val) => {
    const num = parseFloat(val || 0);
    if (num >= 1000000) return '₱' + (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return '₱' + (num / 1000).toFixed(1) + 'k';
    return '₱' + num.toFixed(0);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* ── TOP CONTROL BAR ── */}
      <div
        className="card p-6"
        style={{
          background: 'linear-gradient(135deg, rgba(13, 21, 38, 0.95), rgba(19, 30, 53, 0.9))',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-lg)',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span
                style={{
                  display: 'inline-flex',
                  padding: '0.4rem',
                  borderRadius: 'var(--r-md)',
                  background: 'var(--brand-dim)',
                  color: 'var(--brand)',
                }}
              >
                <TrendingUp size={22} />
              </span>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                Visual Analytics & Graph Reports
              </h2>
            </div>
            <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Interactive revenue analytics, payment collections, and event booking trends with monthly, yearly, and custom date range filters.
            </p>
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={fetchAnalytics}
              className="btn btn-secondary btn-sm"
              disabled={loading}
              title="Refresh graph data"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
            <button
              onClick={handleExportCSV}
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              title="Export timeline data to CSV"
            >
              <Download size={14} /> Export CSV
            </button>
            <button
              onClick={() => window.print()}
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              title="Print graph report"
            >
              <Printer size={14} /> Print
            </button>
          </div>
        </div>

        {/* ── PERIOD TOGGLES & FILTERS ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border)',
          }}
        >
          {/* Main Period Selector Tabs */}
          <div
            style={{
              display: 'inline-flex',
              padding: '0.25rem',
              background: 'var(--bg-base)',
              borderRadius: 'var(--r-md)',
              border: '1px solid var(--border)',
              gap: '0.25rem',
            }}
          >
            <button
              onClick={() => setPeriod('monthly')}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: 'var(--r-sm)',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'all var(--t-fast)',
                background: period === 'monthly' ? 'var(--brand)' : 'transparent',
                color: period === 'monthly' ? '#fff' : 'var(--text-secondary)',
              }}
            >
              <Calendar size={14} /> Monthly View
            </button>

            <button
              onClick={() => setPeriod('yearly')}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: 'var(--r-sm)',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'all var(--t-fast)',
                background: period === 'yearly' ? 'var(--brand)' : 'transparent',
                color: period === 'yearly' ? '#fff' : 'var(--text-secondary)',
              }}
            >
              <BarChart3 size={14} /> Yearly View
            </button>

            <button
              onClick={() => setPeriod('from_to')}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: 'var(--r-sm)',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'all var(--t-fast)',
                background: period === 'from_to' ? 'var(--brand)' : 'transparent',
                color: period === 'from_to' ? '#fff' : 'var(--text-secondary)',
              }}
            >
              <Filter size={14} /> From - To Range
            </button>
          </div>

          {/* Contextual Sub-filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* Monthly Year Selector */}
            {period === 'monthly' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Year:</span>
                <select
                  className="form-select"
                  style={{ width: 'auto', padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                >
                  {availableYears.map((yr) => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Date Basis: Booked Date vs Event Date */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Date Basis:</span>
              <select
                className="form-select"
                style={{ width: 'auto', padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}
                value={dateBasis}
                onChange={(e) => setDateBasis(e.target.value)}
              >
                <option value="created_at">Date Booked (Creation)</option>
                <option value="event_date">Event Date (Schedule)</option>
              </select>
            </div>

            {/* Metric Mode Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>View:</span>
              <select
                className="form-select"
                style={{ width: 'auto', padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}
                value={metricView}
                onChange={(e) => setMetricView(e.target.value)}
              >
                <option value="financial">Revenue & Collections (₱)</option>
                <option value="bookings">Bookings & Status Volume</option>
                <option value="combined">Combined Overview</option>
              </select>
            </div>

            {/* Chart Style Toggle */}
            <div
              style={{
                display: 'inline-flex',
                padding: '0.2rem',
                background: 'var(--bg-base)',
                borderRadius: 'var(--r-sm)',
                border: '1px solid var(--border)',
              }}
            >
              <button
                onClick={() => setChartType('bars')}
                title="Bar Chart"
                style={{
                  padding: '0.3rem 0.6rem',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  borderRadius: 'var(--r-sm)',
                  border: 'none',
                  cursor: 'pointer',
                  background: chartType === 'bars' ? 'var(--brand-dim)' : 'transparent',
                  color: chartType === 'bars' ? 'var(--brand)' : 'var(--text-muted)',
                }}
              >
                Bars
              </button>
              <button
                onClick={() => setChartType('area')}
                title="Area / Trend Line Chart"
                style={{
                  padding: '0.3rem 0.6rem',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  borderRadius: 'var(--r-sm)',
                  border: 'none',
                  cursor: 'pointer',
                  background: chartType === 'area' ? 'var(--brand-dim)' : 'transparent',
                  color: chartType === 'area' ? 'var(--brand)' : 'var(--text-muted)',
                }}
              >
                Trend Line
              </button>
            </div>
          </div>
        </div>

        {/* ── FROM - TO SPECIFIC CONTROLS & PRESETS ── */}
        {period === 'from_to' && (
          <div
            style={{
              marginTop: '1rem',
              padding: '0.85rem 1rem',
              background: 'rgba(6, 12, 24, 0.6)',
              borderRadius: 'var(--r-md)',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
          >
            {/* Date Pickers */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>From:</span>
                <input
                  type="date"
                  className="form-input"
                  style={{ width: 'auto', padding: '0.35rem 0.65rem', fontSize: '0.82rem' }}
                  value={fromDate}
                  onChange={(e) => {
                    setFromDate(e.target.value);
                    setActivePreset('custom');
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>To:</span>
                <input
                  type="date"
                  className="form-input"
                  style={{ width: 'auto', padding: '0.35rem 0.65rem', fontSize: '0.82rem' }}
                  value={toDate}
                  onChange={(e) => {
                    setToDate(e.target.value);
                    setActivePreset('custom');
                  }}
                />
              </div>
            </div>

            {/* Quick Preset Pills */}
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginRight: '0.2rem' }}>Presets:</span>
              {[
                { key: '7days', label: 'Last 7 Days' },
                { key: '30days', label: 'Last 30 Days' },
                { key: 'this_month', label: 'This Month' },
                { key: 'last_3months', label: 'Last 3 Months' },
                { key: 'ytd', label: 'Year To Date' },
                { key: 'all', label: 'All Time' },
              ].map((p) => (
                <button
                  key={p.key}
                  onClick={() => applyPreset(p.key)}
                  style={{
                    padding: '0.25rem 0.65rem',
                    fontSize: '0.75rem',
                    borderRadius: 'var(--r-full)',
                    border: activePreset === p.key ? '1px solid var(--brand)' : '1px solid var(--border)',
                    background: activePreset === p.key ? 'var(--brand-dim)' : 'transparent',
                    color: activePreset === p.key ? 'var(--brand)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontWeight: activePreset === p.key ? 700 : 500,
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── MAIN INTERACTIVE GRAPH CANVAS ── */}
      <div className="card p-6" style={{ position: 'relative' }}>
        {/* Graph Header & Legend */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart3 size={18} style={{ color: 'var(--brand)' }} />
              {period === 'monthly' && `Monthly Performance (${selectedYear})`}
              {period === 'yearly' && 'Year-Over-Year Multi-Year Comparison'}
              {period === 'from_to' && `Range Performance (${fromDate} to ${toDate})`}
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Hover over bars and data points to inspect detailed breakdown.
            </span>
          </div>

          {/* Graph Legend */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', fontSize: '0.8rem' }}>
            {(metricView === 'financial' || metricView === 'combined') && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--brand)', display: 'inline-block' }} />
                  <span style={{ color: 'var(--text-secondary)' }}>Billed Contract (₱)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--success)', display: 'inline-block' }} />
                  <span style={{ color: 'var(--text-secondary)' }}>Collections Paid (₱)</span>
                </div>
              </>
            )}

            {(metricView === 'bookings' || metricView === 'combined') && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--info)', display: 'inline-block' }} />
                  <span style={{ color: 'var(--text-secondary)' }}>Total Bookings</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--purple)', display: 'inline-block' }} />
                  <span style={{ color: 'var(--text-secondary)' }}>Completed Events</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Empty state check */}
        {timeline.length === 0 ? (
          <div className="empty-state" style={{ padding: '3rem 1rem' }}>
            <div className="empty-icon"><Calendar size={28} /></div>
            <div className="empty-title">No data for selected period</div>
            <div className="empty-desc">Try changing the year or selecting an alternate date range.</div>
          </div>
        ) : (
          /* Responsive SVG Chart Container */
          <div style={{ width: '100%', overflowX: 'auto', position: 'relative' }}>
            {/* SVG Chart */}
            {(() => {
              const count = timeline.length;
              // Minimum width to avoid squished bars when lots of days
              const minWidth = Math.max(700, count * (period === 'from_to' ? 36 : 56));
              const svgWidth = minWidth;
              const innerWidth = svgWidth - chartPaddingLeft - chartPaddingRight;
              const innerHeight = chartHeight - chartPaddingTop - chartPaddingBottom;
              const colWidth = innerWidth / count;
              const barWidth = Math.min(24, Math.max(8, colWidth * 0.35));

              // Compute Y ticks (5 ticks)
              const yTicksCount = 4;
              const activeMax = metricView === 'bookings' ? maxBookings : maxFinancial;
              const yTickValues = Array.from({ length: yTicksCount + 1 }, (_, i) => (activeMax / yTicksCount) * i);

              // SVG Points for Trend Line
              const billedPoints = timeline.map((d, i) => {
                const x = chartPaddingLeft + i * colWidth + colWidth / 2;
                const ratio = d.billed_amount / maxFinancial;
                const y = chartPaddingTop + innerHeight - ratio * innerHeight;
                return `${x},${y}`;
              });

              const collectedPoints = timeline.map((d, i) => {
                const x = chartPaddingLeft + i * colWidth + colWidth / 2;
                const ratio = d.collected_amount / maxFinancial;
                const y = chartPaddingTop + innerHeight - ratio * innerHeight;
                return `${x},${y}`;
              });

              const bookingsPoints = timeline.map((d, i) => {
                const x = chartPaddingLeft + i * colWidth + colWidth / 2;
                const ratio = d.bookings_count / maxBookings;
                const y = chartPaddingTop + innerHeight - ratio * innerHeight;
                return `${x},${y}`;
              });

              return (
                <svg
                  viewBox={`0 0 ${svgWidth} ${chartHeight}`}
                  style={{ width: '100%', minWidth: `${svgWidth}px`, height: `${chartHeight}px`, overflow: 'visible' }}
                >
                  <defs>
                    <linearGradient id="brandBarGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f97316" stopOpacity="0.95" />
                      <stop offset="100%" stopColor="#ea580c" stopOpacity="0.4" />
                    </linearGradient>
                    <linearGradient id="successBarGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22c55e" stopOpacity="0.95" />
                      <stop offset="100%" stopColor="#16a34a" stopOpacity="0.4" />
                    </linearGradient>
                    <linearGradient id="infoBarGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.95" />
                      <stop offset="100%" stopColor="#0284c7" stopOpacity="0.4" />
                    </linearGradient>
                    <linearGradient id="purpleBarGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a855f7" stopOpacity="0.95" />
                      <stop offset="100%" stopColor="#9333ea" stopOpacity="0.4" />
                    </linearGradient>
                    <linearGradient id="areaBrandGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f97316" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#f97316" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="areaSuccessGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22c55e" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#22c55e" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid lines & Y-axis labels */}
                  {yTickValues.map((val, idx) => {
                    const y = chartPaddingTop + innerHeight - (idx / yTicksCount) * innerHeight;
                    return (
                      <g key={idx}>
                        <line
                          x1={chartPaddingLeft}
                          y1={y}
                          x2={svgWidth - chartPaddingRight}
                          y2={y}
                          stroke="rgba(255,255,255,0.06)"
                          strokeDasharray={idx === 0 ? 'none' : '3 3'}
                        />
                        <text
                          x={chartPaddingLeft - 8}
                          y={y + 4}
                          textAnchor="end"
                          fontSize="10"
                          fill="var(--text-muted)"
                          fontWeight="500"
                        >
                          {metricView === 'bookings' ? Math.round(val) : fmtShortMoney(val)}
                        </text>
                      </g>
                    );
                  })}

                  {/* Area Charts (if chartType === 'area') */}
                  {chartType === 'area' && (metricView === 'financial' || metricView === 'combined') && (
                    <>
                      {/* Billed Area */}
                      <polygon
                        points={`${chartPaddingLeft + colWidth / 2},${chartPaddingTop + innerHeight} ${billedPoints.join(' ')} ${chartPaddingLeft + (count - 1) * colWidth + colWidth / 2},${chartPaddingTop + innerHeight}`}
                        fill="url(#areaBrandGrad)"
                      />
                      <polyline
                        points={billedPoints.join(' ')}
                        fill="none"
                        stroke="#f97316"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Collected Area */}
                      <polygon
                        points={`${chartPaddingLeft + colWidth / 2},${chartPaddingTop + innerHeight} ${collectedPoints.join(' ')} ${chartPaddingLeft + (count - 1) * colWidth + colWidth / 2},${chartPaddingTop + innerHeight}`}
                        fill="url(#areaSuccessGrad)"
                      />
                      <polyline
                        points={collectedPoints.join(' ')}
                        fill="none"
                        stroke="#22c55e"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </>
                  )}

                  {chartType === 'area' && metricView === 'bookings' && (
                    <>
                      <polygon
                        points={`${chartPaddingLeft + colWidth / 2},${chartPaddingTop + innerHeight} ${bookingsPoints.join(' ')} ${chartPaddingLeft + (count - 1) * colWidth + colWidth / 2},${chartPaddingTop + innerHeight}`}
                        fill="rgba(56, 189, 248, 0.2)"
                      />
                      <polyline
                        points={bookingsPoints.join(' ')}
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </>
                  )}

                  {/* Columns / Bars & Interaction Zones */}
                  {timeline.map((item, idx) => {
                    const colX = chartPaddingLeft + idx * colWidth;
                    const centerX = colX + colWidth / 2;
                    const isHovered = hoveredIndex === idx;

                    // Bar heights
                    const billedHeight = maxFinancial > 0 ? (item.billed_amount / maxFinancial) * innerHeight : 0;
                    const collectedHeight = maxFinancial > 0 ? (item.collected_amount / maxFinancial) * innerHeight : 0;
                    const bookingsHeight = maxBookings > 0 ? (item.bookings_count / maxBookings) * innerHeight : 0;
                    const completedHeight = maxBookings > 0 ? (item.completed_count / maxBookings) * innerHeight : 0;

                    const groundY = chartPaddingTop + innerHeight;

                    return (
                      <g
                        key={idx}
                        onMouseEnter={() => setHoveredIndex(idx)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        style={{ cursor: 'pointer' }}
                      >
                        {/* Column hover background highlight */}
                        {isHovered && (
                          <rect
                            x={colX + 2}
                            y={chartPaddingTop}
                            width={colWidth - 4}
                            height={innerHeight}
                            fill="rgba(255, 255, 255, 0.04)"
                            rx="4"
                          />
                        )}

                        {/* Bar Rendering when in 'bars' mode */}
                        {chartType === 'bars' && (
                          <>
                            {metricView === 'financial' && (
                              <>
                                {/* Dual Bar: Billed (left) & Collected (right) */}
                                <rect
                                  x={centerX - barWidth - 1}
                                  y={groundY - billedHeight}
                                  width={barWidth}
                                  height={Math.max(billedHeight, 2)}
                                  rx="3"
                                  fill="url(#brandBarGrad)"
                                  stroke={isHovered ? '#fff' : 'none'}
                                  strokeWidth="1"
                                />
                                <rect
                                  x={centerX + 1}
                                  y={groundY - collectedHeight}
                                  width={barWidth}
                                  height={Math.max(collectedHeight, 2)}
                                  rx="3"
                                  fill="url(#successBarGrad)"
                                  stroke={isHovered ? '#fff' : 'none'}
                                  strokeWidth="1"
                                />
                              </>
                            )}

                            {metricView === 'bookings' && (
                              <>
                                <rect
                                  x={centerX - barWidth - 1}
                                  y={groundY - bookingsHeight}
                                  width={barWidth}
                                  height={Math.max(bookingsHeight, 2)}
                                  rx="3"
                                  fill="url(#infoBarGrad)"
                                  stroke={isHovered ? '#fff' : 'none'}
                                  strokeWidth="1"
                                />
                                <rect
                                  x={centerX + 1}
                                  y={groundY - completedHeight}
                                  width={barWidth}
                                  height={Math.max(completedHeight, 2)}
                                  rx="3"
                                  fill="url(#purpleBarGrad)"
                                  stroke={isHovered ? '#fff' : 'none'}
                                  strokeWidth="1"
                                />
                              </>
                            )}

                            {metricView === 'combined' && (
                              <>
                                {/* Billed Bar with collection fill overlay */}
                                <rect
                                  x={centerX - barWidth * 0.75}
                                  y={groundY - billedHeight}
                                  width={barWidth * 1.5}
                                  height={Math.max(billedHeight, 2)}
                                  rx="3"
                                  fill="url(#brandBarGrad)"
                                />
                                <rect
                                  x={centerX - barWidth * 0.75}
                                  y={groundY - collectedHeight}
                                  width={barWidth * 1.5}
                                  height={Math.max(collectedHeight, 2)}
                                  rx="3"
                                  fill="url(#successBarGrad)"
                                  opacity="0.85"
                                />
                              </>
                            )}
                          </>
                        )}

                        {/* Interactive Data Dots (for Line/Area or hovered points) */}
                        {chartType === 'area' && (
                          <>
                            {metricView === 'financial' && (
                              <>
                                <circle
                                  cx={centerX}
                                  cy={groundY - billedHeight}
                                  r={isHovered ? 6 : 3.5}
                                  fill="#f97316"
                                  stroke="#fff"
                                  strokeWidth="2"
                                />
                                <circle
                                  cx={centerX}
                                  cy={groundY - collectedHeight}
                                  r={isHovered ? 6 : 3.5}
                                  fill="#22c55e"
                                  stroke="#fff"
                                  strokeWidth="2"
                                />
                              </>
                            )}

                            {metricView === 'bookings' && (
                              <circle
                                cx={centerX}
                                cy={groundY - bookingsHeight}
                                r={isHovered ? 6 : 3.5}
                                fill="#38bdf8"
                                stroke="#fff"
                                strokeWidth="2"
                              />
                            )}
                          </>
                        )}

                        {/* X-axis Label */}
                        <text
                          x={centerX}
                          y={groundY + 18}
                          textAnchor="middle"
                          fontSize={period === 'from_to' && count > 15 ? '9' : '11'}
                          fill={isHovered ? 'var(--brand)' : 'var(--text-secondary)'}
                          fontWeight={isHovered ? '700' : '500'}
                        >
                          {item.label || item.date}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              );
            })()}

            {/* Hover Tooltip Overlay */}
            {hoveredIndex !== null && timeline[hoveredIndex] && (() => {
              const item = timeline[hoveredIndex];
              const balance = Math.max(0, item.billed_amount - item.collected_amount);
              const rate = item.billed_amount > 0 ? ((item.collected_amount / item.billed_amount) * 100).toFixed(1) : 100;

              return (
                <div
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '16px',
                    background: 'rgba(9, 14, 29, 0.95)',
                    border: '1px solid var(--border-strong)',
                    borderRadius: 'var(--r-md)',
                    padding: '0.75rem 1rem',
                    boxShadow: 'var(--shadow-lg)',
                    minWidth: '220px',
                    pointerEvents: 'none',
                    backdropFilter: 'blur(8px)',
                    zIndex: 20,
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.4rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.35rem', color: 'var(--text-primary)' }}>
                    {item.label || item.date} Summary
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Billed Contract:</span>
                      <strong style={{ color: 'var(--brand)' }}>{fmtMoney(item.billed_amount)}</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Collected Paid:</span>
                      <strong style={{ color: 'var(--success)' }}>{fmtMoney(item.collected_amount)}</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Outstanding:</span>
                      <strong style={{ color: balance > 0 ? 'var(--warning)' : 'var(--text-muted)' }}>{fmtMoney(balance)}</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', borderTop: '1px dashed var(--border)', paddingTop: '0.3rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Bookings (Events):</span>
                      <strong>{item.bookings_count} {item.completed_count > 0 && `(${item.completed_count} completed)`}</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Collection Rate:</span>
                      <strong style={{ color: parseFloat(rate) >= 90 ? 'var(--success)' : 'var(--amber)' }}>{rate}%</strong>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminGraphReport;
