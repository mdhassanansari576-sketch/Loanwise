package com.example.data.repository

import com.example.data.local.AppDatabase
import com.example.data.local.entity.EmiScheduleEntity
import com.example.data.local.entity.LoanCalculationEntity
import com.example.data.local.entity.LoanDisbursementEntity
import com.example.data.local.entity.SavedScenarioEntity
import com.example.data.local.entity.SipCalculationEntity
import com.example.data.local.entity.SipScheduleEntity
import com.example.data.local.entity.UserProfileEntity
import com.example.domain.calculator.FinancialCalculator
import com.example.domain.model.CompoundingFrequency
import com.example.domain.model.DisbursementInput
import com.example.domain.model.InterestCalculationType
import com.example.domain.model.LoanType
import com.example.domain.model.SipFrequency
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import java.util.UUID

class FinancialRepository(private val db: AppDatabase) {

    val allLoans: Flow<List<LoanCalculationEntity>> = db.loanDao().getAllLoans()
    val allSips: Flow<List<SipCalculationEntity>> = db.sipDao().getAllSips()
    val allScenarios: Flow<List<SavedScenarioEntity>> = db.scenarioDao().getAllScenarios()
    val userProfile: Flow<UserProfileEntity?> = db.userDao().getUserProfile()

    suspend fun getLoanById(id: String): LoanCalculationEntity? = db.loanDao().getLoanById(id)
    suspend fun getSipById(id: String): SipCalculationEntity? = db.sipDao().getSipById(id)

    fun getDisbursementsForLoan(loanId: String): Flow<List<LoanDisbursementEntity>> =
        db.loanDao().getDisbursementsForLoan(loanId)

    fun getScheduleForLoan(loanId: String): Flow<List<EmiScheduleEntity>> =
        db.loanDao().getScheduleForLoan(loanId)

    fun getScheduleForSip(sipId: String): Flow<List<SipScheduleEntity>> =
        db.sipDao().getScheduleForSip(sipId)

    suspend fun saveLoan(
        loan: LoanCalculationEntity,
        disbursements: List<LoanDisbursementEntity>,
        schedules: List<EmiScheduleEntity>
    ) {
        db.loanDao().insertLoan(loan)
        if (disbursements.isNotEmpty()) {
            db.loanDao().insertDisbursements(disbursements)
        }
        if (schedules.isNotEmpty()) {
            db.loanDao().insertSchedules(schedules)
        }
    }

    suspend fun saveSip(
        sip: SipCalculationEntity,
        schedules: List<SipScheduleEntity>
    ) {
        db.sipDao().insertSip(sip)
        if (schedules.isNotEmpty()) {
            db.sipDao().insertSipSchedules(schedules)
        }
    }

    suspend fun saveScenario(name: String, type: String, jsonData: String) {
        val scenario = SavedScenarioEntity(
            scenarioName = name,
            scenarioType = type,
            scenarioData = jsonData
        )
        db.scenarioDao().insertScenario(scenario)
    }

    suspend fun renameLoan(id: String, newName: String) {
        db.loanDao().renameLoan(id, newName)
    }

    suspend fun renameSip(id: String, newName: String) {
        db.sipDao().renameSip(id, newName)
    }

    suspend fun deleteLoan(id: String) {
        db.loanDao().deleteLoanById(id)
    }

    suspend fun deleteSip(id: String) {
        db.sipDao().deleteSipById(id)
    }

    suspend fun deleteScenario(id: String) {
        db.scenarioDao().deleteScenarioById(id)
    }

    suspend fun duplicateLoan(id: String) {
        val original = db.loanDao().getLoanById(id) ?: return
        val newId = UUID.randomUUID().toString()
        val copy = original.copy(
            id = newId,
            loanName = "${original.loanName} (Copy)",
            createdAt = System.currentTimeMillis(),
            updatedAt = System.currentTimeMillis()
        )
        db.loanDao().insertLoan(copy)
    }

    suspend fun duplicateSip(id: String) {
        val original = db.sipDao().getSipById(id) ?: return
        val newId = UUID.randomUUID().toString()
        val copy = original.copy(
            id = newId,
            sipName = "${original.sipName} (Copy)",
            createdAt = System.currentTimeMillis(),
            updatedAt = System.currentTimeMillis()
        )
        db.sipDao().insertSip(copy)
    }

    suspend fun updateProfile(fullName: String, email: String, riskProfile: String) {
        val profile = UserProfileEntity(
            id = "default_user",
            fullName = fullName,
            email = email,
            riskProfile = riskProfile,
            updatedAt = System.currentTimeMillis()
        )
        db.userDao().insertOrUpdateProfile(profile)
    }

    suspend fun clearAllData() {
        db.loanDao().clearAllLoans()
        db.sipDao().clearAllSips()
        db.scenarioDao().clearAllScenarios()
    }

    suspend fun populateSampleDataIfEmpty() {
        val loans = db.loanDao().getAllLoans().first()
        val sips = db.sipDao().getAllSips().first()
        if (loans.isNotEmpty() || sips.isNotEmpty()) return

        // Create sample user profile
        db.userDao().insertOrUpdateProfile(
            UserProfileEntity(
                fullName = "Aarav Sharma",
                email = "aarav.sharma@loanwise.in",
                riskProfile = "Moderate-Aggressive"
            )
        )

        // Sample 1: 4-Year B.Tech Education Loan (SBI Scholar Scheme)
        val eduDisbursements = listOf(
            DisbursementInput(academicYear = 1, amount = 250000.0, monthOffsetFromStart = 0, label = "Year 1 Tuition & Hostels"),
            DisbursementInput(academicYear = 2, amount = 250000.0, monthOffsetFromStart = 12, label = "Year 2 Tuition & Labs"),
            DisbursementInput(academicYear = 3, amount = 250000.0, monthOffsetFromStart = 24, label = "Year 3 Tuition & Project"),
            DisbursementInput(academicYear = 4, amount = 250000.0, monthOffsetFromStart = 36, label = "Year 4 Tuition & Placement")
        )
        val eduResult = FinancialCalculator.calculateEducationLoan(
            disbursements = eduDisbursements,
            annualRate = 9.5,
            interestType = InterestCalculationType.COMPOUND,
            compoundingFrequency = CompoundingFrequency.ANNUALLY,
            courseDurationYears = 4,
            gracePeriodMonths = 12,
            repaymentDurationYears = 10.0,
            payInterestDuringCourse = false,
            capitalizeInterest = true
        )
        val eduId = UUID.randomUUID().toString()
        val eduEntity = LoanCalculationEntity(
            id = eduId,
            loanName = "B.Tech Education Loan (IIT/NIT)",
            loanType = LoanType.EDUCATION.name,
            interestType = InterestCalculationType.COMPOUND.name,
            compoundFrequency = CompoundingFrequency.ANNUALLY.name,
            annualInterestRate = 9.5,
            courseDurationYears = 4,
            gracePeriodMonths = 12,
            repaymentDurationYears = 10.0,
            totalDisbursedAmount = eduResult.totalDisbursedAmount,
            totalInterest = eduResult.totalInterestPayable,
            moratoriumInterest = eduResult.moratoriumInterest,
            outstandingBalance = eduResult.outstandingBalanceAtEmiStart,
            emiAmount = eduResult.emiAmount,
            totalRepayment = eduResult.totalRepaymentAmount,
            payInterestDuringCourse = false,
            capitalizeInterest = true
        )
        val eduDisbEntities = eduDisbursements.map {
            LoanDisbursementEntity(
                loanCalculationId = eduId,
                academicYear = it.academicYear,
                disbursementAmount = it.amount,
                disbursementDate = "Year ${it.academicYear}",
                label = it.label
            )
        }
        val eduScheduleEntities = eduResult.schedule.take(24).map {
            EmiScheduleEntity(
                loanCalculationId = eduId,
                installmentNumber = it.installmentNumber,
                paymentDate = it.paymentMonthLabel,
                openingBalance = it.openingBalance,
                emiAmount = it.emiAmount,
                principalComponent = it.principalComponent,
                interestComponent = it.interestComponent,
                closingBalance = it.closingBalance
            )
        }
        saveLoan(eduEntity, eduDisbEntities, eduScheduleEntities)

        // Sample 2: Dream Home Loan (30L, 8.4%, 20 Yrs)
        val homeResult = FinancialCalculator.calculateOtherLoan(
            loanType = LoanType.HOME,
            loanAmount = 3000000.0,
            annualRate = 8.4,
            interestType = InterestCalculationType.COMPOUND,
            compoundingFrequency = CompoundingFrequency.MONTHLY,
            tenureYears = 20.0,
            processingFee = 10000.0
        )
        val homeId = UUID.randomUUID().toString()
        val homeEntity = LoanCalculationEntity(
            id = homeId,
            loanName = "Primary Residence Home Loan",
            loanType = LoanType.HOME.name,
            interestType = InterestCalculationType.COMPOUND.name,
            compoundFrequency = CompoundingFrequency.MONTHLY.name,
            annualInterestRate = 8.4,
            repaymentDurationYears = 20.0,
            totalDisbursedAmount = 3000000.0,
            totalInterest = homeResult.totalInterestPayable,
            moratoriumInterest = 0.0,
            outstandingBalance = 3000000.0,
            emiAmount = homeResult.emiAmount,
            totalRepayment = homeResult.totalRepaymentAmount,
            processingFee = 10000.0
        )
        val homeScheduleEntities = homeResult.schedule.take(24).map {
            EmiScheduleEntity(
                loanCalculationId = homeId,
                installmentNumber = it.installmentNumber,
                paymentDate = it.paymentMonthLabel,
                openingBalance = it.openingBalance,
                emiAmount = it.emiAmount,
                principalComponent = it.principalComponent,
                interestComponent = it.interestComponent,
                closingBalance = it.closingBalance
            )
        }
        saveLoan(homeEntity, emptyList(), homeScheduleEntities)

        // Sample 3: Long-term Wealth Creator SIP (15K/month, 13% return, 15 years, 10% step-up)
        val sipResult = FinancialCalculator.calculateSip(
            monthlyInvestment = 15000.0,
            expectedAnnualReturn = 13.0,
            investmentDurationYears = 15,
            frequency = SipFrequency.MONTHLY,
            stepUpPercentage = 10.0,
            initialLumpSum = 50000.0
        )
        val sipId = UUID.randomUUID().toString()
        val sipEntity = SipCalculationEntity(
            id = sipId,
            sipName = "Retirement Wealth Creator (10% Step-Up)",
            monthlyInvestment = 15000.0,
            expectedAnnualReturn = 13.0,
            investmentDurationYears = 15,
            sipFrequency = SipFrequency.MONTHLY.name,
            stepUpPercentage = 10.0,
            initialInvestment = 50000.0,
            totalInvestedAmount = sipResult.totalInvestedAmount,
            estimatedReturns = sipResult.estimatedReturns,
            estimatedFutureValue = sipResult.estimatedFutureValue,
            inflationAdjustedValue = sipResult.inflationAdjustedFutureValue
        )
        val sipSchedules = sipResult.yearlyBreakdown.map {
            SipScheduleEntity(
                sipCalculationId = sipId,
                installmentNumber = it.installmentNumber,
                yearNumber = it.yearNumber,
                investmentDate = it.periodLabel,
                investmentAmount = it.periodicInvestment,
                cumulativeInvestment = it.cumulativeInvested,
                estimatedPortfolioValue = it.estimatedPortfolioValue,
                estimatedProfit = it.estimatedProfit
            )
        }
        saveSip(sipEntity, sipSchedules)
    }
}
