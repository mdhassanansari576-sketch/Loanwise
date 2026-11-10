package com.example.ui

import androidx.activity.compose.BackHandler
import androidx.compose.animation.Crossfade
import androidx.compose.foundation.background
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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.TrendingUp
import androidx.compose.material.icons.filled.AccountBalance
import androidx.compose.material.icons.filled.Calculate
import androidx.compose.material.icons.filled.CompareArrows
import androidx.compose.material.icons.filled.DarkMode
import androidx.compose.material.icons.filled.Dashboard
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.LightMode
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material.icons.filled.Savings
import androidx.compose.material.icons.filled.School
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.DrawerValue
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalDrawerSheet
import androidx.compose.material3.ModalNavigationDrawer
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.NavigationDrawerItem
import androidx.compose.material3.NavigationDrawerItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.material3.rememberDrawerState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.ui.screens.DashboardScreen
import com.example.ui.screens.EducationLoanScreen
import com.example.ui.screens.EmiCalculatorScreen
import com.example.ui.screens.LoanComparisonScreen
import com.example.ui.screens.OtherLoanScreen
import com.example.ui.screens.ProfileSettingsScreen
import com.example.ui.screens.SavedCalculationsScreen
import com.example.ui.screens.SipCalculatorScreen
import com.example.ui.screens.SipHistoryScreen
import com.example.ui.theme.Blue600
import com.example.ui.theme.Emerald500
import com.example.ui.theme.LoanWiseTheme
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch

data class NavigationItemSpec(
    val destination: AppDestination,
    val icon: ImageVector,
    val badge: String? = null
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LoanWiseApp(
    viewModel: MainViewModel = viewModel()
) {
    val currentDestination by viewModel.currentDestination.collectAsState()
    val isDarkMode by viewModel.isDarkMode.collectAsState()
    val drawerState = rememberDrawerState(initialValue = DrawerValue.Closed)
    val coroutineScope = rememberCoroutineScope()
    val snackbarHostState = remember { SnackbarHostState() }

    LaunchedEffect(Unit) {
        viewModel.toastEvent.collectLatest { message ->
            snackbarHostState.showSnackbar(message)
        }
    }

    // Handle system back navigation
    BackHandler(enabled = currentDestination != AppDestination.DASHBOARD) {
        viewModel.navigateTo(AppDestination.DASHBOARD)
    }

    val allNavigationItems = listOf(
        NavigationItemSpec(AppDestination.DASHBOARD, Icons.Default.Dashboard),
        NavigationItemSpec(AppDestination.EDUCATION_LOAN, Icons.Default.School, "Moratorium"),
        NavigationItemSpec(AppDestination.OTHER_LOAN, Icons.Default.AccountBalance),
        NavigationItemSpec(AppDestination.EMI_CALCULATOR, Icons.Default.Calculate),
        NavigationItemSpec(AppDestination.SIP_CALCULATOR, Icons.AutoMirrored.Filled.TrendingUp, "Step-Up"),
        NavigationItemSpec(AppDestination.SAVED_CALCULATIONS, Icons.Default.History),
        NavigationItemSpec(AppDestination.LOAN_COMPARISON, Icons.Default.CompareArrows),
        NavigationItemSpec(AppDestination.SIP_HISTORY, Icons.Default.Savings),
        NavigationItemSpec(AppDestination.SETTINGS, Icons.Default.Settings)
    )

    val bottomBarItems = listOf(
        NavigationItemSpec(AppDestination.DASHBOARD, Icons.Default.Dashboard),
        NavigationItemSpec(AppDestination.EDUCATION_LOAN, Icons.Default.School),
        NavigationItemSpec(AppDestination.OTHER_LOAN, Icons.Default.AccountBalance),
        NavigationItemSpec(AppDestination.SIP_CALCULATOR, Icons.AutoMirrored.Filled.TrendingUp),
        NavigationItemSpec(AppDestination.SAVED_CALCULATIONS, Icons.Default.History)
    )

    LoanWiseTheme(darkTheme = isDarkMode) {
        ModalNavigationDrawer(
            drawerState = drawerState,
            drawerContent = {
                ModalDrawerSheet(
                    drawerContainerColor = MaterialTheme.colorScheme.surface,
                    modifier = Modifier.width(310.dp)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(vertical = 12.dp)
                            .verticalScroll(rememberScrollState())
                    ) {
                        // Brand Header
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 20.dp, vertical = 16.dp)
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Box(
                                    modifier = Modifier
                                        .size(46.dp)
                                        .clip(RoundedCornerShape(14.dp))
                                        .background(MaterialTheme.colorScheme.primary),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(
                                        text = "₹",
                                        style = MaterialTheme.typography.titleLarge.copy(
                                            fontWeight = FontWeight.ExtraBold,
                                            color = Color.White
                                        )
                                    )
                                }
                                Spacer(modifier = Modifier.width(12.dp))
                                Column {
                                    Text(
                                        text = "LoanWise",
                                        style = MaterialTheme.typography.titleLarge.copy(
                                            fontWeight = FontWeight.ExtraBold,
                                            letterSpacing = (-0.5).sp
                                        ),
                                        color = MaterialTheme.colorScheme.onSurface
                                    )
                                    Text(
                                        text = "Smart Loan, EMI & SIP",
                                        style = MaterialTheme.typography.bodySmall,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }
                            }
                        }

                        HorizontalDivider(
                            modifier = Modifier.padding(horizontal = 16.dp, vertical = 6.dp),
                            color = MaterialTheme.colorScheme.outline.copy(alpha = 0.25f)
                        )

                        Text(
                            text = "FINANCIAL SUITE",
                            style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.padding(horizontal = 22.dp, vertical = 8.dp)
                        )

                        // 9 Items in Navigation Drawer
                        allNavigationItems.forEach { item ->
                            val isSelected = currentDestination == item.destination
                            NavigationDrawerItem(
                                icon = {
                                    Icon(
                                        imageVector = item.icon,
                                        contentDescription = null,
                                        tint = if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                },
                                label = {
                                    Text(
                                        text = item.destination.title,
                                        style = MaterialTheme.typography.bodyMedium.copy(
                                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium
                                        )
                                    )
                                },
                                badge = {
                                    if (item.badge != null) {
                                        Surface(
                                            shape = RoundedCornerShape(6.dp),
                                            color = if (item.destination == AppDestination.SIP_CALCULATOR) Emerald500.copy(alpha = 0.2f) else MaterialTheme.colorScheme.primaryContainer
                                        ) {
                                            Text(
                                                text = item.badge,
                                                style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                                                color = if (item.destination == AppDestination.SIP_CALCULATOR) Emerald500 else MaterialTheme.colorScheme.primary,
                                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                            )
                                        }
                                    }
                                },
                                selected = isSelected,
                                onClick = {
                                    viewModel.navigateTo(item.destination)
                                    coroutineScope.launch { drawerState.close() }
                                },
                                shape = RoundedCornerShape(14.dp),
                                colors = NavigationDrawerItemDefaults.colors(
                                    selectedContainerColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.5f),
                                    unselectedContainerColor = Color.Transparent
                                ),
                                modifier = Modifier
                                    .padding(horizontal = 12.dp, vertical = 2.dp)
                                    .testTag("nav_item_${item.destination.name.lowercase()}")
                            )
                        }

                        Spacer(modifier = Modifier.weight(1f))

                        HorizontalDivider(
                            modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp),
                            color = MaterialTheme.colorScheme.outline.copy(alpha = 0.25f)
                        )

                        // Quick theme toggle at bottom of drawer
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 20.dp, vertical = 6.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                imageVector = if (isDarkMode) Icons.Default.DarkMode else Icons.Default.LightMode,
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.primary,
                                modifier = Modifier.size(20.dp)
                            )
                            Spacer(modifier = Modifier.width(10.dp))
                            Text(
                                text = if (isDarkMode) "Dark Mode" else "Light Mode",
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            Spacer(modifier = Modifier.weight(1f))
                            IconButton(onClick = { viewModel.toggleDarkMode(!isDarkMode) }) {
                                Icon(
                                    imageVector = if (isDarkMode) Icons.Default.LightMode else Icons.Default.DarkMode,
                                    contentDescription = "Toggle Theme"
                                )
                            }
                        }
                    }
                }
            }
        ) {
            Scaffold(
                snackbarHost = { SnackbarHost(snackbarHostState) },
                topBar = {
                    TopAppBar(
                        title = {
                            Column {
                                Text(
                                    text = currentDestination.title,
                                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                                Text(
                                    text = "LoanWise Financial Suite",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        },
                        navigationIcon = {
                            IconButton(
                                onClick = {
                                    coroutineScope.launch {
                                        if (drawerState.isClosed) drawerState.open() else drawerState.close()
                                    }
                                },
                                modifier = Modifier.testTag("menu_drawer_button")
                            ) {
                                Icon(imageVector = Icons.Default.Menu, contentDescription = "Navigation Menu")
                            }
                        },
                        actions = {
                            IconButton(onClick = { viewModel.toggleDarkMode(!isDarkMode) }) {
                                Icon(
                                    imageVector = if (isDarkMode) Icons.Default.LightMode else Icons.Default.DarkMode,
                                    contentDescription = "Toggle Dark Mode",
                                    tint = MaterialTheme.colorScheme.onSurface
                                )
                            }
                        },
                        colors = TopAppBarDefaults.topAppBarColors(
                            containerColor = MaterialTheme.colorScheme.surface
                        )
                    )
                },
                bottomBar = {
                    NavigationBar(
                        containerColor = MaterialTheme.colorScheme.surface,
                        tonalElevation = 6.dp
                    ) {
                        bottomBarItems.forEach { item ->
                            val isSelected = currentDestination == item.destination
                            NavigationBarItem(
                                selected = isSelected,
                                onClick = { viewModel.navigateTo(item.destination) },
                                icon = {
                                    Icon(
                                        imageVector = item.icon,
                                        contentDescription = item.destination.title
                                    )
                                },
                                label = {
                                    Text(
                                        text = when (item.destination) {
                                            AppDestination.DASHBOARD -> "Home"
                                            AppDestination.EDUCATION_LOAN -> "Education"
                                            AppDestination.OTHER_LOAN -> "Loans"
                                            AppDestination.SIP_CALCULATOR -> "SIP"
                                            AppDestination.SAVED_CALCULATIONS -> "Saved"
                                            else -> item.destination.title
                                        },
                                        style = MaterialTheme.typography.labelSmall.copy(
                                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
                                        )
                                    )
                                },
                                colors = NavigationBarItemDefaults.colors(
                                    selectedIconColor = MaterialTheme.colorScheme.primary,
                                    selectedTextColor = MaterialTheme.colorScheme.primary,
                                    indicatorColor = MaterialTheme.colorScheme.primaryContainer
                                ),
                                modifier = Modifier.testTag("bottom_nav_${item.destination.name.lowercase()}")
                            )
                        }
                    }
                }
            ) { innerPadding ->
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(innerPadding)
                ) {
                    Crossfade(
                        targetState = currentDestination,
                        label = "ScreenTransition"
                    ) { destination ->
                        when (destination) {
                            AppDestination.DASHBOARD -> DashboardScreen(viewModel = viewModel)
                            AppDestination.EDUCATION_LOAN -> EducationLoanScreen(viewModel = viewModel)
                            AppDestination.OTHER_LOAN -> OtherLoanScreen(viewModel = viewModel)
                            AppDestination.EMI_CALCULATOR -> EmiCalculatorScreen(viewModel = viewModel)
                            AppDestination.SIP_CALCULATOR -> SipCalculatorScreen(viewModel = viewModel)
                            AppDestination.SAVED_CALCULATIONS -> SavedCalculationsScreen(viewModel = viewModel)
                            AppDestination.LOAN_COMPARISON -> LoanComparisonScreen(viewModel = viewModel)
                            AppDestination.SIP_HISTORY -> SipHistoryScreen(viewModel = viewModel)
                            AppDestination.SETTINGS -> ProfileSettingsScreen(viewModel = viewModel)
                        }
                    }
                }
            }
        }
    }
}
