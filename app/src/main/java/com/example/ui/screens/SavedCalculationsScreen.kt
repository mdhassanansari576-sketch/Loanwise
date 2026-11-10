package com.example.ui.screens

import android.content.Context
import android.content.Intent
import androidx.compose.animation.AnimatedVisibility
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
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.TrendingUp
import androidx.compose.material.icons.filled.AccountBalance
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.data.local.entity.LoanCalculationEntity
import com.example.data.local.entity.SipCalculationEntity
import com.example.domain.calculator.CurrencyFormatter
import com.example.ui.MainViewModel
import com.example.ui.components.FintechCard
import com.example.ui.theme.Blue600
import com.example.ui.theme.Emerald500
import com.example.ui.theme.Indigo600
import com.example.ui.theme.Rose500

enum class CalculationFilter(val label: String) {
    ALL("All Calculations"),
    LOANS("Loans"),
    SIPS("SIP Investments")
}

@Composable
fun SavedCalculationsScreen(
    viewModel: MainViewModel,
    modifier: Modifier = Modifier
) {
    val loans by viewModel.allLoans.collectAsState()
    val sips by viewModel.allSips.collectAsState()

    var searchQuery by remember { mutableStateOf("") }
    var selectedFilter by remember { mutableStateOf(CalculationFilter.ALL) }

    // Dialog States
    var renameLoanTarget by remember { mutableStateOf<LoanCalculationEntity?>(null) }
    var renameSipTarget by remember { mutableStateOf<SipCalculationEntity?>(null) }
    var renameInputText by remember { mutableStateOf("") }

    var deleteLoanTarget by remember { mutableStateOf<LoanCalculationEntity?>(null) }
    var deleteSipTarget by remember { mutableStateOf<SipCalculationEntity?>(null) }

    val context = LocalContext.current

    val filteredLoans = loans.filter {
        (selectedFilter == CalculationFilter.ALL || selectedFilter == CalculationFilter.LOANS) &&
        (it.loanName.contains(searchQuery, ignoreCase = true) || it.loanType.contains(searchQuery, ignoreCase = true))
    }

    val filteredSips = sips.filter {
        (selectedFilter == CalculationFilter.ALL || selectedFilter == CalculationFilter.SIPS) &&
        (it.sipName.contains(searchQuery, ignoreCase = true) || it.sipFrequency.contains(searchQuery, ignoreCase = true))
    }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
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
                        imageVector = Icons.Default.History,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.size(22.dp)
                    )
                }
                Spacer(modifier = Modifier.width(10.dp))
                Column {
                    Text(
                        text = "Saved Calculations",
                        style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Text(
                        text = "Database History & Scenario Archives",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        }

        // Search Bar
        item {
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                placeholder = { Text("Search by calculation or loan type...") },
                leadingIcon = {
                    Icon(imageVector = Icons.Default.Search, contentDescription = null)
                },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                singleLine = true
            )
        }

        // Filter Chips
        item {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                CalculationFilter.values().forEach { filter ->
                    FilterChip(
                        selected = selectedFilter == filter,
                        onClick = { selectedFilter = filter },
                        label = { Text(filter.label) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = MaterialTheme.colorScheme.primaryContainer,
                            selectedLabelColor = MaterialTheme.colorScheme.onPrimaryContainer
                        )
                    )
                }
            }
        }

        // Empty state
        if (filteredLoans.isEmpty() && filteredSips.isEmpty()) {
            item {
                FintechCard {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Icon(
                            imageVector = Icons.Default.History,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.size(48.dp)
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        Text(
                            text = "No calculations found",
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "Calculations saved from Education, Other Loan, or SIP calculator appear here.",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }
        }

        // Loan Items
        items(filteredLoans, key = { it.id }) { loan ->
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(18.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = MaterialTheme.colorScheme.primaryContainer
                        ) {
                            Text(
                                text = loan.loanType,
                                style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                                color = MaterialTheme.colorScheme.onPrimaryContainer,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                            )
                        }

                        Row {
                            IconButton(onClick = {
                                renameLoanTarget = loan
                                renameInputText = loan.loanName
                            }) {
                                Icon(imageVector = Icons.Default.Edit, contentDescription = "Rename", tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(18.dp))
                            }
                            IconButton(onClick = { viewModel.duplicateLoan(loan.id) }) {
                                Icon(imageVector = Icons.Default.ContentCopy, contentDescription = "Duplicate", tint = MaterialTheme.colorScheme.secondary, modifier = Modifier.size(18.dp))
                            }
                            IconButton(onClick = { deleteLoanTarget = loan }) {
                                Icon(imageVector = Icons.Default.Delete, contentDescription = "Delete", tint = Rose500, modifier = Modifier.size(18.dp))
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(6.dp))

                    Text(
                        text = loan.loanName,
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                        color = MaterialTheme.colorScheme.onSurface
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column {
                            Text("Disbursed", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            Text(CurrencyFormatter.formatInr(loan.totalDisbursedAmount), style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold))
                        }
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("Monthly EMI", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            Text(CurrencyFormatter.formatInr(loan.emiAmount), style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold, color = Blue600))
                        }
                        Column(horizontalAlignment = Alignment.End) {
                            Text("Total Repayment", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            Text(CurrencyFormatter.formatInrCompact(loan.totalRepayment), style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold))
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "${loan.repaymentDurationYears.toInt()} Years • ${loan.interestType}",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        IconButton(onClick = {
                            val text = "LoanWise: ${loan.loanName} - Principal: ${CurrencyFormatter.formatInr(loan.totalDisbursedAmount)}, EMI: ${CurrencyFormatter.formatInr(loan.emiAmount)}/mo, Total: ${CurrencyFormatter.formatInr(loan.totalRepayment)}"
                            val intent = Intent(Intent.ACTION_SEND).apply {
                                type = "text/plain"
                                putExtra(Intent.EXTRA_TEXT, text)
                            }
                            context.startActivity(Intent.createChooser(intent, "Share Loan Details"))
                        }) {
                            Icon(imageVector = Icons.Default.Share, contentDescription = "Share", modifier = Modifier.size(16.dp))
                        }
                    }
                }
            }
        }

        // SIP Items
        items(filteredSips, key = { it.id }) { sip ->
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(18.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = Emerald500.copy(alpha = 0.2f)
                        ) {
                            Text(
                                text = "SIP (${sip.sipFrequency})",
                                style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                                color = Emerald500,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                            )
                        }

                        Row {
                            IconButton(onClick = {
                                renameSipTarget = sip
                                renameInputText = sip.sipName
                            }) {
                                Icon(imageVector = Icons.Default.Edit, contentDescription = "Rename", tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(18.dp))
                            }
                            IconButton(onClick = { viewModel.duplicateSip(sip.id) }) {
                                Icon(imageVector = Icons.Default.ContentCopy, contentDescription = "Duplicate", tint = MaterialTheme.colorScheme.secondary, modifier = Modifier.size(18.dp))
                            }
                            IconButton(onClick = { deleteSipTarget = sip }) {
                                Icon(imageVector = Icons.Default.Delete, contentDescription = "Delete", tint = Rose500, modifier = Modifier.size(18.dp))
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(6.dp))

                    Text(
                        text = sip.sipName,
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                        color = MaterialTheme.colorScheme.onSurface
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column {
                            Text("Monthly", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            Text(CurrencyFormatter.formatInr(sip.monthlyInvestment), style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold))
                        }
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("Invested Capital", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            Text(CurrencyFormatter.formatInrCompact(sip.totalInvestedAmount), style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold))
                        }
                        Column(horizontalAlignment = Alignment.End) {
                            Text("Projected Wealth", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            Text(CurrencyFormatter.formatInrCompact(sip.estimatedFutureValue), style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold, color = Emerald500))
                        }
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    Text(
                        text = "${sip.investmentDurationYears} Years • Return: ${sip.expectedAnnualReturn}%" + if (sip.stepUpPercentage > 0) " • ${sip.stepUpPercentage.toInt()}% Step-up" else "",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        }

        item {
            Spacer(modifier = Modifier.height(24.dp))
        }
    }

    // Rename Loan Dialog
    renameLoanTarget?.let { target ->
        AlertDialog(
            onDismissRequest = { renameLoanTarget = null },
            title = { Text("Rename Calculation") },
            text = {
                OutlinedTextField(
                    value = renameInputText,
                    onValueChange = { renameInputText = it },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
            },
            confirmButton = {
                Button(onClick = {
                    viewModel.renameLoan(target.id, renameInputText)
                    renameLoanTarget = null
                }) {
                    Text("Rename")
                }
            },
            dismissButton = {
                TextButton(onClick = { renameLoanTarget = null }) {
                    Text("Cancel")
                }
            }
        )
    }

    // Rename SIP Dialog
    renameSipTarget?.let { target ->
        AlertDialog(
            onDismissRequest = { renameSipTarget = null },
            title = { Text("Rename SIP Calculation") },
            text = {
                OutlinedTextField(
                    value = renameInputText,
                    onValueChange = { renameInputText = it },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
            },
            confirmButton = {
                Button(onClick = {
                    viewModel.renameSip(target.id, renameInputText)
                    renameSipTarget = null
                }) {
                    Text("Rename")
                }
            },
            dismissButton = {
                TextButton(onClick = { renameSipTarget = null }) {
                    Text("Cancel")
                }
            }
        )
    }

    // Delete Loan Dialog
    deleteLoanTarget?.let { target ->
        AlertDialog(
            onDismissRequest = { deleteLoanTarget = null },
            title = { Text("Delete Calculation?") },
            text = { Text("Are you sure you want to delete '${target.loanName}' from the database?") },
            confirmButton = {
                Button(
                    onClick = {
                        viewModel.deleteLoan(target.id)
                        deleteLoanTarget = null
                    },
                    colors = androidx.compose.material3.ButtonDefaults.buttonColors(containerColor = Rose500)
                ) {
                    Text("Delete")
                }
            },
            dismissButton = {
                TextButton(onClick = { deleteLoanTarget = null }) {
                    Text("Cancel")
                }
            }
        )
    }

    // Delete SIP Dialog
    deleteSipTarget?.let { target ->
        AlertDialog(
            onDismissRequest = { deleteSipTarget = null },
            title = { Text("Delete SIP Calculation?") },
            text = { Text("Are you sure you want to delete '${target.sipName}' from the database?") },
            confirmButton = {
                Button(
                    onClick = {
                        viewModel.deleteSip(target.id)
                        deleteSipTarget = null
                    },
                    colors = androidx.compose.material3.ButtonDefaults.buttonColors(containerColor = Rose500)
                ) {
                    Text("Delete")
                }
            },
            dismissButton = {
                TextButton(onClick = { deleteSipTarget = null }) {
                    Text("Cancel")
                }
            }
        )
    }
}
