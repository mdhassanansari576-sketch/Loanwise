# LoanWise – Smart Loan, EMI & SIP Calculator

A modern, professional financial web application built with **React**, **TypeScript**, **Vite**, and **Tailwind CSS**.

## Features

1. **Fintech Design & UI**:
   - Modern glassmorphic and clean minimalist aesthetic
   - Professional blue, indigo, and emerald color palette
   - Light and Dark mode with seamless theme toggling
   - Indian Rupee (`₹`) currency display with Indian Lakh/Crore number formatting
   - Responsive layout for mobile, tablet, and desktop

2. **Full Financial Suite (9 Dedicated Navigation Views)**:
   - **Dashboard**: Financial overview, portfolio counters, "What type of loan do you want to calculate?" selector (Education Loan vs Other Loan), quick shortcuts, and recent calculations.
   - **Education Loan Calculator**: Multi-year university disbursements, interest accrual calculations during academic and grace moratoriums, Simple vs. Compound interest, compounding frequencies (Monthly, Quarterly, Half-Yearly, Annually), interest servicing vs. capitalization options, and reducing-balance repayment schedules.
   - **Other Loan Calculator**: Specialized configurations for Home, Personal, Vehicle, Business, and Custom loans with monthly prepayment savings and tenure reduction analysis.
   - **EMI Calculator**: Standard reducing-balance monthly installment engine with mathematical formula derivation ($P, r, n$).
   - **SIP Calculator**:
     - Regular SIP and Step-Up SIP (0–100% annual increment)
     - Frequencies: Monthly, Quarterly, Weekly
     - Reverse SIP & Goal Planner: Calculates required monthly investment or horizon for a target milestone
     - Inflation-adjusted future wealth purchasing power
     - Year-wise contribution, returns, and portfolio trajectory tables
   - **Saved Calculations**: Database archive supporting search, filtering by Loan vs. SIP, renaming, duplicating, and deleting scenarios.
   - **Loan Comparison**: Side-by-side comparison matrix of two bank offers with winner savings highlights.
   - **SIP Investment Portfolio**: Aggregated trajectory combining multiple active SIP plans into an overall wealth accumulation curve.
   - **Profile & Settings**: Investor profile (Name, Email, Risk appetite), dark theme toggle, CSV/Excel/PDF export, and sample data restoration.

## Tech Stack

- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Glassmorphism
- **Icons**: Lucide React
- **Export Utilities**: XLSX (Excel/CSV export) & jsPDF (PDF reports)
- **Data Persistence**: LocalStorage Database Architecture
