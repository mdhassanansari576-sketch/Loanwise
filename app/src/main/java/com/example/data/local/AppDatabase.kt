package com.example.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import com.example.data.local.dao.LoanDao
import com.example.data.local.dao.ScenarioDao
import com.example.data.local.dao.SipDao
import com.example.data.local.dao.UserDao
import com.example.data.local.entity.EmiScheduleEntity
import com.example.data.local.entity.LoanCalculationEntity
import com.example.data.local.entity.LoanDisbursementEntity
import com.example.data.local.entity.SavedScenarioEntity
import com.example.data.local.entity.SipCalculationEntity
import com.example.data.local.entity.SipScheduleEntity
import com.example.data.local.entity.UserProfileEntity

@Database(
    entities = [
        UserProfileEntity::class,
        LoanCalculationEntity::class,
        LoanDisbursementEntity::class,
        EmiScheduleEntity::class,
        SipCalculationEntity::class,
        SipScheduleEntity::class,
        SavedScenarioEntity::class
    ],
    version = 1,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {

    abstract fun loanDao(): LoanDao
    abstract fun sipDao(): SipDao
    abstract fun scenarioDao(): ScenarioDao
    abstract fun userDao(): UserDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getInstance(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "loanwise_database.db"
                )
                    .fallbackToDestructiveMigration()
                    .build()
                INSTANCE = instance
                instance
            }
        }
    }
}
