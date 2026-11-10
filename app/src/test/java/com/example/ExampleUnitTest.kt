package com.example

import com.example.domain.calculator.CurrencyFormatter
import com.example.domain.calculator.FinancialCalculator
import com.example.domain.model.CompoundingFrequency
import com.example.domain.model.DisbursementInput
import com.example.domain.model.InterestCalculationType
import com.example.domain.model.SipFrequency
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import kotlin.math.round

class ExampleUnitTest {

    @Test
    fun testCurrencyFormatter() {
        assertEquals("₹1,00,000", CurrencyFormatter.formatInr(100000.0))
        assertEquals("₹1,25,000", CurrencyFormatter.formatInr(125000.0))
        assertEquals("₹10.00 L", CurrencyFormatter.formatInrCompact(1000000.0))
        assertEquals("₹1.50 Cr", CurrencyFormatter.formatInrCompact(15000000.0))
    }

    @Test
    fun testStandardEmiCalculation() {
        // Principal: 10,00,000, 12% p.a., 12 months (1 year)
        val emi = FinancialCalculator.calculateStandardEmi(
            principal = 1000000.0,
            annualRate = 12.0,
            tenureMonths = 12
        )
        assertEquals(88849.0, round(emi), 2.0)
    }

    @Test
    fun testEducationLoanMoratoriumCalculation() {
        val disbursements = listOf(
            DisbursementInput(academicYear = 1, amount = 200000.0, monthOffsetFromStart = 0),
            DisbursementInput(academicYear = 2, amount = 200000.0, monthOffsetFromStart = 12)
        )
        val result = FinancialCalculator.calculateEducationLoan(
            disbursements = disbursements,
            annualRate = 10.0,
            interestType = InterestCalculationType.SIMPLE,
            compoundingFrequency = CompoundingFrequency.ANNUALLY,
            courseDurationYears = 2,
            gracePeriodMonths = 12, // 36 months total moratorium
            repaymentDurationYears = 5.0,
            payInterestDuringCourse = false,
            capitalizeInterest = true
        )

        assertEquals(400000.0, result.totalDisbursedAmount, 0.01)
        assertTrue("Moratorium interest must be greater than 0", result.moratoriumInterest > 0)
        assertTrue("Outstanding balance at EMI start must include capitalized interest", result.outstandingBalanceAtEmiStart > result.totalDisbursedAmount)
        assertTrue("EMI must be positive", result.emiAmount > 0)
    }

    @Test
    fun testSipCalculation() {
        // Monthly investment: ₹10,000, Return: 12% p.a., 10 Years
        val result = FinancialCalculator.calculateSip(
            monthlyInvestment = 10000.0,
            expectedAnnualReturn = 12.0,
            investmentDurationYears = 10,
            frequency = SipFrequency.MONTHLY,
            stepUpPercentage = 0.0
        )

        assertEquals(1200000.0, result.totalInvestedAmount, 1.0)
        assertTrue("Future value must exceed invested amount significantly due to compounding", result.estimatedFutureValue > 2200000.0)
        assertTrue("Returns must be positive", result.estimatedReturns > 1000000.0)
    }

    @Test
    fun testStepUpSipHigherThanRegularSip() {
        val regular = FinancialCalculator.calculateSip(
            monthlyInvestment = 10000.0,
            expectedAnnualReturn = 12.0,
            investmentDurationYears = 10,
            stepUpPercentage = 0.0
        )
        val stepUp = FinancialCalculator.calculateSip(
            monthlyInvestment = 10000.0,
            expectedAnnualReturn = 12.0,
            investmentDurationYears = 10,
            stepUpPercentage = 10.0
        )
        assertTrue("Step-up SIP future value must exceed regular SIP", stepUp.estimatedFutureValue > regular.estimatedFutureValue)
    }

    @Test
    fun testGoalPlannerReverseSip() {
        val target = 10000000.0 // 1 Crore
        val rate = 12.0
        val years = 15
        val requiredMonthly = FinancialCalculator.calculateRequiredMonthlySipForGoal(
            targetAmount = target,
            expectedAnnualReturn = rate,
            durationYears = years
        )

        val forwardResult = FinancialCalculator.calculateSip(
            monthlyInvestment = requiredMonthly,
            expectedAnnualReturn = rate,
            investmentDurationYears = years,
            stepUpPercentage = 0.0
        )
        assertEquals(target, forwardResult.estimatedFutureValue, 5000.0)
    }
}
