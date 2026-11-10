package com.example.ui.screens

import androidx.compose.animation.AnimatedVisibility
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
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.RestartAlt
import androidx.compose.material.icons.filled.School
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.derivedStateOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableDoubleStateOf
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import com.example.domain.calculator.CurrencyFormatter
import com.example.domain.calculator.FinancialCalculator
import com.example.domain.model.CompoundingFrequency
import com.example.domain.model.DisbursementInput
import com.example.domain.model.InterestCalculationType
import com.example.ui.MainViewModel
import com.example.ui.components.AmortizationTable
import com.example.ui.components.ChartSlice
import com.example.ui.components.FinancialDonutChart
import com.example.ui.components.FintechCard
import com.example.ui.components.GrowthLineChart
import com.example.ui.components.MetricTile
import com.example.ui.components.PrimaryHeroMetricCard
import com.example.ui.components.SliderInputField
import com.example.ui.components.YearWiseBarChart
import com.example.ui.theme.Amber500
import com.example.ui.theme.Blue600
import com.example.ui.theme.Cyan500
import com.example.ui.theme.Emerald500
import com.example.ui.theme.Indigo600
import com.example.ui.theme.Rose500
import java.util.UUID

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun EducationLoanScreen(
    viewModel: MainViewModel,
    modifier: Modifier = Modifier
) {
    // A. Course & Repayment Details State
    var courseDurationYears by remember { mutableIntStateOf(4) }
    var annualInterestRate by remember { mutableDoubleStateOf(9.5) }
    var interestType by remember { mutableStateOf(InterestCalculationType.COMPOUND) }
    var compoundingFrequency by remember { mutableStateOf(CompoundingFrequency.ANNUALLY) }
    var gracePeriodMonths by remember { mutableIntStateOf(12) }
    var repaymentDurationYears by remember { mutableDoubleStateOf(10.0) }
    var payInterestDuringCourse by remember { mutableStateOf(false) }
    var capitalizeInterest by remember { mutableStateOf(true) }

    // B. Year-wise Loan Disbursements
    val disbursements = remember {
        mutableStateListOf(
            DisbursementInput(academicYear = 1, amount = 200000.0, monthOffsetFromStart = 0, label = "Year 1 Tuition"),
            DisbursementInput(academicYear = 2, amount = 300000.0, monthOffsetFromStart = 12, label = "Year 2 Tuition"),
            DisbursementInput(academicYear = 3, amount = 250000.0, monthOffsetFromStart = 24, label = "Year 3 Tuition"),
            DisbursementInput(academicYear = 4, amount = 250000.0, monthOffsetFromStart = 36, label = "Year 4 Tuition")
        )
    }

    // Sync disbursement rows when courseDurationYears changes
    fun syncDisbursementRows(newDuration: Int) {
        courseDurationYears = newDuration
        val currentMaxYear = disbursements.maxOfOrNull { it.academicYear } ?: 0
        if (newDuration > currentMaxYear) {
            for (y in (currentMaxYear + 1)..newDuration) {
                disbursements.add(
                    DisbursementInput(
                        academicYear = y,
                        amount = 250000.0,
                        monthOffsetFromStart = (y - 1) * 12,
                        label = "Year $y Tuition"
                    )
                )
            }
        } else if (newDuration < currentMaxYear) {
            disbursements.removeAll { it.academicYear > newDuration }
        }
    }

    var showSaveDialog by remember { mutableStateOf(false) }
    var loanSaveName by remember { mutableStateOf("B.Tech / Masters Education Loan") }

    // Real-time calculation engine execution
    val calculationResult by remember(
        disbursements.toList(),
        annualInterestRate,
        interestType,
        compoundingFrequency,
        courseDurationYears,
        gracePeriodMonths,
        repaymentDurationYears,
        payInterestDuringCourse,
        capitalizeInterest
    ) {
        derivedStateOf {
            FinancialCalculator.calculateEducationLoan(
                disbursements = disbursements.toList(),
                annualRate = annualInterestRate,
                interestType = interestType,
                compoundingFrequency = compoundingFrequency,
                courseDurationYears = courseDurationYears,
                gracePeriodMonths = gracePeriodMonths,
                repaymentDurationYears = repaymentDurationYears,
                payInterestDuringCourse = payInterestDuringCourse,
                capitalizeInterest = capitalizeInterest
            )
        }
    }

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
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(38.dp)
                            .clip(CircleShape)
                            .background(MaterialTheme.colorScheme.primaryContainer),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.School,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.size(22.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(10.dp))
                    Column {
                        Text(
                            text = "Education Loan Calculator",
                            style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Text(
                            text = "Accrual during Moratorium & Reducing EMI",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }

                IconButton(
                    onClick = {
                        annualInterestRate = 9.5
                        gracePeriodMonths = 12
                        repaymentDurationYears = 10.0
                        payInterestDuringCourse = false
                        capitalizeInterest = true
                        syncDisbursementRows(4)
                        viewModel.showToast("Inputs reset to defaults")
                    }
                ) {
                    Icon(
                        imageVector = Icons.Default.RestartAlt,
                        contentDescription = "Reset Form",
                        tint = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        }

        // Section 1: Course & Moratorium Parameters
        item {
            FintechCard {
                Text(
                    text = "1. Course & Moratorium Details",
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                    color = MaterialTheme.colorScheme.primary
                )
                Spacer(modifier = Modifier.height(10.dp))

                // Course Duration
                SliderInputField(
                    label = "Course Duration",
                    value = courseDurationYears.toDouble(),
                    onValueChange = { syncDisbursementRows(it.toInt()) },
                    range = 1.0..10.0,
                    step = 1f,
                    displayFormatter = { "${it.toInt()} Years" },
                    quickPresets = listOf("2 Yrs" to 2.0, "3 Yrs" to 3.0, "4 Yrs" to 4.0, "5 Yrs" to 5.0)
                )

                Spacer(modifier = Modifier.height(8.dp))

                // Annual Interest Rate
                SliderInputField(
                    label = "Annual Interest Rate",
                    value = annualInterestRate,
                    onValueChange = { annualInterestRate = it },
                    range = 5.0..18.0,
                    step = 0.25f,
                    displayFormatter = { String.format("%.2f%% p.a.", it) },
                    quickPresets = listOf("8.5%" to 8.5, "9.5%" to 9.5, "10.5%" to 10.5, "12.0%" to 12.0)
                )

                Spacer(modifier = Modifier.height(12.dp))

                // Interest Calculation Type: Simple vs Compound
                Text(
                    text = "Interest Calculation Type",
                    style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.SemiBold),
                    color = MaterialTheme.colorScheme.onSurface
                )
                Spacer(modifier = Modifier.height(6.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    InterestCalculationType.values().forEach { type ->
                        FilterChip(
                            selected = interestType == type,
                            onClick = { interestType = type },
                            label = { Text(type.displayName) },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = MaterialTheme.colorScheme.primaryContainer,
                                selectedLabelColor = MaterialTheme.colorScheme.onPrimaryContainer
                            )
                        )
                    }
                }

                // If Compound, choose compounding frequency
                if (interestType == InterestCalculationType.COMPOUND) {
                    Spacer(modifier = Modifier.height(10.dp))
                    Text(
                        text = "Compounding Frequency",
                        style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Medium),
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    FlowRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        CompoundingFrequency.values().forEach { freq ->
                            FilterChip(
                                selected = compoundingFrequency == freq,
                                onClick = { compoundingFrequency = freq },
                                label = { Text(freq.displayName, style = MaterialTheme.typography.labelSmall) }
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Grace Period
                SliderInputField(
                    label = "Grace Period After Course",
                    value = gracePeriodMonths.toDouble(),
                    onValueChange = { gracePeriodMonths = it.toInt() },
                    range = 0.0..24.0,
                    step = 3f,
                    displayFormatter = { "${it.toInt()} Months" },
                    quickPresets = listOf("0 Mo" to 0.0, "6 Mo" to 6.0, "12 Mo" to 12.0, "18 Mo" to 18.0)
                )

                Spacer(modifier = Modifier.height(8.dp))

                // EMI Repayment Duration
                SliderInputField(
                    label = "EMI Repayment Duration",
                    value = repaymentDurationYears,
                    onValueChange = { repaymentDurationYears = it },
                    range = 1.0..30.0,
                    step = 1f,
                    displayFormatter = { "${it.toInt()} Years (${(it * 12).toInt()} EMIs)" },
                    quickPresets = listOf("5 Yrs" to 5.0, "7 Yrs" to 7.0, "10 Yrs" to 10.0, "15 Yrs" to 15.0)
                )

                Spacer(modifier = Modifier.height(10.dp))
                HorizontalDivider(color = MaterialTheme.colorScheme.outline.copy(alpha = 0.3f))
                Spacer(modifier = Modifier.height(10.dp))

                // Moratorium Interest Payment Options
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "Pay Interest During Course",
                            style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.SemiBold),
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Text(
                            text = "Reduces outstanding principal balance at EMI start.",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                    Switch(
                        checked = payInterestDuringCourse,
                        onCheckedChange = { payInterestDuringCourse = it }
                    )
                }

                if (!payInterestDuringCourse) {
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "Capitalize Moratorium Interest",
                                style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.SemiBold),
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            Text(
                                text = "Adds accrued interest into principal before computing EMI.",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                        Switch(
                            checked = capitalizeInterest,
                            onCheckedChange = { capitalizeInterest = it }
                        )
                    }
                }
            }
        }

        // Section 2: Year-wise Loan Disbursements
        item {
            FintechCard {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column {
                        Text(
                            text = "2. Year-wise Loan Disbursements",
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                            color = MaterialTheme.colorScheme.primary
                        )
                        Text(
                            text = "Disbursements accrue interest from their individual release dates.",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }

                    Surface(
                        shape = RoundedCornerShape(8.dp),
                        color = MaterialTheme.colorScheme.primaryContainer
                    ) {
                        Text(
                            text = "Total: ${CurrencyFormatter.formatInr(calculationResult.totalDisbursedAmount)}",
                            style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                            color = MaterialTheme.colorScheme.onPrimaryContainer,
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                disbursements.forEachIndexed { index, item ->
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 4.dp),
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(
                            containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f)
                        )
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = "Academic Year ${item.academicYear}",
                                    style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                                Text(
                                    text = item.label,
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }

                            OutlinedTextField(
                                value = if (item.amount > 0) item.amount.toLong().toString() else "",
                                onValueChange = { str ->
                                    val newAmt = str.filter { it.isDigit() }.toDoubleOrNull() ?: 0.0
                                    disbursements[index] = item.copy(amount = newAmt)
                                },
                                prefix = { Text("₹") },
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                                modifier = Modifier.width(135.dp),
                                singleLine = true,
                                shape = RoundedCornerShape(10.dp)
                            )

                            if (disbursements.size > 1) {
                                IconButton(
                                    onClick = { disbursements.removeAt(index) },
                                    modifier = Modifier.size(36.dp)
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.Delete,
                                        contentDescription = "Remove tranche",
                                        tint = MaterialTheme.colorScheme.error,
                                        modifier = Modifier.size(18.dp)
                                    )
                                }
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                OutlinedButton(
                    onClick = {
                        val maxYear = disbursements.maxOfOrNull { it.academicYear } ?: 1
                        disbursements.add(
                            DisbursementInput(
                                academicYear = maxYear,
                                amount = 100000.0,
                                monthOffsetFromStart = (maxYear - 1) * 12 + 6,
                                label = "Year $maxYear Sem 2 / Lab Fee"
                            )
                        )
                    },
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Icon(imageVector = Icons.Default.Add, contentDescription = null, modifier = Modifier.size(18.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Add Additional Disbursement Installment")
                }
            }
        }

        // Section 3: Comprehensive Results Dashboard
        item {
            PrimaryHeroMetricCard(
                title = "Monthly EMI Repayment",
                primaryValue = "${CurrencyFormatter.formatInr(calculationResult.emiAmount)} / mo",
                subtitle = "Repayment starts after ${courseDurationYears * 12 + gracePeriodMonths} months total moratorium.",
                badgeText = "${repaymentDurationYears.toInt()} Years Tenure",
                gradientColors = listOf(Blue600, Indigo600)
            )
        }

        // Key Summary Metric Tiles
        item {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    MetricTile(
                        label = "Total Disbursed",
                        value = CurrencyFormatter.formatInr(calculationResult.totalDisbursedAmount),
                        subValue = "Tuition & living fees",
                        accentColor = Blue600,
                        modifier = Modifier.weight(1f)
                    )
                    MetricTile(
                        label = "Moratorium Interest",
                        value = CurrencyFormatter.formatInr(calculationResult.moratoriumInterest),
                        subValue = if (payInterestDuringCourse) "Paid during study" else "Capitalized to balance",
                        accentColor = Amber500,
                        modifier = Modifier.weight(1f)
                    )
                }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    MetricTile(
                        label = "Outstanding at EMI Start",
                        value = CurrencyFormatter.formatInr(calculationResult.outstandingBalanceAtEmiStart),
                        subValue = "Base for reducing EMI",
                        accentColor = Cyan500,
                        modifier = Modifier.weight(1f)
                    )
                    MetricTile(
                        label = "Total Repayment",
                        value = CurrencyFormatter.formatInr(calculationResult.totalRepaymentAmount),
                        subValue = "Total cost to borrower",
                        accentColor = Emerald500,
                        modifier = Modifier.weight(1f)
                    )
                }
            }
        }

        // Donut Chart: Principal vs Moratorium vs EMI Interest
        item {
            FintechCard {
                Text(
                    text = "Financial Breakdown",
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                    color = MaterialTheme.colorScheme.onSurface
                )
                Spacer(modifier = Modifier.height(12.dp))

                val slices = listOf(
                    ChartSlice(
                        label = "Disbursed Principal",
                        value = calculationResult.totalDisbursedAmount,
                        color = Blue600
                    ),
                    ChartSlice(
                        label = "Moratorium Interest",
                        value = calculationResult.moratoriumInterest,
                        color = Amber500
                    ),
                    ChartSlice(
                        label = "EMI Repayment Interest",
                        value = calculationResult.totalEmiInterest,
                        color = Rose500
                    )
                )

                FinancialDonutChart(
                    slices = slices,
                    centerTitle = "Total Borrowing Cost",
                    centerValue = CurrencyFormatter.formatInrCompact(calculationResult.totalCostOfBorrowing)
                )
            }
        }

        // Bar Chart: Year-wise Disbursements
        item {
            FintechCard {
                Text(
                    text = "Year-wise Loan Disbursements",
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                    color = MaterialTheme.colorScheme.onSurface
                )
                Spacer(modifier = Modifier.height(6.dp))

                val barData = calculationResult.yearWiseDisbursements.map { (year, amt) ->
                    "Yr $year" to amt
                }

                YearWiseBarChart(
                    yearData = barData,
                    barColor = Blue600
                )
            }
        }

        // Line Chart: Amortization Balance Reduction
        item {
            FintechCard {
                val balancePoints = calculationResult.schedule.take(36).map { it.closingBalance }
                GrowthLineChart(
                    dataPoints = balancePoints,
                    lineColor = Emerald500,
                    title = "Outstanding Balance Reduction Curve (First 36 Months)"
                )
            }
        }

        // Amortization Table
        item {
            FintechCard {
                AmortizationTable(schedule = calculationResult.schedule)
            }
        }

        // Save & Export Action Bar
        item {
            Button(
                onClick = { showSaveDialog = true },
                shape = RoundedCornerShape(16.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Blue600),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp)
            ) {
                Icon(imageVector = Icons.Default.Bookmark, contentDescription = null)
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "Save Education Loan Calculation",
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                )
            }
        }

        item {
            Spacer(modifier = Modifier.height(24.dp))
        }
    }

    // Save Dialog
    if (showSaveDialog) {
        AlertDialog(
            onDismissRequest = { showSaveDialog = false },
            title = { Text("Save Loan Calculation") },
            text = {
                Column {
                    Text(
                        text = "Enter a name to save this loan plan into your database:",
                        style = MaterialTheme.typography.bodyMedium
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                    OutlinedTextField(
                        value = loanSaveName,
                        onValueChange = { loanSaveName = it },
                        label = { Text("Loan Name") },
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
                            courseYears = courseDurationYears,
                            graceMonths = gracePeriodMonths,
                            payInterestDuringCourse = payInterestDuringCourse,
                            capitalizeInterest = capitalizeInterest,
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
