package com.example.domain.calculator

import com.example.domain.model.CompoundingFrequency
import com.example.domain.model.DisbursementInput
import com.example.domain.model.EmiScheduleItem
import com.example.domain.model.InterestCalculationType
import com.example.domain.model.LoanCalculationResult
import com.example.domain.model.LoanType
import com.example.domain.model.SipCalculationResult
import com.example.domain.model.SipFrequency
import com.example.domain.model.SipScheduleItem
import kotlin.math.ln
import kotlin.math.max
import kotlin.math.min
import kotlin.math.pow
import kotlin.math.round

object FinancialCalculator {

    fun calculateStandardEmi(
        principal: Double,
        annualRate: Double,
        tenureMonths: Int
    ): Double {
        if (principal <= 0 || tenureMonths <= 0) return 0.0
        val monthlyRate = annualRate / 12.0 / 100.0
        if (monthlyRate <= 0.0) {
            return principal / tenureMonths
        }
        val factor = (1.0 + monthlyRate).pow(tenureMonths.toDouble())
        if (factor.isInfinite() || factor == 1.0) return principal / tenureMonths
        return principal * monthlyRate * factor / (factor - 1.0)
    }

    fun generateAmortizationSchedule(
        principal: Double,
        annualRate: Double,
        tenureMonths: Int,
        fixedEmi: Double
    ): List<EmiScheduleItem> {
        val schedule = mutableListOf<EmiScheduleItem>()
        var balance = principal
        val monthlyRate = annualRate / 12.0 / 100.0

        for (month in 1..tenureMonths) {
            if (balance <= 0.01) break
            val interestComponent = balance * monthlyRate
            var principalComponent = fixedEmi - interestComponent
            
            // Adjust on final months or if principal component exceeds balance
            if (principalComponent > balance || month == tenureMonths) {
                principalComponent = balance
            }
            if (principalComponent < 0) {
                principalComponent = 0.0
            }

            val closingBalance = max(0.0, balance - principalComponent)
            val actualEmi = principalComponent + interestComponent

            schedule.add(
                EmiScheduleItem(
                    installmentNumber = month,
                    paymentMonthLabel = "Month $month",
                    openingBalance = balance,
                    emiAmount = actualEmi,
                    principalComponent = principalComponent,
                    interestComponent = interestComponent,
                    closingBalance = closingBalance
                )
            )

            balance = closingBalance
        }
        return schedule
    }

    fun calculateEducationLoan(
        disbursements: List<DisbursementInput>,
        annualRate: Double,
        interestType: InterestCalculationType,
        compoundingFrequency: CompoundingFrequency,
        courseDurationYears: Int,
        gracePeriodMonths: Int,
        repaymentDurationYears: Double,
        payInterestDuringCourse: Boolean,
        capitalizeInterest: Boolean,
        processingFee: Double = 0.0
    ): LoanCalculationResult {
        val totalMoratoriumMonths = (courseDurationYears * 12) + gracePeriodMonths
        var totalDisbursed = 0.0
        var totalMoratoriumInterest = 0.0
        val yearWiseDisbursements = mutableMapOf<Int, Double>()

        for (disbursement in disbursements) {
            totalDisbursed += disbursement.amount
            val currentYearTotal = yearWiseDisbursements.getOrDefault(disbursement.academicYear, 0.0)
            yearWiseDisbursements[disbursement.academicYear] = currentYearTotal + disbursement.amount

            val accrualMonths = max(0, totalMoratoriumMonths - disbursement.monthOffsetFromStart)
            val accrualYears = accrualMonths / 12.0

            val itemInterest = when (interestType) {
                InterestCalculationType.SIMPLE -> {
                    disbursement.amount * (annualRate / 100.0) * accrualYears
                }
                InterestCalculationType.COMPOUND -> {
                    val m = compoundingFrequency.periodsPerYear.toDouble()
                    val totalPeriods = accrualYears * m
                    val periodicRate = (annualRate / 100.0) / m
                    disbursement.amount * ((1.0 + periodicRate).pow(totalPeriods) - 1.0)
                }
            }
            totalMoratoriumInterest += itemInterest
        }

        val outstandingAtEmiStart = when {
            payInterestDuringCourse -> totalDisbursed
            capitalizeInterest -> totalDisbursed + totalMoratoriumInterest
            else -> totalDisbursed + totalMoratoriumInterest
        }

        val repaymentTenureMonths = max(1, (repaymentDurationYears * 12).toInt())
        val emi = calculateStandardEmi(outstandingAtEmiStart, annualRate, repaymentTenureMonths)
        val schedule = generateAmortizationSchedule(outstandingAtEmiStart, annualRate, repaymentTenureMonths, emi)

        val totalEmiInterest = schedule.sumOf { it.interestComponent }
        val totalRepayment = schedule.sumOf { it.emiAmount }
        val totalInterestPayable = if (payInterestDuringCourse) {
            totalMoratoriumInterest + totalEmiInterest
        } else {
            outstandingAtEmiStart - totalDisbursed + totalEmiInterest
        }
        val totalCostOfBorrowing = totalRepayment + processingFee + (if (payInterestDuringCourse) totalMoratoriumInterest else 0.0)

        val assumptions = buildString {
            append("Moratorium: $courseDurationYears yrs course + $gracePeriodMonths mos grace = $totalMoratoriumMonths mos total. ")
            append("Interest calculation: ${interestType.displayName}")
            if (interestType == InterestCalculationType.COMPOUND) {
                append(" (${compoundingFrequency.displayName} compounding)")
            }
            append(". ")
            if (payInterestDuringCourse) {
                append("Moratorium interest (₹${round(totalMoratoriumInterest).toLong()}) serviced during course.")
            } else {
                append("Moratorium interest (₹${round(totalMoratoriumInterest).toLong()}) capitalized into principal at repayment start.")
            }
        }

        return LoanCalculationResult(
            loanType = LoanType.EDUCATION,
            totalDisbursedAmount = totalDisbursed,
            moratoriumInterest = totalMoratoriumInterest,
            outstandingBalanceAtEmiStart = outstandingAtEmiStart,
            emiAmount = emi,
            totalRepaymentAmount = totalRepayment,
            totalEmiInterest = totalEmiInterest,
            totalInterestPayable = totalInterestPayable,
            totalCostOfBorrowing = totalCostOfBorrowing,
            repaymentTenureMonths = repaymentTenureMonths,
            schedule = schedule,
            yearWiseDisbursements = yearWiseDisbursements,
            assumptions = assumptions
        )
    }

    fun calculateOtherLoan(
        loanType: LoanType,
        loanAmount: Double,
        annualRate: Double,
        interestType: InterestCalculationType,
        compoundingFrequency: CompoundingFrequency,
        tenureYears: Double,
        processingFee: Double = 0.0,
        prepaymentMonthly: Double = 0.0
    ): LoanCalculationResult {
        val tenureMonths = max(1, (tenureYears * 12).toInt())
        val emi = calculateStandardEmi(loanAmount, annualRate, tenureMonths)
        val schedule = generateAmortizationSchedule(loanAmount, annualRate, tenureMonths, emi + prepaymentMonthly)

        val totalEmiInterest = schedule.sumOf { it.interestComponent }
        val totalRepayment = schedule.sumOf { it.emiAmount }
        val totalCostOfBorrowing = totalRepayment + processingFee

        val assumptions = buildString {
            append("${loanType.displayName}: Principal ₹${round(loanAmount).toLong()} at ${annualRate}% for $tenureYears years. ")
            append("Reducing balance amortized over ${schedule.size} payments.")
            if (prepaymentMonthly > 0) {
                append(" Extra monthly prepayment ₹${round(prepaymentMonthly).toLong()} reduces tenure to ${schedule.size} months.")
            }
        }

        return LoanCalculationResult(
            loanType = loanType,
            totalDisbursedAmount = loanAmount,
            moratoriumInterest = 0.0,
            outstandingBalanceAtEmiStart = loanAmount,
            emiAmount = emi,
            totalRepaymentAmount = totalRepayment,
            totalEmiInterest = totalEmiInterest,
            totalInterestPayable = totalEmiInterest,
            totalCostOfBorrowing = totalCostOfBorrowing,
            repaymentTenureMonths = schedule.size,
            schedule = schedule,
            yearWiseDisbursements = mapOf(1 to loanAmount),
            assumptions = assumptions
        )
    }

    fun calculateSip(
        monthlyInvestment: Double,
        expectedAnnualReturn: Double,
        investmentDurationYears: Int,
        frequency: SipFrequency = SipFrequency.MONTHLY,
        stepUpPercentage: Double = 0.0,
        initialLumpSum: Double = 0.0,
        inflationRate: Double = 0.0,
        goalAmount: Double? = null
    ): SipCalculationResult {
        val installmentsPerYear = frequency.installmentsPerYear
        val totalPeriods = investmentDurationYears * installmentsPerYear
        val periodicRate = if (expectedAnnualReturn > 0) {
            (expectedAnnualReturn / 100.0) / installmentsPerYear
        } else 0.0

        val basePeriodicInvestment = monthlyInvestment * (12.0 / installmentsPerYear)

        var totalInvested = initialLumpSum
        var portfolioValue = initialLumpSum
        val yearlyBreakdown = mutableListOf<SipScheduleItem>()

        var currentPeriodicInvestment = basePeriodicInvestment

        for (period in 1..totalPeriods) {
            val yearIndex = (period - 1) / installmentsPerYear
            // Annual Step-Up applied at the start of each year after Year 1
            if ((period - 1) % installmentsPerYear == 0 && yearIndex > 0) {
                currentPeriodicInvestment *= (1.0 + stepUpPercentage / 100.0)
            }

            totalInvested += currentPeriodicInvestment
            portfolioValue = (portfolioValue + currentPeriodicInvestment) * (1.0 + periodicRate)

            // Capture snapshot at year ends
            if (period % installmentsPerYear == 0 || period == totalPeriods) {
                val currentYear = ((period - 1) / installmentsPerYear) + 1
                val profit = portfolioValue - totalInvested
                yearlyBreakdown.add(
                    SipScheduleItem(
                        yearNumber = currentYear,
                        installmentNumber = period,
                        periodLabel = "Year $currentYear",
                        periodicInvestment = currentPeriodicInvestment,
                        cumulativeInvested = totalInvested,
                        estimatedPortfolioValue = portfolioValue,
                        estimatedProfit = max(0.0, profit)
                    )
                )
            }
        }

        val estimatedReturns = max(0.0, portfolioValue - totalInvested)

        // Regular SIP comparison (without step-up)
        val regularFutureValue = if (periodicRate > 0) {
            val regularPeriodTotal = investmentDurationYears * installmentsPerYear
            val fvAnnuity = basePeriodicInvestment * ((1.0 + periodicRate).pow(regularPeriodTotal.toDouble()) - 1.0) / periodicRate * (1.0 + periodicRate)
            val fvLumpSum = initialLumpSum * (1.0 + periodicRate).pow(regularPeriodTotal.toDouble())
            fvAnnuity + fvLumpSum
        } else {
            basePeriodicInvestment * totalPeriods + initialLumpSum
        }

        // Inflation adjustment
        val inflationAdjustedValue = if (inflationRate > 0) {
            portfolioValue / (1.0 + inflationRate / 100.0).pow(investmentDurationYears.toDouble())
        } else {
            portfolioValue
        }

        val goalAchieved = goalAmount?.let { portfolioValue >= it } ?: false

        return SipCalculationResult(
            monthlyInvestment = monthlyInvestment,
            expectedAnnualReturn = expectedAnnualReturn,
            investmentDurationYears = investmentDurationYears,
            frequency = frequency,
            stepUpPercentage = stepUpPercentage,
            initialLumpSum = initialLumpSum,
            totalInvestedAmount = totalInvested,
            estimatedReturns = estimatedReturns,
            estimatedFutureValue = portfolioValue,
            inflationAdjustedFutureValue = inflationAdjustedValue,
            yearlyBreakdown = yearlyBreakdown,
            regularComparisonFutureValue = regularFutureValue,
            goalAmount = goalAmount,
            goalAchieved = goalAchieved
        )
    }

    fun calculateRequiredMonthlySipForGoal(
        targetAmount: Double,
        expectedAnnualReturn: Double,
        durationYears: Int,
        frequency: SipFrequency = SipFrequency.MONTHLY
    ): Double {
        if (targetAmount <= 0 || durationYears <= 0) return 0.0
        val k = frequency.installmentsPerYear
        val totalPeriods = durationYears * k
        val periodicRate = (expectedAnnualReturn / 100.0) / k
        if (periodicRate <= 0) {
            val periodic = targetAmount / totalPeriods
            return periodic * (k / 12.0)
        }
        val factor = (1.0 + periodicRate).pow(totalPeriods.toDouble()) - 1.0
        val requiredPeriodic = (targetAmount * periodicRate) / (factor * (1.0 + periodicRate))
        return requiredPeriodic * (k / 12.0)
    }

    fun calculateRequiredDurationForGoal(
        targetAmount: Double,
        monthlyInvestment: Double,
        expectedAnnualReturn: Double
    ): Double {
        if (targetAmount <= 0 || monthlyInvestment <= 0) return 0.0
        val monthlyRate = (expectedAnnualReturn / 100.0) / 12.0
        if (monthlyRate <= 0) {
            return (targetAmount / monthlyInvestment) / 12.0
        }
        val argument = 1.0 + (targetAmount * monthlyRate) / (monthlyInvestment * (1.0 + monthlyRate))
        if (argument <= 0) return 0.0
        val totalMonths = ln(argument) / ln(1.0 + monthlyRate)
        return totalMonths / 12.0
    }
}
