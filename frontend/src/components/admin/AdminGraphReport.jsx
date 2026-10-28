import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Calendar, TrendingUp, DollarSign, Receipt, CreditCard,
  BarChart3, RefreshCw, Printer, Download, Filter
} from 'lucide-react';

const AdminGraphReport = ({ fallbackBookings = [], fallbackTransactions = [], staffBookings = [], staffPayments = [] }) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-12

  // Period filter state: 'weekly' | 'monthly' | 'yearly' | 'from_to'
  const [period, setPeriod] = useState('monthly');
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [weekOffset, setWeekOffset] = useState(0); // 0 = this week, -1 = last week
  const [dateBasis, setDateBasis] = useState('created_at'); // 'created_at' | 'event_date'
  const [chartType, setChartType] = useState('bars'); // 'bars' | 'area'
  const [metricView, setMetricView] = useState('financial'); // 'financial' | 'bookings' | 'combined'

  // Custom From - To dates
  const todayStr = now.toISOString().slice(0, 10);
  const thirtyDaysAgoStr = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const [fromDate, setFromDate] = useState(thirtyDaysAgoStr);
  const [toDate, setToDate] = useState(todayStr);
  const [activePreset, setActivePreset] = useState('30days');

  // Data state
  const [loading, setLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [availableYears, setAvailableYears] = useState([2024, 2025, 2026, 2027]);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const monthOptions = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  // Fetch data whenever filters change
  useEffect(() => {
    fetchAnalytics();
  }, [period, selectedYear, selectedMonth, weekOffset, fromDate, toDate, dateBasis]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const params = {
        period,
        year: selectedYear,
        month: selectedMonth,
        week_offset: weekOffset,
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
          const mergedYears = Array.from(new Set([...res.data.available_years, 2024, 2025, 2026, 2027])).sort((a, b) => a - b);
          setAvailableYears(mergedYears);
        }
      }
    } catch (err) {
      console.warn('Backend analytics endpoint error, computing fallback:', err);
      computeFallbackAnalytics();
    } finally {
      setLoading(false);
    }
  };

  // Preset Date Range Helper for Custom Range
  const applyPreset = (presetKey) => {
    setActivePreset(presetKey);
    const n = new Date();
    const end = n.toISOString().slice(0, 10);
    let start = '';

    if (presetKey === '7days') {
      start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    } else if (presetKey === '30days') {
      start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    } else if (presetKey === 'this_month') {
      start = new Date(n.getFullYear(), n.getMonth(), 1).toISOString().slice(0, 10);
    } else if (presetKey === 'last_3months') {
      start = new Date(n.getFullYear(), n.getMonth() - 2, 1).toISOString().slice(0, 10);
    } else if (presetKey === 'ytd') {
      start = `${n.getFullYear()}-01-01`;
    } else if (presetKey === 'all') {
      start = '2024-01-01';
    }
    if (start) {
      setFromDate(start);
      setToDate(end);
    }
  };

  // Fallback computation from raw bookings & payments if backend is unavailable
  const computeFallbackAnalytics = () => {
    const dateField = dateBasis === 'event_date' ? 'event_date' : 'created_at';
    let timeline = [];
    let rangeLabel = '';
    const monthShorts = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const fullMonthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    if (period === 'yearly') {
      rangeLabel = `Yearly: Full Year ${selectedYear} (${selectedYear}-01-01 - ${selectedYear}-12-31)`;
      timeline = monthShorts.map((name, idx) => {
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
    } else if (period === 'monthly') {
      const mIdx = selectedMonth - 1;
      const mName = fullMonthNames[mIdx] || `Month ${selectedMonth}`;
      const mShort = monthShorts[mIdx] || 'M';
      const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
      const startDStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`;
      const endDStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;
      rangeLabel = `Monthly: ${mName} ${selectedYear} (${startDStr} - ${endDStr})`;

      const dayMap = {};
      for (let day = 1; day <= daysInMonth; day++) {
        dayMap[day] = {
          label: `${mShort} ${day}`,
          day,
          date: `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
          billed_amount: 0,
          collected_amount: 0,
          bookings_count: 0,
          completed_count: 0,
          payments_count: 0,
        };
      }

      fallbackBookings.forEach((b) => {
        const d = new Date(b[dateField] || b.created_at);
        if (d.getFullYear() === selectedYear && d.getMonth() === mIdx) {
          const day = d.getDate();
          if (dayMap[day]) {
            dayMap[day].billed_amount += parseFloat(b.total_amount || 0);
            dayMap[day].bookings_count += 1;
            if (b.status === 'completed') dayMap[day].completed_count += 1;
          }
        }
      });

      fallbackTransactions.forEach((tx) => {
        const d = new Date(tx.payment_date);
        if (d.getFullYear() === selectedYear && d.getMonth() === mIdx) {
          const day = d.getDate();
          if (dayMap[day]) {
            dayMap[day].collected_amount += parseFloat(tx.amount_paid || 0);
            dayMap[day].payments_count += 1;
          }
        }
      });

      timeline = Object.values(dayMap);
    } else if (period === 'weekly') {
      const n = new Date();
      const currentDay = n.getDay();
      const diffToMon = (currentDay === 0 ? -6 : 1) - currentDay + (weekOffset * 7);
      const monDate = new Date(n);
      monDate.setDate(n.getDate() + diffToMon);
      monDate.setHours(0, 0, 0, 0);

      const sunDate = new Date(monDate);
      sunDate.setDate(monDate.getDate() + 6);
      const fromStr = monDate.toISOString().slice(0, 10);
      const toStr = sunDate.toISOString().slice(0, 10);
      const wTitle = weekOffset === 0 ? 'Current Week' : weekOffset === -1 ? 'Last Week' : 'Selected Week';
      rangeLabel = `Weekly: ${wTitle} (${fromStr} - ${toStr})`;

      const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const cur = new Date(monDate);
      for (let i = 0; i < 7; i++) {
        const dStr = cur.toISOString().slice(0, 10);
        const bInDay = fallbackBookings.filter((b) => {
          const d = new Date(b[dateField] || b.created_at).toISOString().slice(0, 10);
          return d === dStr;
        });
        const pInDay = fallbackTransactions.filter((tx) => {
          const d = new Date(tx.payment_date).toISOString().slice(0, 10);
          return d === dStr;
        });
        timeline.push({
          label: `${dayLabels[i]} (${cur.getMonth() + 1}/${cur.getDate()})`,
          date: dStr,
          billed_amount: bInDay.reduce((acc, b) => acc + parseFloat(b.total_amount || 0), 0),
          collected_amount: pInDay.reduce((acc, p) => acc + parseFloat(p.amount_paid || 0), 0),
          bookings_count: bInDay.length,
          completed_count: bInDay.filter((b) => b.status === 'completed').length,
          payments_count: pInDay.length,
        });
        cur.setDate(cur.getDate() + 1);
      }
    } else {
      // From - To
      const start = new Date(fromDate + 'T00:00:00');
      const end = new Date(toDate + 'T23:59:59');
      rangeLabel = `Custom Date Range: (${fromDate} - ${toDate})`;

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
      month: selectedMonth,
      range_label: rangeLabel,
      timeline,
      summary: {
        total_billed,
        total_collected,
        total_revenue: total_billed,
        total_transactions: total_bookings,
        avg_order_value: avg_booking_value,
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
    total_revenue: 0,
    total_transactions: 0,
    avg_order_value: 0,
    outstanding_balance: 0,
    total_bookings: 0,
    completed_bookings: 0,
    completion_rate: 0,
    avg_booking_value: 0,
  };

  // Range label description
  const computedRangeLabel = (() => {
    if (analyticsData?.range_label) return analyticsData.range_label;
    if (period === 'yearly') return `Yearly: Full Year ${selectedYear} (${selectedYear}-01-01 - ${selectedYear}-12-31)`;
    if (period === 'monthly') {
      const mObj = monthOptions.find(m => m.value === selectedMonth) || monthOptions[0];
      const dInM = new Date(selectedYear, selectedMonth, 0).getDate();
      return `Monthly: ${mObj.label} ${selectedYear} (${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01 - ${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(dInM).padStart(2, '0')})`;
    }
    if (period === 'weekly') {
      const wTitle = weekOffset === 0 ? 'Current Week' : 'Last Week';
      return `Weekly: ${wTitle}`;
    }
    return `Custom Date Range: (${fromDate} - ${toDate})`;
  })();

  // Staff attribution logic
  const isInSelectedPeriod = (value) => {
    if (!value) return false;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return false;
    if (period === 'yearly') return date.getFullYear() === selectedYear;
    if (period === 'monthly') return date.getFullYear() === selectedYear && date.getMonth() === (selectedMonth - 1);
    if (period === 'from_to') {
      const dateKey = date.toISOString().slice(0, 10);
      return dateKey >= fromDate && dateKey <= toDate;
    }
    return true;
  };

  const staffFinancialsById = {};
  staffBookings.forEach((booking) => {
    const staffId = booking.handled_by;
    if (!staffId || !isInSelectedPeriod(booking[dateBasis] || booking.created_at)) return;
    const staffKey = String(staffId);
    if (!staffFinancialsById[staffKey]) {
      staffFinancialsById[staffKey] = {
        staffId,
        name: `${booking.staff_firstname || ''} ${booking.staff_lastname || ''}`.trim() || `Staff ${staffId}`,
        billedAmount: 0,
        collectedAmount: 0,
        bookingsCount: 0,
        paymentsCount: 0,
      };
    }
    staffFinancialsById[staffKey].billedAmount += parseFloat(booking.total_amount || 0);
    staffFinancialsById[staffKey].bookingsCount += 1;
  });

  staffPayments.forEach((payment) => {
    const staffId = payment.recorded_by;
    if (!staffId || !isInSelectedPeriod(payment.payment_date)) return;
    const staffKey = String(staffId);
    if (!staffFinancialsById[staffKey]) {
      staffFinancialsById[staffKey] = {
        staffId,
        name: `${payment.staff_firstname || ''} ${payment.staff_lastname || ''}`.trim() || `Staff ${staffId}`,
        billedAmount: 0,
        collectedAmount: 0,
        bookingsCount: 0,
        paymentsCount: 0,
      };
    }
    staffFinancialsById[staffKey].collectedAmount += parseFloat(payment.amount_paid || 0);
    staffFinancialsById[staffKey].paymentsCount += 1;
  });

  const staffFinancials = Object.values(staffFinancialsById).sort((a, b) => b.collectedAmount - a.collectedAmount);
  const maxStaffFinancial = Math.max(1, ...staffFinancials.flatMap((staff) => [staff.billedAmount, staff.collectedAmount]));

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
      {/* ── TOP HEADER (Matching Screenshots) ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, color: 'var(--text-primary, #ffffff)' }}>
            Sales &amp; Analytics Reports
          </h1>
          <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.88rem', color: 'var(--text-muted, #94a3b8)' }}>
            Analyze business performance with graphs, time breakdown, and customizable date ranges
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={fetchAnalytics}
            className="btn btn-secondary btn-sm"
            disabled={loading}
            title="Refresh graph data"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', borderRadius: '8px' }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            onClick={handleExportCSV}
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', borderRadius: '8px' }}
            title="Export timeline data to CSV"
          >
            <Download size={14} /> Export CSV
          </button>
          <button
            onClick={() => window.print()}
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', borderRadius: '8px' }}
            title="Print graph report"
          >
            <Printer size={14} /> Print
          </button>
        </div>
      </div>

      {/* ── SELECT REPORT PERIOD FILTER CARD (Exact Style from Image 2 & 3) ── */}
      <div
        className="card p-6"
        style={{
          background: 'rgba(18, 27, 47, 0.75)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '16px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
        }}
      >
        {/* Title: Select Report Period */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.1rem', fontWeight: 700, fontSize: '0.98rem', color: '#f1f5f9' }}>
          <Filter size={18} style={{ color: '#c084fc' }} />
          <span>Select Report Period</span>
        </div>

        {/* Period Selector Button Tabs */}
        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {/* Weekly Report */}
          <button
            type="button"
            onClick={() => setPeriod('weekly')}
            style={{
              padding: '0.55rem 1.15rem',
              borderRadius: '10px',
              border: period === 'weekly' ? '1px solid #c084fc' : '1px solid #e2e8f0',
              background: period === 'weekly' ? '#9333ea' : '#ffffff',
              color: period === 'weekly' ? '#ffffff' : '#0f172a',
              fontWeight: 700,
              fontSize: '0.85rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              boxShadow: period === 'weekly' ? '0 4px 14px rgba(147, 51, 234, 0.45)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <Calendar size={15} /> Weekly Report
          </button>

          {/* Monthly Report */}
          <button
            type="button"
            onClick={() => setPeriod('monthly')}
            style={{
              padding: '0.55rem 1.15rem',
              borderRadius: '10px',
              border: period === 'monthly' ? '1px solid #c084fc' : '1px solid #e2e8f0',
              background: period === 'monthly' ? '#9333ea' : '#ffffff',
              color: period === 'monthly' ? '#ffffff' : '#0f172a',
              fontWeight: 700,
              fontSize: '0.85rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              boxShadow: period === 'monthly' ? '0 4px 14px rgba(147, 51, 234, 0.45)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <Calendar size={15} /> Monthly Report
          </button>

          {/* Yearly Report */}
          <button
            type="button"
            onClick={() => setPeriod('yearly')}
            style={{
              padding: '0.55rem 1.15rem',
              borderRadius: '10px',
              border: period === 'yearly' ? '1px solid #c084fc' : '1px solid #e2e8f0',
              background: period === 'yearly' ? '#9333ea' : '#ffffff',
              color: period === 'yearly' ? '#ffffff' : '#0f172a',
              fontWeight: 700,
              fontSize: '0.85rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              boxShadow: period === 'yearly' ? '0 4px 14px rgba(147, 51, 234, 0.45)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <TrendingUp size={15} /> Yearly Report
          </button>

          {/* Customize Date Range */}
          <button
            type="button"
            onClick={() => setPeriod('from_to')}
            style={{
              padding: '0.55rem 1.15rem',
              borderRadius: '10px',
              border: period === 'from_to' ? '1px solid #c084fc' : '1px solid #e2e8f0',
              background: period === 'from_to' ? '#9333ea' : '#ffffff',
              color: period === 'from_to' ? '#ffffff' : '#0f172a',
              fontWeight: 700,
              fontSize: '0.85rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              boxShadow: period === 'from_to' ? '0 4px 14px rgba(147, 51, 234, 0.45)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <BarChart3 size={15} /> Customize Date Range
          </button>
        </div>

        {/* Period-specific filter row */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', flexWrap: 'wrap', paddingTop: '0.5rem' }}>
          {/* YEARLY VIEW CONTROLS (Image 2) */}
          {period === 'yearly' && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.35rem' }}>
                  Select Year
                </label>
                <select
                  className="form-select"
                  style={{
                    minWidth: '130px',
                    padding: '0.5rem 0.85rem',
                    borderRadius: '8px',
                    background: '#0d1526',
                    border: '1px solid #6366f1',
                    color: '#ffffff',
                    fontWeight: 700,
                  }}
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

              {/* Quick year buttons */}
              <button
                type="button"
                onClick={() => setSelectedYear(currentYear)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  background: selectedYear === currentYear ? '#e2e8f0' : '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#0f172a',
                  fontWeight: 600,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                }}
              >
                This Year ({currentYear})
              </button>

              <button
                type="button"
                onClick={() => setSelectedYear(currentYear - 1)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  background: selectedYear === currentYear - 1 ? '#e2e8f0' : '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#0f172a',
                  fontWeight: 600,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                }}
              >
                Last Year ({currentYear - 1})
              </button>

              <button
                type="button"
                onClick={fetchAnalytics}
                disabled={loading}
                style={{
                  padding: '0.5rem 1.25rem',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #a855f7, #9333ea)',
                  border: 'none',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(168, 85, 247, 0.35)',
                }}
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                Generate Yearly Report
              </button>
            </>
          )}

          {/* MONTHLY VIEW CONTROLS (Image 3) */}
          {period === 'monthly' && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.35rem' }}>
                  Month
                </label>
                <select
                  className="form-select"
                  style={{
                    minWidth: '150px',
                    padding: '0.5rem 0.85rem',
                    borderRadius: '8px',
                    background: '#0d1526',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: '#ffffff',
                    fontWeight: 600,
                  }}
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                >
                  {monthOptions.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.35rem' }}>
                  Year
                </label>
                <select
                  className="form-select"
                  style={{
                    minWidth: '120px',
                    padding: '0.5rem 0.85rem',
                    borderRadius: '8px',
                    background: '#0d1526',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: '#ffffff',
                    fontWeight: 600,
                  }}
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

              <button
                type="button"
                onClick={() => {
                  setSelectedMonth(currentMonth);
                  setSelectedYear(currentYear);
                }}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  background: selectedMonth === currentMonth && selectedYear === currentYear ? '#e2e8f0' : '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#0f172a',
                  fontWeight: 600,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                }}
              >
                This Month
              </button>

              <button
                type="button"
                onClick={() => {
                  const prevM = currentMonth === 1 ? 12 : currentMonth - 1;
                  const prevY = currentMonth === 1 ? currentYear - 1 : currentYear;
                  setSelectedMonth(prevM);
                  setSelectedYear(prevY);
                }}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  background: selectedMonth === (currentMonth === 1 ? 12 : currentMonth - 1) && selectedYear === (currentMonth === 1 ? currentYear - 1 : currentYear) ? '#e2e8f0' : '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#0f172a',
                  fontWeight: 600,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                }}
              >
                Last Month
              </button>

              <button
                type="button"
                onClick={fetchAnalytics}
                disabled={loading}
                style={{
                  padding: '0.5rem 1.25rem',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #a855f7, #9333ea)',
                  border: 'none',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(168, 85, 247, 0.35)',
                }}
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                Generate Monthly Report
              </button>
            </>
          )}

          {/* WEEKLY VIEW CONTROLS */}
          {period === 'weekly' && (
            <>
              <button
                type="button"
                onClick={() => setWeekOffset(0)}
                style={{
                  padding: '0.5rem 1.1rem',
                  borderRadius: '8px',
                  background: weekOffset === 0 ? '#e2e8f0' : '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#0f172a',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                }}
              >
                This Week
              </button>

              <button
                type="button"
                onClick={() => setWeekOffset(-1)}
                style={{
                  padding: '0.5rem 1.1rem',
                  borderRadius: '8px',
                  background: weekOffset === -1 ? '#e2e8f0' : '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#0f172a',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                }}
              >
                Last Week
              </button>

              <button
                type="button"
                onClick={fetchAnalytics}
                disabled={loading}
                style={{
                  padding: '0.5rem 1.25rem',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #a855f7, #9333ea)',
                  border: 'none',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(168, 85, 247, 0.35)',
                }}
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                Generate Weekly Report
              </button>
            </>
          )}

          {/* CUSTOM DATE RANGE CONTROLS */}
          {period === 'from_to' && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.35rem' }}>
                  From Date
                </label>
                <input
                  type="date"
                  className="form-input"
                  style={{ width: 'auto', padding: '0.45rem 0.75rem', fontSize: '0.84rem' }}
                  value={fromDate}
                  onChange={(e) => {
                    setFromDate(e.target.value);
                    setActivePreset('custom');
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.35rem' }}>
                  To Date
                </label>
                <input
                  type="date"
                  className="form-input"
                  style={{ width: 'auto', padding: '0.45rem 0.75rem', fontSize: '0.84rem' }}
                  value={toDate}
                  onChange={(e) => {
                    setToDate(e.target.value);
                    setActivePreset('custom');
                  }}
                />
              </div>

              {/* Presets */}
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', alignItems: 'center' }}>
                {[
                  { key: '7days', label: '7 Days' },
                  { key: '30days', label: '30 Days' },
                  { key: 'this_month', label: 'This Month' },
                  { key: 'last_3months', label: '3 Months' },
                  { key: 'ytd', label: 'YTD' },
                  { key: 'all', label: 'All Time' },
                ].map((p) => (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => applyPreset(p.key)}
                    style={{
                      padding: '0.35rem 0.65rem',
                      fontSize: '0.75rem',
                      borderRadius: '6px',
                      border: activePreset === p.key ? '1px solid #c084fc' : '1px solid rgba(255,255,255,0.15)',
                      background: activePreset === p.key ? '#9333ea' : 'rgba(255,255,255,0.06)',
                      color: '#ffffff',
                      cursor: 'pointer',
                      fontWeight: activePreset === p.key ? 700 : 500,
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={fetchAnalytics}
                disabled={loading}
                style={{
                  padding: '0.5rem 1.25rem',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #a855f7, #9333ea)',
                  border: 'none',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(168, 85, 247, 0.35)',
                }}
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                Generate Custom Report
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── 3 KEY PERFORMANCE CARDS (Exact match from Screenshots) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
        {/* CARD 1: TOTAL REVENUE */}
        <div
          className="card"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.15rem',
            padding: '1.35rem 1.5rem',
            background: 'rgba(18, 27, 47, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
          }}
        >
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '14px',
              background: 'rgba(34, 197, 94, 0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#22c55e',
              flexShrink: 0,
            }}
          >
            <TrendingUp size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              TOTAL REVENUE
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#22c55e', lineHeight: 1.2, marginTop: '3px' }}>
              ₱{parseFloat(summary.total_revenue || summary.total_billed || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
          </div>
        </div>

        {/* CARD 2: TOTAL TRANSACTIONS */}
        <div
          className="card"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.15rem',
            padding: '1.35rem 1.5rem',
            background: 'rgba(18, 27, 47, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
          }}
        >
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '14px',
              background: 'rgba(56, 189, 248, 0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38bdf8',
              flexShrink: 0,
            }}
          >
            <BarChart3 size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              TOTAL TRANSACTIONS
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.2, marginTop: '3px' }}>
              {summary.total_transactions ?? summary.total_bookings ?? 0}
            </div>
          </div>
        </div>

        {/* CARD 3: AVERAGE ORDER VALUE */}
        <div
          className="card"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.15rem',
            padding: '1.35rem 1.5rem',
            background: 'rgba(18, 27, 47, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
          }}
        >
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '14px',
              background: 'rgba(168, 85, 247, 0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#c084fc',
              flexShrink: 0,
            }}
          >
            <DollarSign size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              AVERAGE ORDER VALUE
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#c084fc', lineHeight: 1.2, marginTop: '3px' }}>
              ₱{parseFloat(summary.avg_order_value || summary.avg_booking_value || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN SALES & REVENUE GRAPH (Exact Style from Image 2 & 3) ── */}
      <div
        className="card p-6"
        style={{
          background: 'rgba(18, 27, 47, 0.75)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '16px',
          position: 'relative',
        }}
      >
        {/* Graph Header: Title + Badge + Subtitle */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#f8fafc' }}>
                {period === 'monthly' && 'Monthly Sales & Revenue Graph'}
                {period === 'yearly' && 'Yearly Sales & Revenue Graph'}
                {period === 'weekly' && 'Weekly Sales & Revenue Graph'}
                {period === 'from_to' && 'Custom Range Sales & Revenue Graph'}
              </h2>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  padding: '0.2rem 0.65rem',
                  borderRadius: '6px',
                  background: '#9333ea',
                  color: '#ffffff',
                  letterSpacing: '0.04em',
                }}
              >
                {period === 'from_to' ? 'CUSTOM' : period.toUpperCase()}
              </span>
            </div>
            <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.84rem', color: '#94a3b8' }}>
              Visual breakdown of revenue and transaction trends for {computedRangeLabel}
            </p>
          </div>

          {/* Secondary Graph Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* Metric Mode */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Metric:</span>
              <select
                className="form-select"
                style={{ width: 'auto', padding: '0.3rem 0.65rem', fontSize: '0.8rem' }}
                value={metricView}
                onChange={(e) => setMetricView(e.target.value)}
              >
                <option value="financial">Revenue (₱)</option>
                <option value="bookings">Bookings Count</option>
                <option value="combined">Combined</option>
              </select>
            </div>

            {/* Date Basis */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Basis:</span>
              <select
                className="form-select"
                style={{ width: 'auto', padding: '0.3rem 0.65rem', fontSize: '0.8rem' }}
                value={dateBasis}
                onChange={(e) => setDateBasis(e.target.value)}
              >
                <option value="created_at">Date Booked</option>
                <option value="event_date">Event Date</option>
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
                title="Trend Line Chart"
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
                Line
              </button>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', alignItems: 'center', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
          {(metricView === 'financial' || metricView === 'combined') && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--brand, #f97316)', display: 'inline-block' }} />
                <span style={{ color: 'var(--text-secondary)' }}>Billed Revenue (₱)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: 12, height: 12, borderRadius: 3, background: '#22c55e', display: 'inline-block' }} />
                <span style={{ color: 'var(--text-secondary)' }}>Collected Payments (₱)</span>
              </div>
            </>
          )}

          {(metricView === 'bookings' || metricView === 'combined') && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: 12, height: 12, borderRadius: 3, background: '#38bdf8', display: 'inline-block' }} />
                <span style={{ color: 'var(--text-secondary)' }}>Total Bookings</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: 12, height: 12, borderRadius: 3, background: '#a855f7', display: 'inline-block' }} />
                <span style={{ color: 'var(--text-secondary)' }}>Completed Events</span>
              </div>
            </>
          )}
        </div>

        {/* Empty state check */}
        {timeline.length === 0 ? (
          <div className="empty-state" style={{ padding: '3.5rem 1rem', textAlign: 'center' }}>
            <div className="empty-icon"><Calendar size={32} /></div>
            <div className="empty-title" style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '0.5rem' }}>No data for selected period</div>
            <div className="empty-desc" style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.25rem' }}>
              Try selecting another month or year from the period filters above.
            </div>
          </div>
        ) : (
          /* SVG Chart Container */
          <div style={{ width: '100%', overflowX: 'auto', position: 'relative' }}>
            {(() => {
              const count = timeline.length;
              const minWidth = Math.max(720, count * (period === 'monthly' ? 32 : period === 'weekly' ? 85 : 55));
              const svgWidth = minWidth;
              const innerWidth = svgWidth - chartPaddingLeft - chartPaddingRight;
              const innerHeight = chartHeight - chartPaddingTop - chartPaddingBottom;
              const colWidth = innerWidth / count;
              const barWidth = Math.min(22, Math.max(6, colWidth * 0.45));

              // Compute Y ticks (5 ticks)
              const yTicksCount = 4;
              const activeMax = metricView === 'bookings' ? maxBookings : maxFinancial;
              const yTickValues = Array.from({ length: yTicksCount + 1 }, (_, i) => (activeMax / yTicksCount) * i);

              // Points for trend line
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
                      <stop offset="0%" stopColor="#f97316" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#f97316" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid lines & Y-axis labels (matching Image 2 & 3) */}
                  {yTickValues.map((val, idx) => {
                    const y = chartPaddingTop + innerHeight - (idx / yTicksCount) * innerHeight;
                    return (
                      <g key={idx}>
                        <line
                          x1={chartPaddingLeft}
                          y1={y}
                          x2={svgWidth - chartPaddingRight}
                          y2={y}
                          stroke="rgba(255,255,255,0.08)"
                          strokeDasharray={idx === 0 ? 'none' : '3 3'}
                        />
                        <text
                          x={chartPaddingLeft - 10}
                          y={y + 4}
                          textAnchor="end"
                          fontSize="11"
                          fill="#94a3b8"
                          fontWeight="600"
                        >
                          {metricView === 'bookings' ? Math.round(val) : fmtShortMoney(val)}
                        </text>
                      </g>
                    );
                  })}

                  {/* Area Chart lines */}
                  {chartType === 'area' && (metricView === 'financial' || metricView === 'combined') && (
                    <>
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

                  {/* Columns / Bars & Interaction */}
                  {timeline.map((item, idx) => {
                    const colX = chartPaddingLeft + idx * colWidth;
                    const centerX = colX + colWidth / 2;
                    const isHovered = hoveredIndex === idx;

                    const billedHeight = Math.max(0, (item.billed_amount / maxFinancial) * innerHeight);
                    const collectedHeight = Math.max(0, (item.collected_amount / maxFinancial) * innerHeight);
                    const bookingsHeight = Math.max(0, (item.bookings_count / maxBookings) * innerHeight);
                    const completedHeight = Math.max(0, (item.completed_count / maxBookings) * innerHeight);
                    const groundY = chartPaddingTop + innerHeight;

                    return (
                      <g
                        key={idx}
                        style={{ cursor: 'pointer' }}
                        onMouseEnter={() => setHoveredIndex(idx)}
                        onMouseLeave={() => setHoveredIndex(null)}
                      >
                        {/* Hover Column Background */}
                        <rect
                          x={colX}
                          y={chartPaddingTop}
                          width={colWidth}
                          height={innerHeight}
                          fill={isHovered ? 'rgba(168, 85, 247, 0.08)' : 'transparent'}
                          rx="4"
                        />

                        {/* Bars rendering */}
                        {chartType === 'bars' && (
                          <>
                            {(metricView === 'financial' || metricView === 'combined') && (
                              <>
                                <rect
                                  x={centerX - barWidth - 1}
                                  y={groundY - billedHeight}
                                  width={barWidth}
                                  height={Math.max(billedHeight, 2)}
                                  rx="4"
                                  fill="url(#brandBarGrad)"
                                  stroke={isHovered ? '#fff' : 'none'}
                                  strokeWidth="1"
                                />
                                <rect
                                  x={centerX + 1}
                                  y={groundY - collectedHeight}
                                  width={barWidth}
                                  height={Math.max(collectedHeight, 2)}
                                  rx="4"
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
                                  rx="4"
                                  fill="url(#infoBarGrad)"
                                  stroke={isHovered ? '#fff' : 'none'}
                                  strokeWidth="1"
                                />
                                <rect
                                  x={centerX + 1}
                                  y={groundY - completedHeight}
                                  width={barWidth}
                                  height={Math.max(completedHeight, 2)}
                                  rx="4"
                                  fill="url(#purpleBarGrad)"
                                  stroke={isHovered ? '#fff' : 'none'}
                                  strokeWidth="1"
                                />
                              </>
                            )}
                          </>
                        )}

                        {/* Interactive Data Dots (for Line Chart) */}
                        {chartType === 'area' && (
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

                        {/* X-axis Label */}
                        <text
                          x={centerX}
                          y={groundY + 18}
                          textAnchor="middle"
                          fontSize={period === 'monthly' && count > 20 ? '9' : '11'}
                          fill={isHovered ? '#c084fc' : '#94a3b8'}
                          fontWeight={isHovered ? '700' : '500'}
                        >
                          {period === 'monthly' ? item.day : item.label || item.date}
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
                    background: 'rgba(9, 14, 29, 0.96)',
                    border: '1px solid rgba(168, 85, 247, 0.4)',
                    borderRadius: '12px',
                    padding: '0.85rem 1.15rem',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                    minWidth: '230px',
                    pointerEvents: 'none',
                    backdropFilter: 'blur(10px)',
                    zIndex: 20,
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: '0.45rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.4rem', color: '#f8fafc' }}>
                    {item.label || item.date} Summary
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.82rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                      <span style={{ color: '#94a3b8' }}>Billed Revenue:</span>
                      <strong style={{ color: 'var(--brand, #f97316)' }}>{fmtMoney(item.billed_amount)}</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                      <span style={{ color: '#94a3b8' }}>Collected Paid:</span>
                      <strong style={{ color: '#22c55e' }}>{fmtMoney(item.collected_amount)}</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                      <span style={{ color: '#94a3b8' }}>Outstanding:</span>
                      <strong style={{ color: balance > 0 ? '#f59e0b' : '#94a3b8' }}>{fmtMoney(balance)}</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '0.35rem' }}>
                      <span style={{ color: '#94a3b8' }}>Bookings (Events):</span>
                      <strong style={{ color: '#ffffff' }}>{item.bookings_count} {item.completed_count > 0 && `(${item.completed_count} completed)`}</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                      <span style={{ color: '#94a3b8' }}>Collection Rate:</span>
                      <strong style={{ color: parseFloat(rate) >= 90 ? '#22c55e' : '#f59e0b' }}>{rate}%</strong>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* ── STAFF BILLING & RECORD ATTRIBUTION SECTION ── */}
      <div
        className="card p-6"
        style={{
          background: 'rgba(18, 27, 47, 0.75)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '16px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>Staff Billing &amp; Payment Records</h3>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0.35rem 0 0' }}>
              Staff-attributed totals for the selected period ({computedRangeLabel}).
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', fontSize: '0.78rem' }}>
            <span style={{ display: 'inline-flex', gap: '0.4rem', alignItems: 'center' }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: '#f97316' }} /> Billed
            </span>
            <span style={{ display: 'inline-flex', gap: '0.4rem', alignItems: 'center' }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: '#22c55e' }} /> Payments recorded
            </span>
          </div>
        </div>

        {staffFinancials.length === 0 ? (
          <div className="empty-state" style={{ padding: '1.5rem 1rem', textAlign: 'center', color: '#94a3b8' }}>
            <div className="empty-title">No staff billing or payment records for this period</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {staffFinancials.map((staff) => (
              <div key={staff.staffId} style={{ display: 'grid', gridTemplateColumns: 'minmax(120px, 0.8fr) minmax(140px, 1.2fr)', alignItems: 'center', gap: '0.75rem 1rem' }}>
                <div>
                  <strong style={{ fontSize: '0.88rem', color: '#ffffff' }}>{staff.name}</strong>
                  <div style={{ color: '#94a3b8', fontSize: '0.74rem', marginTop: '0.2rem' }}>
                    {staff.bookingsCount} bookings · {staff.paymentsCount} payments
                  </div>
                </div>
                <div aria-label={`${staff.name} billing and payment graph`} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${(staff.billedAmount / maxStaffFinancial) * 100}%`, height: '100%', background: '#f97316', borderRadius: 4 }} />
                  </div>
                  <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${(staff.collectedAmount / maxStaffFinancial) * 100}%`, height: '100%', background: '#22c55e', borderRadius: 4 }} />
                  </div>
                </div>
                <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.76rem' }}>
                  <span style={{ color: '#94a3b8' }}>Billed <strong style={{ display: 'block', color: 'var(--text-primary, #ffffff)' }}>{fmtMoney(staff.billedAmount)}</strong></span>
                  <span style={{ color: '#94a3b8' }}>Collected <strong style={{ display: 'block', color: '#22c55e' }}>{fmtMoney(staff.collectedAmount)}</strong></span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminGraphReport;
