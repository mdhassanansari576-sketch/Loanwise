package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
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
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.Calculate
import androidx.compose.material.icons.filled.Info
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
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
import androidx.compose.ui.graphics.Color
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
import com.example.ui.components.MetricTile
import com.example.ui.components.PrimaryHeroMetricCard
import com.example.ui.components.SliderInputField
import com.example.ui.theme.Blue600
import com.example.ui.theme.Cyan500
import com.example.ui.theme.Emerald500
import com.example.ui.theme.Indigo600
import com.example.ui.theme.Rose500

@Composable
fun EmiCalculatorScreen(
    viewModel: MainViewModel,
    modifier: Modifier = Modifier
) {
    var principalAmount by remember { mutableDoubleStateOf(1000000.0) }
    var annualInterestRate by remember { mutableDoubleStateOf(8.75) }
    var tenureYears by remember { mutableDoubleStateOf(10.0) }

    var showSaveDialog by remember { mutableStateOf(false) }
    var saveName by remember { mutableStateOf("EMI Calculation") }

    val calculationResult by remember(principalAmount, annualInterestRate, tenureYears) {
        derivedStateOf {
            FinancialCalculator.calculateOtherLoan(
                loanType = LoanType.CUSTOM,
                loanAmount = principalAmount,
                annualRate = annualInterestRate,
                interestType = InterestCalculationType.COMPOUND,
                compoundingFrequency = CompoundingFrequency.MONTHLY,
                tenureYears = tenureYears
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
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(38.dp)
                        .clip(CircleShape)
                        .background(MaterialTheme.colorScheme.primaryContainer),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Calculate,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.size(22.dp)
                    )
                }
                Spacer(modifier = Modifier.width(10.dp))
                Column {
                    Text(
                        text = "EMI Calculator",
                        style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Text(
                        text = "Standard Reducing-Balance Monthly Installment Engine",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        }

        // Sliders
        item {
            FintechCard {
                SliderInputField(
                    label = "Loan Principal Amount",
                    value = principalAmount,
                    onValueChange = { principalAmount = it },
                    range = 10000.0..20000000.0,
                    step = 25000f,
                    displayFormatter = { CurrencyFormatter.formatInr(it) },
                    quickPresets = listOf(
                        "₹2L" to 200000.0,
                        "₹5L" to 500000.0,
                        "₹10L" to 1000000.0,
                        "₹25L" to 2500000.0,
                        "₹50L" to 5000000.0
                    )
                )

                Spacer(modifier = Modifier.height(8.dp))

                SliderInputField(
                    label = "Annual Interest Rate",
                    value = annualInterestRate,
                    onValueChange = { annualInterestRate = it },
                    range = 1.0..25.0,
                    step = 0.25f,
                    displayFormatter = { String.format("%.2f%% p.a.", it) },
                    quickPresets = listOf("7.5%" to 7.5, "8.5%" to 8.5, "9.5%" to 9.5, "12.0%" to 12.0)
                )

                Spacer(modifier = Modifier.height(8.dp))

                SliderInputField(
                    label = "Repayment Duration (Tenure)",
                    value = tenureYears,
                    onValueChange = { tenureYears = it },
                    range = 1.0..30.0,
                    step = 1f,
                    displayFormatter = { "${it.toInt()} Years (${(it * 12).toInt()} months)" },
                    quickPresets = listOf("2 Yrs" to 2.0, "5 Yrs" to 5.0, "10 Yrs" to 10.0, "15 Yrs" to 15.0, "20 Yrs" to 20.0)
                )
            }
        }

        // Hero Metric Card
        item {
            PrimaryHeroMetricCard(
                title = "Calculated Monthly EMI",
                primaryValue = "${CurrencyFormatter.formatInr(calculationResult.emiAmount)} / mo",
                subtitle = "Total Repayable: ${CurrencyFormatter.formatInr(calculationResult.totalRepaymentAmount)} across ${(tenureYears * 12).toInt()} installments",
                badgeText = "Reducing Balance",
                gradientColors = listOf(Blue600, Cyan500)
            )
        }

        // Formula Explanation Box
        item {
            Surface(
                shape = RoundedCornerShape(16.dp),
                color = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.45f)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.Info,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Standard Reducing-Balance EMI Formula",
                            style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                            color = MaterialTheme.colorScheme.onPrimaryContainer
                        )
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "EMI = P × r × (1+r)ⁿ / ((1+r)ⁿ − 1)",
                        style = MaterialTheme.typography.bodyLarge.copy(
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.primary
                        )
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "• P = ₹${principalAmount.toLong()} (Outstanding principal balance)\n• r = ${annualInterestRate}% / 12 / 100 = ${(annualInterestRate / 12 / 100).toFloat()} (Monthly interest rate)\n• n = ${(tenureYears * 12).toInt()} installments\n• Every month, interest is calculated only on the remaining balance.",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                }
            }
        }

        // Metrics Grid
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                MetricTile(
                    label = "Principal Amount",
                    value = CurrencyFormatter.formatInr(calculationResult.totalDisbursedAmount),
                    subValue = "Disbursed amount",
                    accentColor = Blue600,
                    modifier = Modifier.weight(1f)
                )
                MetricTile(
                    label = "Total Interest",
                    value = CurrencyFormatter.formatInr(calculationResult.totalInterestPayable),
                    subValue = "${String.format("%.1f", calculationResult.totalInterestPayable / calculationResult.totalRepaymentAmount * 100)}% of total cost",
                    accentColor = Rose500,
                    modifier = Modifier.weight(1f)
                )
            }
        }

        // Donut Chart
        item {
            FintechCard {
                Text(
                    text = "Principal vs Interest Breakdown",
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
                        label = "Interest",
                        value = calculationResult.totalInterestPayable,
                        color = Rose500
                    )
                )

                FinancialDonutChart(
                    slices = slices,
                    centerTitle = "Total Repayable",
                    centerValue = CurrencyFormatter.formatInrCompact(calculationResult.totalRepaymentAmount)
                )
            }
        }

        // Amortization Table
        item {
            FintechCard {
                AmortizationTable(schedule = calculationResult.schedule)
            }
        }

        // Save Button
        item {
            Button(
                onClick = {
                    saveName = "EMI - ${CurrencyFormatter.formatInrCompact(principalAmount)} @ ${annualInterestRate}%"
                    showSaveDialog = true
                },
                shape = RoundedCornerShape(16.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Blue600),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp)
            ) {
                Icon(imageVector = Icons.Default.Bookmark, contentDescription = null)
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "Save EMI Calculation",
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
            title = { Text("Save EMI Calculation") },
            text = {
                Column {
                    Text("Enter a name for this calculation:")
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedTextField(
                        value = saveName,
                        onValueChange = { saveName = it },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        viewModel.saveLoanCalculation(
                            loanName = saveName,
                            result = calculationResult
                        )
                        showSaveDialog = false
                    }
                ) {
                    Text("Save")
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
