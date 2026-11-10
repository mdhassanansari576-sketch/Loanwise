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
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.CompareArrows
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.derivedStateOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableDoubleStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.example.domain.calculator.CurrencyFormatter
import com.example.domain.calculator.FinancialCalculator
import com.example.domain.model.CompoundingFrequency
import com.example.domain.model.InterestCalculationType
import com.example.domain.model.LoanType
import com.example.ui.MainViewModel
import com.example.ui.components.FintechCard
import com.example.ui.components.SliderInputField
import com.example.ui.theme.Blue600
import com.example.ui.theme.Cyan500
import com.example.ui.theme.Emerald500
import com.example.ui.theme.Indigo600
import com.example.ui.theme.Rose500
import kotlin.math.abs

@Composable
fun LoanComparisonScreen(
    viewModel: MainViewModel,
    modifier: Modifier = Modifier
) {
    // Scenario A Inputs (e.g. Bank A)
    var amountA by remember { mutableDoubleStateOf(3000000.0) }
    var rateA by remember { mutableDoubleStateOf(8.5) }
    var tenureA by remember { mutableDoubleStateOf(20.0) }

    // Scenario B Inputs (e.g. Bank B)
    var amountB by remember { mutableDoubleStateOf(3000000.0) }
    var rateB by remember { mutableDoubleStateOf(8.1) }
    var tenureB by remember { mutableDoubleStateOf(20.0) }

    val resultA by remember(amountA, rateA, tenureA) {
        derivedStateOf {
            FinancialCalculator.calculateOtherLoan(
                loanType = LoanType.CUSTOM,
                loanAmount = amountA,
                annualRate = rateA,
                interestType = InterestCalculationType.COMPOUND,
                compoundingFrequency = CompoundingFrequency.MONTHLY,
                tenureYears = tenureA
            )
        }
    }

    val resultB by remember(amountB, rateB, tenureB) {
        derivedStateOf {
            FinancialCalculator.calculateOtherLoan(
                loanType = LoanType.CUSTOM,
                loanAmount = amountB,
                annualRate = rateB,
                interestType = InterestCalculationType.COMPOUND,
                compoundingFrequency = CompoundingFrequency.MONTHLY,
                tenureYears = tenureB
            )
        }
    }

    val emiDiff = abs(resultA.emiAmount - resultB.emiAmount)
    val interestDiff = abs(resultA.totalInterestPayable - resultB.totalInterestPayable)
    val betterScenario = if (resultA.totalCostOfBorrowing < resultB.totalCostOfBorrowing) "Loan Option A" else "Loan Option B"
    val totalSavings = abs(resultA.totalCostOfBorrowing - resultB.totalCostOfBorrowing)

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
                        imageVector = Icons.Default.CompareArrows,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.size(24.dp)
                    )
                }
                Spacer(modifier = Modifier.width(10.dp))
                Column {
                    Text(
                        text = "Loan Comparison Matrix",
                        style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Text(
                        text = "Side-by-side cost & EMI differential analysis",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        }

        // Winner Highlights Card
        item {
            Surface(
                shape = RoundedCornerShape(20.dp),
                color = Emerald500.copy(alpha = 0.15f)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(18.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(44.dp)
                            .clip(CircleShape)
                            .background(Emerald500),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.CheckCircle,
                            contentDescription = null,
                            tint = Color.White,
                            modifier = Modifier.size(26.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(14.dp))
                    Column {
                        Text(
                            text = "$betterScenario Saves More Money! 🎉",
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Spacer(modifier = Modifier.height(2.dp))
                        Text(
                            text = "Save ${CurrencyFormatter.formatInr(totalSavings)} in total interest and ${CurrencyFormatter.formatInr(emiDiff)}/month on EMI.",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }
        }

        // Side-by-Side Comparison Table Card
        item {
            FintechCard {
                Text(
                    text = "Side-by-Side Metrics",
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                    color = MaterialTheme.colorScheme.onSurface
                )
                Spacer(modifier = Modifier.height(12.dp))

                // Table Header
                Surface(
                    shape = RoundedCornerShape(10.dp),
                    color = MaterialTheme.colorScheme.surfaceVariant
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 10.dp, vertical = 8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("Parameter", style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold), modifier = Modifier.weight(1.2f))
                        Text("Option A", style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold, color = Blue600), modifier = Modifier.weight(1f), textAlign = TextAlign.End)
                        Text("Option B", style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold, color = Indigo600), modifier = Modifier.weight(1f), textAlign = TextAlign.End)
                    }
                }

                ComparisonRow("Loan Amount", CurrencyFormatter.formatInrCompact(amountA), CurrencyFormatter.formatInrCompact(amountB))
                ComparisonRow("Interest Rate", "${rateA}%", "${rateB}%")
                ComparisonRow("Tenure", "${tenureA.toInt()} Yrs", "${tenureB.toInt()} Yrs")
                ComparisonRow("Monthly EMI", CurrencyFormatter.formatInr(resultA.emiAmount), CurrencyFormatter.formatInr(resultB.emiAmount), isHighlight = true)
                ComparisonRow("Total Interest", CurrencyFormatter.formatInrCompact(resultA.totalInterestPayable), CurrencyFormatter.formatInrCompact(resultB.totalInterestPayable))
                ComparisonRow("Total Repayment", CurrencyFormatter.formatInrCompact(resultA.totalCostOfBorrowing), CurrencyFormatter.formatInrCompact(resultB.totalCostOfBorrowing), isHighlight = true)
            }
        }

        // Config Option A
        item {
            FintechCard {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(modifier = Modifier.size(10.dp).clip(CircleShape).background(Blue600))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "Option A Parameters (e.g. Bank 1)",
                        style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                        color = Blue600
                    )
                }
                Spacer(modifier = Modifier.height(8.dp))

                SliderInputField(
                    label = "Principal",
                    value = amountA,
                    onValueChange = { amountA = it },
                    range = 100000.0..10000000.0,
                    step = 50000f,
                    displayFormatter = { CurrencyFormatter.formatInr(it) }
                )
                SliderInputField(
                    label = "Interest Rate",
                    value = rateA,
                    onValueChange = { rateA = it },
                    range = 5.0..20.0,
                    step = 0.1f,
                    displayFormatter = { String.format("%.2f%%", it) }
                )
                SliderInputField(
                    label = "Tenure",
                    value = tenureA,
                    onValueChange = { tenureA = it },
                    range = 1.0..30.0,
                    step = 1f,
                    displayFormatter = { "${it.toInt()} Years" }
                )
            }
        }

        // Config Option B
        item {
            FintechCard {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(modifier = Modifier.size(10.dp).clip(CircleShape).background(Indigo600))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "Option B Parameters (e.g. Bank 2)",
                        style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                        color = Indigo600
                    )
                }
                Spacer(modifier = Modifier.height(8.dp))

                SliderInputField(
                    label = "Principal",
                    value = amountB,
                    onValueChange = { amountB = it },
                    range = 100000.0..10000000.0,
                    step = 50000f,
                    displayFormatter = { CurrencyFormatter.formatInr(it) }
                )
                SliderInputField(
                    label = "Interest Rate",
                    value = rateB,
                    onValueChange = { rateB = it },
                    range = 5.0..20.0,
                    step = 0.1f,
                    displayFormatter = { String.format("%.2f%%", it) }
                )
                SliderInputField(
                    label = "Tenure",
                    value = tenureB,
                    onValueChange = { tenureB = it },
                    range = 1.0..30.0,
                    step = 1f,
                    displayFormatter = { "${it.toInt()} Years" }
                )
            }
        }

        item {
            Spacer(modifier = Modifier.height(24.dp))
        }
    }
}

@Composable
private fun ComparisonRow(
    label: String,
    valA: String,
    valB: String,
    isHighlight: Boolean = false
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 10.dp, vertical = 9.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = label,
            style = MaterialTheme.typography.bodySmall.copy(
                fontWeight = if (isHighlight) FontWeight.Bold else FontWeight.Normal
            ),
            modifier = Modifier.weight(1.2f)
        )
        Text(
            text = valA,
            style = MaterialTheme.typography.bodySmall.copy(
                fontWeight = if (isHighlight) FontWeight.Bold else FontWeight.SemiBold
            ),
            modifier = Modifier.weight(1f),
            textAlign = TextAlign.End
        )
        Text(
            text = valB,
            style = MaterialTheme.typography.bodySmall.copy(
                fontWeight = if (isHighlight) FontWeight.Bold else FontWeight.SemiBold
            ),
            modifier = Modifier.weight(1f),
            textAlign = TextAlign.End
        )
    }
    HorizontalDivider(color = MaterialTheme.colorScheme.outline.copy(alpha = 0.15f))
}
