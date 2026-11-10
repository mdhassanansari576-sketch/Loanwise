package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccountBalance
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.DirectionsCar
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Work
import androidx.compose.material.icons.filled.Tune
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.derivedStateOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableDoubleStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.domain.calculator.CurrencyFormatter
import com.example.domain.calculator.FinancialCalculator
import com.example.domain.model.CompoundingFrequency
import com.example.domain.model.InterestCalculationType
import com.example.domain.model.LoanType
import com.example.ui.MainViewModel
import com.example.ui.components.AmortizationTable
import com.example.ui.components.ChartSlice
import com.example.ui.components.FinancialDonutChart
import com.example.ui.components.FintechCard
import com.example.ui.components.GrowthLineChart
import com.example.ui.components.MetricTile
import com.example.ui.components.PrimaryHeroMetricCard
import com.example.ui.components.SliderInputField
import com.example.ui.theme.Amber500
import com.example.ui.theme.Blue600
import com.example.ui.theme.Cyan500
import com.example.ui.theme.Emerald500
import com.example.ui.theme.Indigo600
import com.example.ui.theme.Rose500

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun OtherLoanScreen(
    viewModel: MainViewModel,
    modifier: Modifier = Modifier
) {
    var selectedLoanType by remember { mutableStateOf(LoanType.HOME) }
    var loanAmount by remember { mutableDoubleStateOf(2500000.0) }
    var annualInterestRate by remember { mutableDoubleStateOf(8.5) }
    var interestType by remember { mutableStateOf(InterestCalculationType.COMPOUND) }
    var compoundingFrequency by remember { mutableStateOf(CompoundingFrequency.MONTHLY) }
    var tenureYears by remember { mutableDoubleStateOf(15.0) }
    var processingFee by remember { mutableDoubleStateOf(10000.0) }
    var prepaymentMonthly by remember { mutableDoubleStateOf(0.0) }

    var showSaveDialog by remember { mutableStateOf(false) }
    var loanSaveName by remember { mutableStateOf("") }

    // When loan type changes, update default interest rate
    fun selectType(type: LoanType) {
        selectedLoanType = type
        annualInterestRate = type.defaultRate
        if (type == LoanType.PERSONAL) {
            loanAmount = 500000.0
            tenureYears = 5.0
        } else if (type == LoanType.HOME) {
            loanAmount = 3500000.0
            tenureYears = 20.0
        } else if (type == LoanType.VEHICLE) {
            loanAmount = 800000.0
            tenureYears = 7.0
        } else if (type == LoanType.BUSINESS) {
            loanAmount = 1500000.0
            tenureYears = 5.0
        }
    }

    val calculationResult by remember(
        selectedLoanType,
        loanAmount,
        annualInterestRate,
        interestType,
        compoundingFrequency,
        tenureYears,
        processingFee,
        prepaymentMonthly
    ) {
        derivedStateOf {
            FinancialCalculator.calculateOtherLoan(
                loanType = selectedLoanType,
                loanAmount = loanAmount,
                annualRate = annualInterestRate,
                interestType = interestType,
                compoundingFrequency = compoundingFrequency,
                tenureYears = tenureYears,
                processingFee = processingFee,
                prepaymentMonthly = prepaymentMonthly
            )
        }
    }

    // Baseline calculation without prepayment for comparison
    val baselineResult by remember(selectedLoanType, loanAmount, annualInterestRate, tenureYears) {
        derivedStateOf {
            FinancialCalculator.calculateOtherLoan(
                loanType = selectedLoanType,
                loanAmount = loanAmount,
                annualRate = annualInterestRate,
                interestType = InterestCalculationType.COMPOUND,
                compoundingFrequency = CompoundingFrequency.MONTHLY,
                tenureYears = tenureYears,
                processingFee = processingFee,
                prepaymentMonthly = 0.0
            )
        }
    }

    val interestSaved = baselineResult.totalInterestPayable - calculationResult.totalInterestPayable
    val monthsSaved = (tenureYears * 12).toInt() - calculationResult.repaymentTenureMonths

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Spacer(modifier = Modifier.height(4.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(38.dp)
                        .clip(CircleShape)
                        .background(MaterialTheme.colorScheme.secondaryContainer),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.AccountBalance,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.secondary,
                        modifier = Modifier.size(22.dp)
                    )
                }
                Spacer(modifier = Modifier.width(10.dp))
                Column {
                    Text(
                        text = "Other Loan Calculator",
                        style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Text(
                        text = "Home, Personal, Car, Business & Custom Loans",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        }

        // Loan Category Chips
        item {
            FintechCard {
                Text(
                    text = "Select Loan Category",
                    style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                    color = MaterialTheme.colorScheme.primary
                )
                Spacer(modifier = Modifier.height(10.dp))

                FlowRow(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    val categories = listOf(
                        LoanType.HOME to Icons.Default.Home,
                        LoanType.PERSONAL to Icons.Default.Person,
                        LoanType.VEHICLE to Icons.Default.DirectionsCar,
                        LoanType.BUSINESS to Icons.Default.Work,
                        LoanType.CUSTOM to Icons.Default.Tune
                    )

                    categories.forEach { (type, icon) ->
                        val isSelected = selectedLoanType == type
                        FilterChip(
                            selected = isSelected,
                            onClick = { selectType(type) },
                            leadingIcon = {
                                Icon(
                                    imageVector = icon,
                                    contentDescription = null,
                                    modifier = Modifier.size(16.dp)
                                )
                            },
                            label = { Text(type.displayName) },
                            shape = RoundedCornerShape(12.dp),
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = MaterialTheme.colorScheme.primaryContainer,
                                selectedLabelColor = MaterialTheme.colorScheme.onPrimaryContainer
                            )
                        )
                    }
                }
            }
        }

        // Inputs: Loan Amount, Interest Rate, Tenure, Prepayment
        item {
            FintechCard {
                Text(
                    text = "Loan Parameters",
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                    color = MaterialTheme.colorScheme.onSurface
                )
                Spacer(modifier = Modifier.height(10.dp))

                // Loan Amount
                SliderInputField(
                    label = "Loan Amount",
                    value = loanAmount,
                    onValueChange = { loanAmount = it },
                    range = 50000.0..10000000.0,
                    step = 50000f,
                    displayFormatter = { CurrencyFormatter.formatInr(it) },
                    quickPresets = listOf(
                        "₹5L" to 500000.0,
                        "₹10L" to 1000000.0,
                        "₹25L" to 2500000.0,
                        "₹50L" to 5000000.0,
                        "₹1Cr" to 10000000.0
                    )
                )

                Spacer(modifier = Modifier.height(8.dp))

                // Interest Rate
                SliderInputField(
                    label = "Annual Interest Rate",
                    value = annualInterestRate,
                    onValueChange = { annualInterestRate = it },
                    range = 4.0..24.0,
                    step = 0.25f,
                    displayFormatter = { String.format("%.2f%% p.a.", it) },
                    quickPresets = listOf("7.5%" to 7.5, "8.5%" to 8.5, "10.5%" to 10.5, "13.0%" to 13.0)
                )

                Spacer(modifier = Modifier.height(8.dp))

                // Tenure Years
                SliderInputField(
                    label = "Loan Tenure",
                    value = tenureYears,
                    onValueChange = { tenureYears = it },
                    range = 1.0..30.0,
                    step = 1f,
                    displayFormatter = { "${it.toInt()} Years (${(it * 12).toInt()} mos)" },
                    quickPresets = listOf("3 Yrs" to 3.0, "5 Yrs" to 5.0, "10 Yrs" to 10.0, "20 Yrs" to 20.0, "30 Yrs" to 30.0)
                )

                Spacer(modifier = Modifier.height(10.dp))
                HorizontalDivider(color = MaterialTheme.colorScheme.outline.copy(alpha = 0.3f))
                Spacer(modifier = Modifier.height(10.dp))

                // Optional Prepayment Slider
                SliderInputField(
                    label = "Extra Monthly Prepayment",
                    value = prepaymentMonthly,
                    onValueChange = { prepaymentMonthly = it },
                    range = 0.0..50000.0,
                    step = 1000f,
                    displayFormatter = { if (it <= 0) "None (₹0)" else "+${CurrencyFormatter.formatInr(it)}/mo" },
                    quickPresets = listOf("None" to 0.0, "+₹2,000" to 2000.0, "+₹5,000" to 5000.0, "+₹10,000" to 10000.0)
                )

                if (prepaymentMonthly > 0 && monthsSaved > 0) {
                    Spacer(modifier = Modifier.height(8.dp))
                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = Emerald500.copy(alpha = 0.15f)
                    ) {
                        Column(modifier = Modifier.padding(12.dp)) {
                            Text(
                                text = "🎉 Prepayment Advantage:",
                                style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                                color = Emerald500
                            )
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(
                                text = "You will save ${CurrencyFormatter.formatInr(interestSaved)} in interest and close your loan $monthsSaved months earlier!",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                        }
                    }
                }
            }
        }

        // Hero Summary Card: Monthly EMI
        item {
            PrimaryHeroMetricCard(
                title = "Monthly EMI",
                primaryValue = "${CurrencyFormatter.formatInr(calculationResult.emiAmount)} / mo",
                subtitle = "Total Repayment: ${CurrencyFormatter.formatInr(calculationResult.totalRepaymentAmount)}",
                badgeText = "${selectedLoanType.displayName}",
                gradientColors = listOf(Indigo600, Blue600)
            )
        }

        // Breakdown Metric Tiles
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                MetricTile(
                    label = "Principal Amount",
                    value = CurrencyFormatter.formatInr(calculationResult.totalDisbursedAmount),
                    subValue = "Disbursed to borrower",
                    accentColor = Blue600,
                    modifier = Modifier.weight(1f)
                )
                MetricTile(
                    label = "Total Interest",
                    value = CurrencyFormatter.formatInr(calculationResult.totalInterestPayable),
                    subValue = "${String.format("%.1f", (calculationResult.totalInterestPayable / calculationResult.totalRepaymentAmount * 100))}% of total repayment",
                    accentColor = Rose500,
                    modifier = Modifier.weight(1f)
                )
            }
        }

        // Donut Chart: Principal vs Interest
        item {
            FintechCard {
                Text(
                    text = "Principal vs Interest Share",
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                    color = MaterialTheme.colorScheme.onSurface
                )
                Spacer(modifier = Modifier.height(12.dp))

                val slices = listOf(
                    ChartSlice(
                        label = "Principal",
                        value = calculationResult.totalDisbursedAmount,
                        color = Blue600
                    ),
                    ChartSlice(
                        label = "Total Interest",
                        value = calculationResult.totalInterestPayable,
                        color = Rose500
                    )
                )

                FinancialDonutChart(
                    slices = slices,
                    centerTitle = "Total Repayment",
                    centerValue = CurrencyFormatter.formatInrCompact(calculationResult.totalRepaymentAmount)
                )
            }
        }

        // Balance Reduction Line Chart
        item {
            FintechCard {
                val balancePoints = calculationResult.schedule.take(36).map { it.closingBalance }
                GrowthLineChart(
                    dataPoints = balancePoints,
                    lineColor = Blue600,
                    title = "Loan Balance Amortization Trajectory (Months 1–36)"
                )
            }
        }

        // Amortization Table
        item {
            FintechCard {
                AmortizationTable(schedule = calculationResult.schedule)
            }
        }

        // Save Action
        item {
            Button(
                onClick = {
                    loanSaveName = "${selectedLoanType.displayName} - ${CurrencyFormatter.formatInrCompact(loanAmount)}"
                    showSaveDialog = true
                },
                shape = RoundedCornerShape(16.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Indigo600),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp)
            ) {
                Icon(imageVector = Icons.Default.Bookmark, contentDescription = null)
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "Save Loan Calculation",
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                )
            }
        }

        item {
            Spacer(modifier = Modifier.height(24.dp))
        }
    }

    if (showSaveDialog) {
        AlertDialog(
            onDismissRequest = { showSaveDialog = false },
            title = { Text("Save Loan Calculation") },
            text = {
                Column {
                    Text("Enter a label for this loan scenario:")
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedTextField(
                        value = loanSaveName,
                        onValueChange = { loanSaveName = it },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        viewModel.saveLoanCalculation(
                            loanName = loanSaveName,
                            result = calculationResult,
                            processingFee = processingFee,
                            interestTypeName = interestType.name,
                            compoundFrequencyName = compoundingFrequency.name
                        )
                        showSaveDialog = false
                    }
                ) {
                    Text("Save to Database")
                }
            },
            dismissButton = {
                TextButton(onClick = { showSaveDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }
}
