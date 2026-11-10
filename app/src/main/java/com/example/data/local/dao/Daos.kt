package com.example.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Transaction
import androidx.room.Update
import com.example.data.local.entity.EmiScheduleEntity
import com.example.data.local.entity.LoanCalculationEntity
import com.example.data.local.entity.LoanDisbursementEntity
import com.example.data.local.entity.SavedScenarioEntity
import com.example.data.local.entity.SipCalculationEntity
import com.example.data.local.entity.SipScheduleEntity
import com.example.data.local.entity.UserProfileEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface LoanDao {
    @Query("SELECT * FROM loan_calculations ORDER BY createdAt DESC")
    fun getAllLoans(): Flow<List<LoanCalculationEntity>>

    @Query("SELECT * FROM loan_calculations WHERE id = :id")
    suspend fun getLoanById(id: String): LoanCalculationEntity?

    @Query("SELECT * FROM loan_disbursements WHERE loanCalculationId = :loanId ORDER BY academicYear ASC")
    fun getDisbursementsForLoan(loanId: String): Flow<List<LoanDisbursementEntity>>

    @Query("SELECT * FROM emi_schedules WHERE loanCalculationId = :loanId ORDER BY installmentNumber ASC")
    fun getScheduleForLoan(loanId: String): Flow<List<EmiScheduleEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertLoan(loan: LoanCalculationEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertDisbursements(disbursements: List<LoanDisbursementEntity>)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSchedules(schedules: List<EmiScheduleEntity>)

    @Update
    suspend fun updateLoan(loan: LoanCalculationEntity)

    @Query("UPDATE loan_calculations SET loanName = :newName, updatedAt = :updatedAt WHERE id = :id")
    suspend fun renameLoan(id: String, newName: String, updatedAt: Long = System.currentTimeMillis())

    @Query("DELETE FROM loan_calculations WHERE id = :id")
    suspend fun deleteLoanById(id: String)

    @Query("DELETE FROM loan_calculations")
    suspend fun clearAllLoans()
}

@Dao
interface SipDao {
    @Query("SELECT * FROM sip_calculations ORDER BY createdAt DESC")
    fun getAllSips(): Flow<List<SipCalculationEntity>>

    @Query("SELECT * FROM sip_calculations WHERE id = :id")
    suspend fun getSipById(id: String): SipCalculationEntity?

    @Query("SELECT * FROM sip_schedules WHERE sipCalculationId = :sipId ORDER BY installmentNumber ASC")
    fun getScheduleForSip(sipId: String): Flow<List<SipScheduleEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSip(sip: SipCalculationEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSipSchedules(schedules: List<SipScheduleEntity>)

    @Update
    suspend fun updateSip(sip: SipCalculationEntity)

    @Query("UPDATE sip_calculations SET sipName = :newName, updatedAt = :updatedAt WHERE id = :id")
    suspend fun renameSip(id: String, newName: String, updatedAt: Long = System.currentTimeMillis())

    @Query("DELETE FROM sip_calculations WHERE id = :id")
    suspend fun deleteSipById(id: String)

    @Query("DELETE FROM sip_calculations")
    suspend fun clearAllSips()
}

@Dao
interface ScenarioDao {
    @Query("SELECT * FROM saved_scenarios ORDER BY createdAt DESC")
    fun getAllScenarios(): Flow<List<SavedScenarioEntity>>

    @Query("SELECT * FROM saved_scenarios WHERE scenarioType = :type ORDER BY createdAt DESC")
    fun getScenariosByType(type: String): Flow<List<SavedScenarioEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertScenario(scenario: SavedScenarioEntity)

    @Query("DELETE FROM saved_scenarios WHERE id = :id")
    suspend fun deleteScenarioById(id: String)

    @Query("DELETE FROM saved_scenarios")
    suspend fun clearAllScenarios()
}

@Dao
interface UserDao {
    @Query("SELECT * FROM profiles WHERE id = :id")
    fun getUserProfile(id: String = "default_user"): Flow<UserProfileEntity?>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrUpdateProfile(profile: UserProfileEntity)
}
