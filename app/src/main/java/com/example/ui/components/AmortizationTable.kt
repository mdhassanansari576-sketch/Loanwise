package com.example.ui.components

import android.content.Context
import android.content.Intent
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ExpandLess
import androidx.compose.material.icons.filled.ExpandMore
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.domain.calculator.CurrencyFormatter
import com.example.domain.model.EmiScheduleItem

@Composable
fun AmortizationTable(
    schedule: List<EmiScheduleItem>,
    modifier: Modifier = Modifier
) {
    var displayCount by remember { mutableStateOf(12) }
    var showFormulaExplanation by remember { mutableStateOf(false) }
    val context = LocalContext.current

    val displayedItems = schedule.take(displayCount)

    Column(modifier = modifier.fillMaxWidth()) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "Amortization Schedule",
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                    color = MaterialTheme.colorScheme.onSurface
                )
                Text(
                    text = "Showing ${displayedItems.size} of ${schedule.size} payments",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            Row {
                IconButton(onClick = { showFormulaExplanation = !showFormulaExplanation }) {
                    Icon(
                        imageVector = Icons.Default.Info,
                        contentDescription = "EMI Formula Info",
                        tint = MaterialTheme.colorScheme.primary
                    )
                }
                IconButton(onClick = { shareAmortizationCsv(context, schedule) }) {
                    Icon(
                        imageVector = Icons.Default.Share,
                        contentDescription = "Share Amortization Schedule",
                        tint = MaterialTheme.colorScheme.primary
                    )
                }
            }
        }

        AnimatedVisibility(visible = showFormulaExplanation) {
            Surface(
                shape = RoundedCornerShape(12.dp),
                color = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.4f),
                modifier = Modifier.padding(vertical = 8.dp)
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Text(
                        text = "Standard Reducing-Balance EMI Formula:",
                        style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                        color = MaterialTheme.colorScheme.onPrimaryContainer
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "EMI = P × r × (1+r)ⁿ / ((1+r)ⁿ - 1)",
                        style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold),
                        color = MaterialTheme.colorScheme.primary
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = "• P = Outstanding principal balance\n• r = Periodic interest rate (Annual % / 12 / 100)\n• n = Total number of monthly installments\n• Principal component increases while interest decreases each month.",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        // Table Header
        Surface(
            shape = RoundedCornerShape(topStart = 12.dp, topEnd = 12.dp),
            color = MaterialTheme.colorScheme.surfaceVariant
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 8.dp, vertical = 10.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Mo.",
                    style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                    modifier = Modifier.width(36.dp),
                    textAlign = TextAlign.Center
                )
                Text(
                    text = "EMI",
                    style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                    modifier = Modifier.weight(1.2f),
                    textAlign = TextAlign.End
                )
                Text(
                    text = "Principal",
                    style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                    modifier = Modifier.weight(1.2f),
                    textAlign = TextAlign.End
                )
                Text(
                    text = "Interest",
                    style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                    modifier = Modifier.weight(1.2f),
                    textAlign = TextAlign.End
                )
                Text(
                    text = "Balance",
                    style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                    modifier = Modifier.weight(1.4f),
                    textAlign = TextAlign.End
                )
            }
        }

        // Table Rows
        displayedItems.forEachIndexed { index, item ->
            val bg = if (index % 2 == 0) {
                MaterialTheme.colorScheme.surface
            } else {
                MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.35f)
            }

            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(bg)
                    .padding(horizontal = 8.dp, vertical = 9.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = item.installmentNumber.toString(),
                        style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.Medium),
                        modifier = Modifier.width(36.dp),
                        textAlign = TextAlign.Center
                    )
                    Text(
                        text = CurrencyFormatter.formatInr(item.emiAmount, false),
                        style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.SemiBold),
                        modifier = Modifier.weight(1.2f),
                        textAlign = TextAlign.End
                    )
                    Text(
                        text = CurrencyFormatter.formatInr(item.principalComponent, false),
                        style = MaterialTheme.typography.bodySmall.copy(color = MaterialTheme.colorScheme.primary),
                        modifier = Modifier.weight(1.2f),
                        textAlign = TextAlign.End
                    )
                    Text(
                        text = CurrencyFormatter.formatInr(item.interestComponent, false),
                        style = MaterialTheme.typography.bodySmall.copy(color = MaterialTheme.colorScheme.error),
                        modifier = Modifier.weight(1.2f),
                        textAlign = TextAlign.End
                    )
                    Text(
                        text = CurrencyFormatter.formatInr(item.closingBalance, false),
                        style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.Bold),
                        modifier = Modifier.weight(1.4f),
                        textAlign = TextAlign.End
                    )
                }
            }
            HorizontalDivider(color = MaterialTheme.colorScheme.outline.copy(alpha = 0.15f))
        }

        Spacer(modifier = Modifier.height(10.dp))

        // View more / less buttons
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.Center
        ) {
            if (displayCount < schedule.size) {
                OutlinedButton(
                    onClick = { displayCount = (displayCount + 24).coerceAtMost(schedule.size) },
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.outlinedButtonColors()
                ) {
                    Icon(
                        imageVector = Icons.Default.ExpandMore,
                        contentDescription = null,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Load Next 24 Months")
                }
            }
            if (displayCount > 12) {
                Spacer(modifier = Modifier.width(8.dp))
                TextButton(onClick = { displayCount = 12 }) {
                    Icon(
                        imageVector = Icons.Default.ExpandLess,
                        contentDescription = null,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Collapse")
                }
            }
        }
    }
}

private fun shareAmortizationCsv(context: Context, schedule: List<EmiScheduleItem>) {
    val csv = buildString {
        append("Month,Opening Balance (INR),EMI (INR),Principal Component (INR),Interest Component (INR),Closing Balance (INR)\n")
        schedule.forEach { item ->
            append("${item.installmentNumber},${item.openingBalance},${item.emiAmount},${item.principalComponent},${item.interestComponent},${item.closingBalance}\n")
        }
    }

    val intent = Intent(Intent.ACTION_SEND).apply {
        type = "text/plain"
        putExtra(Intent.EXTRA_SUBJECT, "LoanWise EMI Amortization Schedule")
        putExtra(Intent.EXTRA_TEXT, csv)
    }
    context.startActivity(Intent.createChooser(intent, "Share Amortization Schedule"))
}
