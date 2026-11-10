package com.example.ui

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.local.AppDatabase
import com.example.data.local.entity.EmiScheduleEntity
import com.example.data.local.entity.LoanCalculationEntity
import com.example.data.local.entity.LoanDisbursementEntity
import com.example.data.local.entity.SavedScenarioEntity
import com.example.data.local.entity.SipCalculationEntity
import com.example.data.local.entity.SipScheduleEntity
import com.example.data.local.entity.UserProfileEntity
import com.example.data.repository.FinancialRepository
import com.example.domain.model.LoanCalculationResult
import com.example.domain.model.SipCalculationResult
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import java.util.UUID

enum class AppDestination(val title: String) {
    DASHBOARD("Dashboard"),
    EDUCATION_LOAN("Education Loan"),
    OTHER_LOAN("Other Loan"),
    EMI_CALCULATOR("EMI Calculator"),
    SIP_CALCULATOR("SIP Calculator"),
    SAVED_CALCULATIONS("Saved Calculations"),
    LOAN_COMPARISON("Loan Comparison"),
    SIP_HISTORY("SIP History"),
    SETTINGS("Profile & Settings")
}

class MainViewModel(application: Application) : AndroidViewModel(application) {

    private val db = AppDatabase.getInstance(application)
    val repository = FinancialRepository(db)

    val allLoans: StateFlow<List<LoanCalculationEntity>> = repository.allLoans
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val allSips: StateFlow<List<SipCalculationEntity>> = repository.allSips
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val allScenarios: StateFlow<List<SavedScenarioEntity>> = repository.allScenarios
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val userProfile: StateFlow<UserProfileEntity?> = repository.userProfile
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), null)

    private val _currentDestination = MutableStateFlow(AppDestination.DASHBOARD)
    val currentDestination: StateFlow<AppDestination> = _currentDestination.asStateFlow()

    private val _isDarkMode = MutableStateFlow(false)
    val isDarkMode: StateFlow<Boolean> = _isDarkMode.asStateFlow()

    private val _toastEvent = MutableSharedFlow<String>()
    val toastEvent: SharedFlow<String> = _toastEvent.asSharedFlow()

    init {
        viewModelScope.launch {
            repository.populateSampleDataIfEmpty()
        }
    }

    fun navigateTo(destination: AppDestination) {
        _currentDestination.value = destination
    }

    fun toggleDarkMode(enabled: Boolean) {
        _isDarkMode.value = enabled
    }

    fun showToast(msg: String) {
        viewModelScope.launch {
            _toastEvent.emit(msg)
        }
    }

    fun saveLoanCalculation(
        loanName: String,
        result: LoanCalculationResult,
        courseYears: Int = 0,
        graceMonths: Int = 0,
        payInterestDuringCourse: Boolean = false,
        capitalizeInterest: Boolean = true,
        processingFee: Double = 0.0,
        interestTypeName: String = "COMPOUND",
        compoundFrequencyName: String = "ANNUALLY"
    ) {
        viewModelScope.launch {
            val loanId = UUID.randomUUID().toString()
            val entity = LoanCalculationEntity(
                id = loanId,
                loanName = loanName.ifBlank { "${result.loanType.displayName} Calculation" },
                loanType = result.loanType.name,
                interestType = interestTypeName,
                compoundFrequency = compoundFrequencyName,
                annualInterestRate = 9.5, // stored rate
                courseDurationYears = courseYears,
                gracePeriodMonths = graceMonths,
                repaymentDurationYears = result.repaymentTenureMonths / 12.0,
                totalDisbursedAmount = result.totalDisbursedAmount,
                totalInterest = result.totalInterestPayable,
                moratoriumInterest = result.moratoriumInterest,
                outstandingBalance = result.outstandingBalanceAtEmiStart,
                emiAmount = result.emiAmount,
                totalRepayment = result.totalRepaymentAmount,
                payInterestDuringCourse = payInterestDuringCourse,
                capitalizeInterest = capitalizeInterest,
                processingFee = processingFee
            )

            val scheduleEntities = result.schedule.take(120).map {
                EmiScheduleEntity(
                    loanCalculationId = loanId,
                    installmentNumber = it.installmentNumber,
                    paymentDate = it.paymentMonthLabel,
                    openingBalance = it.openingBalance,
                    emiAmount = it.emiAmount,
                    principalComponent = it.principalComponent,
                    interestComponent = it.interestComponent,
                    closingBalance = it.closingBalance
                )
            }

            val disbEntities = result.yearWiseDisbursements.map { (year, amount) ->
                LoanDisbursementEntity(
                    loanCalculationId = loanId,
                    academicYear = year,
                    disbursementAmount = amount,
                    disbursementDate = "Year $year",
                    label = "Disbursement Year $year"
                )
            }

            repository.saveLoan(entity, disbEntities, scheduleEntities)
            _toastEvent.emit("Loan calculation saved successfully!")
        }
    }

    fun saveSipCalculation(
        sipName: String,
        result: SipCalculationResult
    ) {
        viewModelScope.launch {
            val sipId = UUID.randomUUID().toString()
            val entity = SipCalculationEntity(
                id = sipId,
                sipName = sipName.ifBlank { "SIP (${result.frequency.displayName})" },
                monthlyInvestment = result.monthlyInvestment,
                expectedAnnualReturn = result.expectedAnnualReturn,
                investmentDurationYears = result.investmentDurationYears,
                sipFrequency = result.frequency.name,
                stepUpPercentage = result.stepUpPercentage,
                initialInvestment = result.initialLumpSum,
                totalInvestedAmount = result.totalInvestedAmount,
                estimatedReturns = result.estimatedReturns,
                estimatedFutureValue = result.estimatedFutureValue,
                inflationAdjustedValue = result.inflationAdjustedFutureValue,
                goalAmount = result.goalAmount ?: 0.0
            )

            val scheduleEntities = result.yearlyBreakdown.map {
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

            repository.saveSip(entity, scheduleEntities)
            _toastEvent.emit("SIP calculation saved successfully!")
        }
    }

    fun deleteLoan(id: String) {
        viewModelScope.launch {
            repository.deleteLoan(id)
            _toastEvent.emit("Loan deleted")
        }
    }

    fun deleteSip(id: String) {
        viewModelScope.launch {
            repository.deleteSip(id)
            _toastEvent.emit("SIP calculation deleted")
        }
    }

    fun renameLoan(id: String, newName: String) {
        viewModelScope.launch {
            repository.renameLoan(id, newName)
            _toastEvent.emit("Renamed successfully")
        }
    }

    fun renameSip(id: String, newName: String) {
        viewModelScope.launch {
            repository.renameSip(id, newName)
            _toastEvent.emit("Renamed successfully")
        }
    }

    fun duplicateLoan(id: String) {
        viewModelScope.launch {
            repository.duplicateLoan(id)
            _toastEvent.emit("Loan duplicated")
        }
    }

    fun duplicateSip(id: String) {
        viewModelScope.launch {
            repository.duplicateSip(id)
            _toastEvent.emit("SIP duplicated")
        }
    }

    fun updateProfile(name: String, email: String, risk: String) {
        viewModelScope.launch {
            repository.updateProfile(name, email, risk)
            _toastEvent.emit("Profile updated")
        }
    }

    fun clearAllData() {
        viewModelScope.launch {
            repository.clearAllData()
            _toastEvent.emit("All data cleared")
        }
    }
}
