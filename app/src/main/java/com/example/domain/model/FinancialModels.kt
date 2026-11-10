package com.example.domain.model

enum class LoanType(val displayName: String, val defaultRate: Double) {
    EDUCATION("Education Loan", 9.5),
    HOME("Home Loan", 8.5),
    PERSONAL("Personal Loan", 12.0),
    VEHICLE("Vehicle Loan", 8.8),
    BUSINESS("Business Loan", 14.0),
    CUSTOM("Custom Loan", 10.0)
}

enum class InterestCalculationType(val displayName: String) {
    SIMPLE("Simple Interest"),
    COMPOUND("Compound Interest")
}

enum class CompoundingFrequency(val displayName: String, val periodsPerYear: Int) {
    MONTHLY("Monthly", 12),
    QUARTERLY("Quarterly", 4),
    HALF_YEARLY("Half-Yearly", 2),
    ANNUALLY("Annually", 1)
}

enum class SipFrequency(val displayName: String, val installmentsPerYear: Int) {
    MONTHLY("Monthly", 12),
    QUARTERLY("Quarterly", 4),
    WEEKLY("Weekly", 52)
}

data class DisbursementInput(
    val id: String = java.util.UUID.randomUUID().toString(),
    val academicYear: Int,
    val installmentNumberInYear: Int = 1,
    val amount: Double,
    val monthOffsetFromStart: Int = (academicYear - 1) * 12, // default starts at beginning of academic year
    val dateString: String = "Year $academicYear Sem $installmentNumberInYear",
    val label: String = "Year $academicYear Tranche $installmentNumberInYear"
)

data class EmiScheduleItem(
    val installmentNumber: Int,
    val paymentMonthLabel: String,
    val openingBalance: Double,
    val emiAmount: Double,
    val principalComponent: Double,
    val interestComponent: Double,
    val closingBalance: Double
)

data class LoanCalculationResult(
    val loanType: LoanType,
    val totalDisbursedAmount: Double,
    val moratoriumInterest: Double,
    val outstandingBalanceAtEmiStart: Double,
    val emiAmount: Double,
    val totalRepaymentAmount: Double,
    val totalEmiInterest: Double,
    val totalInterestPayable: Double, // moratorium + emi interest
    val totalCostOfBorrowing: Double, // total repayment + any processing fees
    val repaymentTenureMonths: Int,
    val schedule: List<EmiScheduleItem>,
    val yearWiseDisbursements: Map<Int, Double>,
    val assumptions: String
)

data class SipScheduleItem(
    val yearNumber: Int,
    val installmentNumber: Int,
    val periodLabel: String,
    val periodicInvestment: Double,
    val cumulativeInvested: Double,
    val estimatedPortfolioValue: Double,
    val estimatedProfit: Double
)

data class SipCalculationResult(
    val monthlyInvestment: Double,
    val expectedAnnualReturn: Double,
    val investmentDurationYears: Int,
    val frequency: SipFrequency,
    val stepUpPercentage: Double,
    val initialLumpSum: Double,
    val totalInvestedAmount: Double,
    val estimatedReturns: Double,
    val estimatedFutureValue: Double,
    val inflationAdjustedFutureValue: Double,
    val yearlyBreakdown: List<SipScheduleItem>,
    val regularComparisonFutureValue: Double,
    val goalAmount: Double? = null,
    val goalAchieved: Boolean = false
)
