import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import { EmiScheduleItem, LoanCalculationResult, SipCalculationResult } from '../types';
import { CurrencyFormatter } from './calculator';

export class FinancialExporter {
  static exportAmortizationToExcel(
    schedule: EmiScheduleItem[],
    fileName = 'LoanWise_Amortization_Schedule.xlsx'
  ) {
    const data = schedule.map((item) => ({
      'Month': item.installmentNumber,
      'Opening Balance (INR)': Math.round(item.openingBalance),
      'Monthly EMI (INR)': Math.round(item.emiAmount),
      'Principal Component (INR)': Math.round(item.principalComponent),
      'Interest Component (INR)': Math.round(item.interestComponent),
      'Closing Balance (INR)': Math.round(item.closingBalance),
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Amortization Schedule');

    XLSX.writeFile(workbook, fileName);
  }

  static exportAmortizationToCsv(
    schedule: EmiScheduleItem[],
    fileName = 'LoanWise_Amortization_Schedule.csv'
  ) {
    const data = schedule.map((item) => ({
      'Month': item.installmentNumber,
      'Opening Balance (INR)': Math.round(item.openingBalance),
      'Monthly EMI (INR)': Math.round(item.emiAmount),
      'Principal Component (INR)': Math.round(item.principalComponent),
      'Interest Component (INR)': Math.round(item.interestComponent),
      'Closing Balance (INR)': Math.round(item.closingBalance),
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const csvOutput = XLSX.utils.sheet_to_csv(worksheet);

    const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  static exportLoanPdfReport(
    loanName: string,
    result: LoanCalculationResult,
    rate: number
  ) {
    const doc = new jsPDF();

    // Title & Header
    doc.setFillColor(37, 99, 235); // Blue 600
    doc.rect(0, 0, 210, 35, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('LoanWise Financial Report', 14, 22);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on ${new Date().toLocaleDateString('en-IN')}`, 14, 30);

    // Loan Summary Box
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(loanName || `${result.loanType} Calculation`, 14, 50);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Annual Interest Rate: ${rate}% p.a.`, 14, 58);
    doc.text(`Repayment Tenure: ${(result.repaymentTenureMonths / 12).toFixed(1)} Years (${result.repaymentTenureMonths} installments)`, 14, 65);

    // Key metrics table
    let y = 78;
    const drawMetric = (label: string, val: string, currentY: number) => {
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(14, currentY, 182, 11, 2, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(71, 85, 105);
      doc.text(label, 20, currentY + 7);
      doc.setTextColor(15, 23, 42);
      doc.text(val, 185, currentY + 7, { align: 'right' });
    };

    drawMetric('Total Principal Disbursed', CurrencyFormatter.formatInr(result.totalDisbursedAmount), y);
    y += 14;
    if (result.moratoriumInterest > 0) {
      drawMetric('Moratorium Accrued Interest', CurrencyFormatter.formatInr(result.moratoriumInterest), y);
      y += 14;
      drawMetric('Outstanding Principal at EMI Start', CurrencyFormatter.formatInr(result.outstandingBalanceAtEmiStart), y);
      y += 14;
    }
    drawMetric('Monthly Reducing EMI', CurrencyFormatter.formatInr(result.emiAmount), y);
    y += 14;
    drawMetric('Total Repayment Amount', CurrencyFormatter.formatInr(result.totalRepaymentAmount), y);
    y += 14;
    drawMetric('Total Interest Payable', CurrencyFormatter.formatInr(result.totalInterestPayable), y);
    y += 14;
    drawMetric('Total Cost of Borrowing', CurrencyFormatter.formatInr(result.totalCostOfBorrowing), y);
    y += 20;

    // Amortization Preview Table (First 12 Months)
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('First 12 Months Amortization Schedule', 14, y);
    y += 8;

    // Header row
    doc.setFillColor(226, 232, 240);
    doc.rect(14, y, 182, 8, 'F');
    doc.setFontSize(9);
    doc.text('Month', 16, y + 5.5);
    doc.text('Opening Bal', 50, y + 5.5);
    doc.text('Monthly EMI', 90, y + 5.5);
    doc.text('Principal', 125, y + 5.5);
    doc.text('Interest', 155, y + 5.5);
    doc.text('Closing Bal', 190, y + 5.5, { align: 'right' });
    y += 9;

    doc.setFont('helvetica', 'normal');
    result.schedule.slice(0, 12).forEach((item, index) => {
      if (index % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(14, y - 1, 182, 7, 'F');
      }
      doc.text(item.installmentNumber.toString(), 16, y + 4);
      doc.text(CurrencyFormatter.formatInr(item.openingBalance), 50, y + 4);
      doc.text(CurrencyFormatter.formatInr(item.emiAmount), 90, y + 4);
      doc.text(CurrencyFormatter.formatInr(item.principalComponent), 125, y + 4);
      doc.text(CurrencyFormatter.formatInr(item.interestComponent), 155, y + 4);
      doc.text(CurrencyFormatter.formatInr(item.closingBalance), 190, y + 4, { align: 'right' });
      y += 7;
    });

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('Generated with LoanWise – Smart Loan, EMI & SIP Calculator', 105, 285, { align: 'center' });

    doc.save(`${loanName.replace(/[^a-zA-Z0-9]/g, '_')}_Report.pdf`);
  }

  static exportSipPdfReport(
    sipName: string,
    result: SipCalculationResult
  ) {
    const doc = new jsPDF();

    // Header
    doc.setFillColor(16, 185, 129); // Emerald 500
    doc.rect(0, 0, 210, 35, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('LoanWise SIP Wealth Report', 14, 22);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on ${new Date().toLocaleDateString('en-IN')}`, 14, 30);

    // Summary
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(sipName || 'SIP Wealth Projection', 14, 50);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Monthly Investment: ${CurrencyFormatter.formatInr(result.monthlyInvestment)}`, 14, 58);
    doc.text(`Expected Annual Return: ${result.expectedAnnualReturn}% p.a.`, 14, 65);
    doc.text(`Investment Horizon: ${result.investmentDurationYears} Years (${result.frequency})`, 14, 72);
    if (result.stepUpPercentage > 0) {
      doc.text(`Annual Step-up: ${result.stepUpPercentage}% per year`, 14, 79);
    }

    let y = result.stepUpPercentage > 0 ? 92 : 85;
    const drawMetric = (label: string, val: string, currentY: number) => {
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(14, currentY, 182, 11, 2, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(71, 85, 105);
      doc.text(label, 20, currentY + 7);
      doc.setTextColor(15, 23, 42);
      doc.text(val, 185, currentY + 7, { align: 'right' });
    };

    drawMetric('Total Invested Capital', CurrencyFormatter.formatInr(result.totalInvestedAmount), y);
    y += 14;
    drawMetric('Estimated Wealth Gain (Profit)', CurrencyFormatter.formatInr(result.estimatedReturns), y);
    y += 14;
    drawMetric('Estimated Total Portfolio Value', CurrencyFormatter.formatInr(result.estimatedFutureValue), y);
    y += 14;
    if (result.inflationAdjustedFutureValue > 0) {
      drawMetric('Inflation-Adjusted Purchasing Power', CurrencyFormatter.formatInr(result.inflationAdjustedFutureValue), y);
      y += 14;
    }

    // Yearly Breakdown Table
    y += 6;
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('Year-Wise Portfolio Growth Table', 14, y);
    y += 8;

    doc.setFillColor(226, 232, 240);
    doc.rect(14, y, 182, 8, 'F');
    doc.setFontSize(9);
    doc.text('Year', 18, y + 5.5);
    doc.text('Cumulative Invested', 65, y + 5.5);
    doc.text('Estimated Profit', 120, y + 5.5);
    doc.text('Portfolio Value', 190, y + 5.5, { align: 'right' });
    y += 9;

    doc.setFont('helvetica', 'normal');
    result.yearlyBreakdown.forEach((item, index) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      if (index % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(14, y - 1, 182, 7, 'F');
      }
      doc.text(`Year ${item.yearNumber}`, 18, y + 4);
      doc.text(CurrencyFormatter.formatInr(item.cumulativeInvested), 65, y + 4);
      doc.text(CurrencyFormatter.formatInr(item.estimatedProfit), 120, y + 4);
      doc.text(CurrencyFormatter.formatInr(item.estimatedPortfolioValue), 190, y + 4, { align: 'right' });
      y += 7;
    });

    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('Disclaimer: Mutual fund investments are subject to market risks. SIP projections are estimates.', 105, 285, { align: 'center' });

    doc.save(`${sipName.replace(/[^a-zA-Z0-9]/g, '_')}_Report.pdf`);
  }
}
