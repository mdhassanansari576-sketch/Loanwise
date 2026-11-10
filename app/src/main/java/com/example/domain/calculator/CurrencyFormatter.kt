package com.example.domain.calculator

import java.text.DecimalFormat
import java.text.DecimalFormatSymbols
import java.util.Locale

object CurrencyFormatter {

    fun formatInr(amount: Double, includeDecimals: Boolean = false): String {
        if (amount.isNaN() || amount.isInfinite()) return "₹0"
        
        val isNegative = amount < 0
        val absAmount = kotlin.math.abs(amount)
        
        val longVal = absAmount.toLong()
        val decimalPart = if (includeDecimals) {
            val decimals = ((absAmount - longVal) * 100).toInt()
            String.format(Locale.US, ".%02d", decimals)
        } else ""

        val s = longVal.toString()
        val formatted = if (s.length <= 3) {
            s
        } else {
            val lastThree = s.substring(s.length - 3)
            val rest = s.substring(0, s.length - 3)
            val sb = StringBuilder()
            var count = 0
            for (i in rest.length - 1 downTo 0) {
                sb.append(rest[i])
                count++
                if (count % 2 == 0 && i > 0) {
                    sb.append(',')
                }
            }
            sb.reverse().append(',').append(lastThree).toString()
        }

        val prefix = if (isNegative) "-₹" else "₹"
        return "$prefix$formatted$decimalPart"
    }

    fun formatInrCompact(amount: Double): String {
        if (amount.isNaN() || amount.isInfinite()) return "₹0"
        val absAmount = kotlin.math.abs(amount)
        val prefix = if (amount < 0) "-₹" else "₹"

        return when {
            absAmount >= 10_000_000 -> { // 1 Crore
                val cr = absAmount / 10_000_000.0
                String.format(Locale.US, "%s%.2f Cr", prefix, cr)
            }
            absAmount >= 100_000 -> { // 1 Lakh
                val lakh = absAmount / 100_000.0
                String.format(Locale.US, "%s%.2f L", prefix, lakh)
            }
            absAmount >= 1_000 -> { // 1 Thousand
                val k = absAmount / 1_000.0
                String.format(Locale.US, "%s%.1f K", prefix, k)
            }
            else -> formatInr(amount, false)
        }
    }

    fun formatPercentage(value: Double): String {
        return String.format(Locale.US, "%.2f%%", value)
    }
}
