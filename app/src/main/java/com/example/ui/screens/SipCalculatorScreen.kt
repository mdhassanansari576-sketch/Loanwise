package com.example.ui.screens

import android.content.Context
import android.content.Intent
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
import androidx.compose.material.icons.automirrored.filled.TrendingUp
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.Flag
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Share
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
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRow
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.derivedStateOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableDoubleStateOf
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.example.domain.calculator.CurrencyFormatter
import com.example.domain.calculator.FinancialCalculator
import com.example.domain.model.SipFrequency
import com.example.ui.MainViewModel
import com.example.ui.components.ChartSlice
import com.example.ui.components.FinancialDonutChart
import com.example.ui.components.FintechCard
import com.example.ui.components.GrowthLineChart
import com.example.ui.components.MetricTile
import com.example.ui.components.PrimaryHeroMetricCard
import com.example.ui.components.SliderInputField
import com.example.ui.components.YearWiseBarChart
import com.example.ui.theme.Blue600
import com.example.ui.theme.Cyan500
import com.example.ui.theme.Emerald500
import com.example.ui.theme.Indigo600
import com.example.ui.theme.Navy900
import com.example.ui.theme.Rose500

enum class SipModeTab(val title: String) {
    SIP_CALCULATOR("SIP & Step-Up"),
    GOAL_PLANNER("Goal Planner (Reverse SIP)"),
    COMPARISON("Step-Up vs Regular")
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun SipCalculatorScreen(
    viewModel: MainViewModel,
    modifier: Modifier = Modifier
) {
    var selectedTab by remember { mutableStateOf(SipModeTab.SIP_CALCULATOR) }

    // Core SIP Inputs
    var monthlyInvestment by remember { mutableDoubleStateOf(10000.0) }
    var expectedAnnualReturn by remember { mutableDoubleStateOf(12.0) }
    var investmentDurationYears by remember { mutableIntStateOf(15) }
    var sipFrequency by remember { mutableStateOf(SipFrequency.MONTHLY) }

    // Step-up & Lump sum
    var isStepUpEnabled by remember { mutableStateOf(true) }
    var stepUpPercentage by remember { mutableDoubleStateOf(10.0) }
    var initialLumpSum by remember { mutableDoubleStateOf(25000.0) }

    // Inflation adjustment
    var isInflationAdjusted by remember { mutableStateOf(false) }
    var inflationRate by remember { mutableDoubleStateOf(6.0) }

    // Goal Planner (Reverse SIP) Inputs
    var targetGoalAmount by remember { mutableDoubleStateOf(10000000.0) } // 1 Crore target
    var goalTargetYears by remember { mutableIntStateOf(15) }

    var showSaveDialog by remember { mutableStateOf(false) }
    var sipSaveName by remember { mutableStateOf("") }
    val context = LocalContext.current

    // Calculation result
    val sipResult by remember(
        monthlyInvestment,
        expectedAnnualReturn,
        investmentDurationYears,
        sipFrequency,
        isStepUpEnabled,
        stepUpPercentage,
        initialLumpSum,
        isInflationAdjusted,
        inflationRate
    ) {
        derivedStateOf {
            FinancialCalculator.calculateSip(
                monthlyInvestment = monthlyInvestment,
                expectedAnnualReturn = expectedAnnualReturn,
                investmentDurationYears = investmentDurationYears,
                frequency = sipFrequency,
                stepUpPercentage = if (isStepUpEnabled) stepUpPercentage else 0.0,
                initialLumpSum = initialLumpSum,
                inflationRate = if (isInflationAdjusted) inflationRate else 0.0
            )
        }
    }

    // Reverse SIP results
    val requiredMonthlySipForGoal by remember(targetGoalAmount, expectedAnnualReturn, goalTargetYears, sipFrequency) {
        derivedStateOf {
            FinancialCalculator.calculateRequiredMonthlySipForGoal(
                targetAmount = targetGoalAmount,
                expectedAnnualReturn = expectedAnnualReturn,
                durationYears = goalTargetYears,
                frequency = sipFrequency
            )
        }
    }

    val requiredDurationForGoalWithCurrentSip by remember(targetGoalAmount, monthlyInvestment, expectedAnnualReturn) {
        derivedStateOf {
            FinancialCalculator.calculateRequiredDurationForGoal(
                targetAmount = targetGoalAmount,
                monthlyInvestment = monthlyInvestment,
                expectedAnnualReturn = expectedAnnualReturn
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
                            .background(Emerald500.copy(alpha = 0.2f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.TrendingUp,
                            contentDescription = null,
                            tint = Emerald500,
                            modifier = Modifier.size(24.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(10.dp))
                    Column {
                        Text(
                            text = "SIP Investment Calculator",
                            style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Text(
                            text = "Wealth Creation, Step-Up & Goal Engineering",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }

                IconButton(
                    onClick = {
                        shareSipSummary(context, sipResult)
                    }
                ) {
                    Icon(
                        imageVector = Icons.Default.Share,
                        contentDescription = "Share SIP Projection",
                        tint = MaterialTheme.colorScheme.primary
                    )
                }
            }
        }

        // Mode Switcher Tabs
        item {
            TabRow(
                selectedTabIndex = selectedTab.ordinal,
                containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
                contentColor = MaterialTheme.colorScheme.primary,
                modifier = Modifier.clip(RoundedCornerShape(12.dp))
            ) {
                SipModeTab.values().forEach { tab ->
                    Tab(
                        selected = selectedTab == tab,
                        onClick = { selectedTab = tab },
                        text = {
                            Text(
                                text = tab.title,
                                style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold)
                            )
                        }
                    )
                }
            }
        }

        if (selectedTab == SipModeTab.GOAL_PLANNER) {
            // GOAL PLANNER (REVERSE SIP)
            item {
                FintechCard {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.Flag,
                            contentDescription = null,
                            tint = Emerald500,
                            modifier = Modifier.size(22.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Reverse SIP & Financial Goal Engine",
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    }
                    Spacer(modifier = Modifier.height(12.dp))

                    SliderInputField(
                        label = "Target Wealth Goal",
                        value = targetGoalAmount,
                        onValueChange = { targetGoalAmount = it },
                        range = 100000.0..50000000.0,
                        step = 100000f,
                        displayFormatter = { CurrencyFormatter.formatInr(it) },
                        quickPresets = listOf(
                            "₹25 Lakh" to 2500000.0,
                            "₹50 Lakh" to 5000000.0,
                            "₹1 Crore" to 10000000.0,
                            "₹2.5 Crore" to 25000000.0
                        )
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    SliderInputField(
                        label = "Target Horizon (Years)",
                        value = goalTargetYears.toDouble(),
                        onValueChange = { goalTargetYears = it.toInt() },
                        range = 1.0..35.0,
                        step = 1f,
                        displayFormatter = { "${it.toInt()} Years" },
                        quickPresets = listOf("5 Yrs" to 5.0, "10 Yrs" to 10.0, "15 Yrs" to 15.0, "20 Yrs" to 20.0)
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    SliderInputField(
                        label = "Expected Annual Return (%)",
                        value = expectedAnnualReturn,
                        onValueChange = { expectedAnnualReturn = it },
                        range = 4.0..25.0,
                        step = 0.5f,
                        displayFormatter = { String.format("%.1f%% p.a.", it) },
                        quickPresets = listOf("10%" to 10.0, "12%" to 12.0, "14%" to 14.0, "16%" to 16.0)
                    )
                }
            }

            item {
                PrimaryHeroMetricCard(
                    title = "Required Monthly SIP",
                    primaryValue = "${CurrencyFormatter.formatInr(requiredMonthlySipForGoal)} / mo",
                    subtitle = "Invest this monthly at ${expectedAnnualReturn}% to reach ${CurrencyFormatter.formatInrCompact(targetGoalAmount)} in $goalTargetYears years.",
                    badgeText = "Goal Target",
                    gradientColors = listOf(Emerald500, Cyan500)
                )
            }

            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(
                            text = "Alternative Horizon with Current SIP (₹${monthlyInvestment.toLong()}/mo):",
                            style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "If you invest ${CurrencyFormatter.formatInr(monthlyInvestment)}/month, you will reach ${CurrencyFormatter.formatInrCompact(targetGoalAmount)} in approximately ${String.format("%.1f", requiredDurationForGoalWithCurrentSip)} years.",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }
        } else {
            // REGULAR & STEP-UP SIP INPUTS
            item {
                FintechCard {
                    Text(
                        text = "Investment Parameters",
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                        color = MaterialTheme.colorScheme.primary
                    )
                    Spacer(modifier = Modifier.height(10.dp))

                    // Monthly SIP Slider
                    SliderInputField(
                        label = "Monthly SIP Amount",
                        value = monthlyInvestment,
                        onValueChange = { monthlyInvestment = it },
                        range = 500.0..200000.0,
                        step = 500f,
                        displayFormatter = { CurrencyFormatter.formatInr(it) },
                        quickPresets = listOf(
                            "₹2.5K" to 2500.0,
                            "₹5K" to 5000.0,
                            "₹10K" to 10000.0,
                            "₹25K" to 25000.0,
                            "₹50K" to 50000.0
                        )
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    // Expected Return Rate Slider
                    SliderInputField(
                        label = "Expected Annual Return Rate",
                        value = expectedAnnualReturn,
                        onValueChange = { expectedAnnualReturn = it },
                        range = 1.0..30.0,
                        step = 0.5f,
                        displayFormatter = { String.format("%.1f%% p.a.", it) },
                        quickPresets = listOf("8%" to 8.0, "12%" to 12.0, "14%" to 14.0, "16%" to 16.0)
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    // Duration Slider
                    SliderInputField(
                        label = "Investment Duration",
                        value = investmentDurationYears.toDouble(),
                        onValueChange = { investmentDurationYears = it.toInt() },
                        range = 1.0..40.0,
                        step = 1f,
                        displayFormatter = { "${it.toInt()} Years (${it.toInt() * 12} contributions)" },
                        quickPresets = listOf("5 Yrs" to 5.0, "10 Yrs" to 10.0, "15 Yrs" to 15.0, "20 Yrs" to 20.0, "25 Yrs" to 25.0)
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    // SIP Frequency
                    Text(
                        text = "Investment Frequency",
                        style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.SemiBold),
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        SipFrequency.values().forEach { freq ->
                            FilterChip(
                                selected = sipFrequency == freq,
                                onClick = { sipFrequency = freq },
                                label = { Text(freq.displayName) },
                                colors = FilterChipDefaults.filterChipColors(
                                    selectedContainerColor = MaterialTheme.colorScheme.primaryContainer,
                                    selectedLabelColor = MaterialTheme.colorScheme.onPrimaryContainer
                                )
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))
                    HorizontalDivider(color = MaterialTheme.colorScheme.outline.copy(alpha = 0.3f))
                    Spacer(modifier = Modifier.height(12.dp))

                    // Step-up Switch & Slider
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "Annual Step-up SIP",
                                style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.SemiBold),
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            Text(
                                text = "Increase investment yearly as your income grows.",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                        Switch(
                            checked = isStepUpEnabled,
                            onCheckedChange = { isStepUpEnabled = it }
                        )
                    }

                    if (isStepUpEnabled) {
                        Spacer(modifier = Modifier.height(8.dp))
                        SliderInputField(
                            label = "Annual Increase Percentage",
                            value = stepUpPercentage,
                            onValueChange = { stepUpPercentage = it },
                            range = 1.0..50.0,
                            step = 1f,
                            displayFormatter = { "${it.toInt()}% Yearly" },
                            quickPresets = listOf("5%" to 5.0, "10%" to 10.0, "15%" to 15.0, "20%" to 20.0)
                        )
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    // Initial Lump Sum
                    SliderInputField(
                        label = "Initial Lump-Sum Investment",
                        value = initialLumpSum,
                        onValueChange = { initialLumpSum = it },
                        range = 0.0..1000000.0,
                        step = 10000f,
                        displayFormatter = { if (it <= 0) "None (₹0)" else CurrencyFormatter.formatInr(it) },
                        quickPresets = listOf("None" to 0.0, "₹25K" to 25000.0, "₹50K" to 50000.0, "₹1L" to 100000.0)
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    // Inflation Adjustment Toggle
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "Adjust for Inflation",
                                style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.SemiBold),
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            Text(
                                text = "View real purchasing power (default: 6% p.a.).",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                        Switch(
                            checked = isInflationAdjusted,
                            onCheckedChange = { isInflationAdjusted = it }
                        )
                    }

                    if (isInflationAdjusted) {
                        Spacer(modifier = Modifier.height(8.dp))
                        SliderInputField(
                            label = "Assumed Inflation Rate (%)",
                            value = inflationRate,
                            onValueChange = { inflationRate = it },
                            range = 2.0..12.0,
                            step = 0.5f,
                            displayFormatter = { String.format("%.1f%% p.a.", it) },
                            quickPresets = listOf("4%" to 4.0, "6%" to 6.0, "7%" to 7.0, "8%" to 8.0)
                        )
                    }
                }
            }

            // Results Hero Card: Future Value
            item {
                PrimaryHeroMetricCard(
                    title = "Estimated Future Value",
                    primaryValue = CurrencyFormatter.formatInr(sipResult.estimatedFutureValue),
                    subtitle = if (isInflationAdjusted) {
                        "Inflation-Adjusted Purchasing Power: ${CurrencyFormatter.formatInrCompact(sipResult.inflationAdjustedFutureValue)}"
                    } else {
                        "Estimated Profit / Wealth: ${CurrencyFormatter.formatInrCompact(sipResult.estimatedReturns)}"
                    },
                    badgeText = if (isStepUpEnabled) "Step-Up ${stepUpPercentage.toInt()}%" else "Regular SIP",
                    gradientColors = listOf(Emerald500, Cyan500)
                )
            }

            // Summary Metrics Grid
            item {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        MetricTile(
                            label = "Total Invested",
                            value = CurrencyFormatter.formatInr(sipResult.totalInvestedAmount),
                            subValue = "Your capital contribution",
                            accentColor = Blue600,
                            modifier = Modifier.weight(1f)
                        )
                        MetricTile(
                            label = "Estimated Wealth Gain",
                            value = CurrencyFormatter.formatInr(sipResult.estimatedReturns),
                            subValue = "${String.format("%.1f", (sipResult.estimatedReturns / sipResult.totalInvestedAmount) * 100)}% wealth multiplier",
                            accentColor = Emerald500,
                            modifier = Modifier.weight(1f)
                        )
                    }

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        MetricTile(
                            label = "Expected Return",
                            value = "${expectedAnnualReturn}% p.a.",
                            subValue = "Market-linked estimate",
                            accentColor = Cyan500,
                            modifier = Modifier.weight(1f)
                        )
                        MetricTile(
                            label = "Investment Duration",
                            value = "$investmentDurationYears Years",
                            subValue = "${investmentDurationYears * sipFrequency.installmentsPerYear} installments",
                            accentColor = Indigo600,
                            modifier = Modifier.weight(1f)
                        )
                    }
                }
            }

            // Step-up Comparison Card (if Step-up is enabled or tab is comparison)
            if (isStepUpEnabled || selectedTab == SipModeTab.COMPARISON) {
                item {
                    val stepUpGain = sipResult.estimatedFutureValue - sipResult.regularComparisonFutureValue
                    FintechCard {
                        Text(
                            text = "⚡ Step-Up SIP Advantage",
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                            color = MaterialTheme.colorScheme.primary
                        )
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = "By increasing your investment by ${stepUpPercentage.toInt()}% annually, you accumulate ${CurrencyFormatter.formatInr(stepUpGain)} more than a fixed regular SIP!",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Spacer(modifier = Modifier.height(10.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            Card(
                                modifier = Modifier.weight(1f),
                                shape = RoundedCornerShape(12.dp),
                                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
                            ) {
                                Column(modifier = Modifier.padding(10.dp)) {
                                    Text("Regular SIP", style = MaterialTheme.typography.labelSmall)
                                    Text(
                                        CurrencyFormatter.formatInrCompact(sipResult.regularComparisonFutureValue),
                                        style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold)
                                    )
                                }
                            }
                            Card(
                                modifier = Modifier.weight(1f),
                                shape = RoundedCornerShape(12.dp),
                                colors = CardDefaults.cardColors(containerColor = Emerald500.copy(alpha = 0.2f))
                            ) {
                                Column(modifier = Modifier.padding(10.dp)) {
                                    Text("Step-Up SIP", style = MaterialTheme.typography.labelSmall, color = Emerald500)
                                    Text(
                                        CurrencyFormatter.formatInrCompact(sipResult.estimatedFutureValue),
                                        style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold, color = Emerald500)
                                    )
                                }
                            }
                        }
                    }
                }
            }

            // Donut Chart: Invested vs Profit
            item {
                FintechCard {
                    Text(
                        text = "Capital Invested vs Wealth Generated",
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Spacer(modifier = Modifier.height(12.dp))

                    val slices = listOf(
                        ChartSlice(
                            label = "Invested Capital",
                            value = sipResult.totalInvestedAmount,
                            color = Blue600
                        ),
                        ChartSlice(
                            label = "Estimated Profit",
                            value = sipResult.estimatedReturns,
                            color = Emerald500
                        )
                    )

                    FinancialDonutChart(
                        slices = slices,
                        centerTitle = "Total Portfolio Value",
                        centerValue = CurrencyFormatter.formatInrCompact(sipResult.estimatedFutureValue)
                    )
                }
            }

            // Line Chart: Portfolio Growth Over Time
            item {
                FintechCard {
                    val growthPoints = sipResult.yearlyBreakdown.map { it.estimatedPortfolioValue }
                    GrowthLineChart(
                        dataPoints = growthPoints,
                        lineColor = Emerald500,
                        title = "Wealth Growth Trajectory (Year 1 to Year $investmentDurationYears)"
                    )
                }
            }

            // Year-wise Bar Chart: Invested vs Portfolio Value
            item {
                FintechCard {
                    Text(
                        text = "Year-Wise Invested vs Portfolio Value",
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Spacer(modifier = Modifier.height(8.dp))

                    val primaryBarData = sipResult.yearlyBreakdown.map {
                        "Y${it.yearNumber}" to it.cumulativeInvested
                    }
                    val secondaryBarData = sipResult.yearlyBreakdown.map {
                        "Y${it.yearNumber}" to it.estimatedPortfolioValue
                    }

                    YearWiseBarChart(
                        yearData = primaryBarData,
                        barColor = Blue600,
                        secondaryData = secondaryBarData,
                        secondaryColor = Emerald500
                    )

                    Spacer(modifier = Modifier.height(6.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.Center
                    ) {
                        Box(modifier = Modifier.size(10.dp).clip(CircleShape).background(Blue600))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Invested Capital", style = MaterialTheme.typography.labelSmall)
                        Spacer(modifier = Modifier.width(16.dp))
                        Box(modifier = Modifier.size(10.dp).clip(CircleShape).background(Emerald500))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Portfolio Value", style = MaterialTheme.typography.labelSmall)
                    }
                }
            }

            // Detailed Year-Wise Table
            item {
                FintechCard {
                    Text(
                        text = "Year-Wise SIP Breakdown Table",
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Spacer(modifier = Modifier.height(10.dp))

                    Surface(
                        shape = RoundedCornerShape(topStart = 10.dp, topEnd = 10.dp),
                        color = MaterialTheme.colorScheme.surfaceVariant
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 8.dp, vertical = 8.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text("Year", style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold), modifier = Modifier.width(42.dp))
                            Text("Invested", style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold), modifier = Modifier.weight(1f), textAlign = TextAlign.End)
                            Text("Returns", style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold), modifier = Modifier.weight(1f), textAlign = TextAlign.End)
                            Text("Portfolio", style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold), modifier = Modifier.weight(1.2f), textAlign = TextAlign.End)
                        }
                    }

                    sipResult.yearlyBreakdown.forEachIndexed { idx, item ->
                        val bg = if (idx % 2 == 0) MaterialTheme.colorScheme.surface else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.35f)
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(bg)
                                .padding(horizontal = 8.dp, vertical = 8.dp)
                        ) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text("Yr ${item.yearNumber}", style = MaterialTheme.typography.bodySmall, modifier = Modifier.width(42.dp))
                                Text(CurrencyFormatter.formatInr(item.cumulativeInvested), style = MaterialTheme.typography.bodySmall, modifier = Modifier.weight(1f), textAlign = TextAlign.End)
                                Text(CurrencyFormatter.formatInr(item.estimatedProfit), style = MaterialTheme.typography.bodySmall.copy(color = Emerald500), modifier = Modifier.weight(1f), textAlign = TextAlign.End)
                                Text(CurrencyFormatter.formatInr(item.estimatedPortfolioValue), style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.Bold), modifier = Modifier.weight(1.2f), textAlign = TextAlign.End)
                            }
                        }
                        HorizontalDivider(color = MaterialTheme.colorScheme.outline.copy(alpha = 0.15f))
                    }
                }
            }

            // Disclaimer Box
            item {
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)
                ) {
                    Row(
                        modifier = Modifier.padding(14.dp),
                        verticalAlignment = Alignment.Top
                    ) {
                        Icon(
                            imageVector = Icons.Default.Info,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Disclaimer: Mutual fund investments are subject to market risks. SIP calculations are based on assumed expected rates of return and are for educational/projection purposes only. Actual returns may vary.",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }

            // Save SIP Button
            item {
                Button(
                    onClick = {
                        sipSaveName = "SIP - ${CurrencyFormatter.formatInr(monthlyInvestment)}/mo (${investmentDurationYears}Y)"
                        showSaveDialog = true
                    },
                    shape = RoundedCornerShape(16.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Emerald500),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(52.dp)
                ) {
                    Icon(imageVector = Icons.Default.Bookmark, contentDescription = null)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Save SIP Scenario",
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                    )
                }
            }
        }

        item {
            Spacer(modifier = Modifier.height(24.dp))
        }
    }

    if (showSaveDialog) {
        AlertDialog(
            onDismissRequest = { showSaveDialog = false },
            title = { Text("Save SIP Scenario") },
            text = {
                Column {
                    Text("Enter a name for this SIP plan:")
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedTextField(
                        value = sipSaveName,
                        onValueChange = { sipSaveName = it },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        viewModel.saveSipCalculation(sipSaveName, sipResult)
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

private fun shareSipSummary(context: Context, sip: com.example.domain.model.SipCalculationResult) {
    val text = buildString {
        append("📊 LoanWise - SIP Wealth Projection Report\n\n")
        append("Monthly SIP: ${CurrencyFormatter.formatInr(sip.monthlyInvestment)}\n")
        append("Expected Return: ${sip.expectedAnnualReturn}% p.a.\n")
        append("Duration: ${sip.investmentDurationYears} Years\n")
        append("Step-up Percentage: ${sip.stepUpPercentage}%\n\n")
        append("Total Invested: ${CurrencyFormatter.formatInr(sip.totalInvestedAmount)}\n")
        append("Estimated Profit: ${CurrencyFormatter.formatInr(sip.estimatedReturns)}\n")
        append("Total Future Value: ${CurrencyFormatter.formatInr(sip.estimatedFutureValue)}\n")
        if (sip.inflationAdjustedFutureValue > 0) {
            append("Inflation Adjusted Value: ${CurrencyFormatter.formatInr(sip.inflationAdjustedFutureValue)}\n")
        }
    }
    val intent = Intent(Intent.ACTION_SEND).apply {
        type = "text/plain"
        putExtra(Intent.EXTRA_SUBJECT, "LoanWise SIP Investment Report")
        putExtra(Intent.EXTRA_TEXT, text)
    }
    context.startActivity(Intent.createChooser(intent, "Share SIP Report"))
}
