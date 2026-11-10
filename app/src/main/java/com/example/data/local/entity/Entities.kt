package com.example.data.local.entity

import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(tableName = "profiles")
data class UserProfileEntity(
    @PrimaryKey val id: String = "default_user",
    val fullName: String = "Fintech Investor",
    val email: String = "investor@loanwise.in",
    val avatarUrl: String = "",
    val riskProfile: String = "Moderate",
    val defaultCurrency: String = "INR",
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
)

@Entity(
    tableName = "loan_calculations",
    indices = [Index("createdAt"), Index("loanType")]
)
data class LoanCalculationEntity(
    @PrimaryKey val id: String = java.util.UUID.randomUUID().toString(),
    val userId: String = "default_user",
    val loanName: String,
    val loanType: String, // EDUCATION, HOME, PERSONAL, VEHICLE, BUSINESS, CUSTOM
    val interestType: String, // SIMPLE, COMPOUND
    val compoundFrequency: String, // MONTHLY, QUARTERLY, HALF_YEARLY, ANNUALLY
    val annualInterestRate: Double,
    val courseDurationYears: Int = 0,
    val gracePeriodMonths: Int = 0,
    val repaymentDurationYears: Double,
    val totalDisbursedAmount: Double,
    val totalInterest: Double,
    val moratoriumInterest: Double = 0.0,
    val outstandingBalance: Double,
    val emiAmount: Double,
    val totalRepayment: Double,
    val payInterestDuringCourse: Boolean = false,
    val capitalizeInterest: Boolean = true,
    val processingFee: Double = 0.0,
    val calculationDate: Long = System.currentTimeMillis(),
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
)

@Entity(
    tableName = "loan_disbursements",
    foreignKeys = [
        ForeignKey(
            entity = LoanCalculationEntity::class,
            parentColumns = ["id"],
            childColumns = ["loanCalculationId"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [Index("loanCalculationId")]
)
data class LoanDisbursementEntity(
    @PrimaryKey val id: String = java.util.UUID.randomUUID().toString(),
    val loanCalculationId: String,
    val academicYear: Int,
    val disbursementAmount: Double,
    val disbursementDate: String,
    val label: String,
    val createdAt: Long = System.currentTimeMillis()
)

@Entity(
    tableName = "emi_schedules",
    foreignKeys = [
        ForeignKey(
            entity = LoanCalculationEntity::class,
            parentColumns = ["id"],
            childColumns = ["loanCalculationId"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [Index("loanCalculationId")]
)
data class EmiScheduleEntity(
    @PrimaryKey val id: String = java.util.UUID.randomUUID().toString(),
    val loanCalculationId: String,
    val installmentNumber: Int,
    val paymentDate: String,
    val openingBalance: Double,
    val emiAmount: Double,
    val principalComponent: Double,
    val interestComponent: Double,
    val closingBalance: Double,
    val createdAt: Long = System.currentTimeMillis()
)

@Entity(
    tableName = "sip_calculations",
    indices = [Index("createdAt")]
)
data class SipCalculationEntity(
    @PrimaryKey val id: String = java.util.UUID.randomUUID().toString(),
    val userId: String = "default_user",
    val sipName: String,
    val monthlyInvestment: Double,
    val expectedAnnualReturn: Double,
    val investmentDurationYears: Int,
    val sipFrequency: String, // MONTHLY, QUARTERLY, WEEKLY
    val stepUpPercentage: Double = 0.0,
    val initialInvestment: Double = 0.0,
    val totalInvestedAmount: Double,
    val estimatedReturns: Double,
    val estimatedFutureValue: Double,
    val inflationAdjustedValue: Double = 0.0,
    val goalAmount: Double = 0.0,
    val investmentStartDate: String = "Today",
    val calculationDate: Long = System.currentTimeMillis(),
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
)

@Entity(
    tableName = "sip_schedules",
    foreignKeys = [
        ForeignKey(
            entity = SipCalculationEntity::class,
            parentColumns = ["id"],
            childColumns = ["sipCalculationId"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [Index("sipCalculationId")]
)
data class SipScheduleEntity(
    @PrimaryKey val id: String = java.util.UUID.randomUUID().toString(),
    val sipCalculationId: String,
    val installmentNumber: Int,
    val yearNumber: Int,
    val investmentDate: String,
    val investmentAmount: Double,
    val cumulativeInvestment: Double,
    val estimatedPortfolioValue: Double,
    val estimatedProfit: Double,
    val createdAt: Long = System.currentTimeMillis()
)

@Entity(
    tableName = "saved_scenarios",
    indices = [Index("createdAt"), Index("scenarioType")]
)
data class SavedScenarioEntity(
    @PrimaryKey val id: String = java.util.UUID.randomUUID().toString(),
    val userId: String = "default_user",
    val scenarioName: String,
    val scenarioType: String, // LOAN, SIP
    val scenarioData: String, // JSON payload of inputs
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
)
