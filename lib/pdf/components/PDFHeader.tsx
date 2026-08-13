import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { BRAND_COLORS, SHEET_TITLE } from "@/lib/constants/brand";
import { formatWeekRange } from "@/lib/utils/week";
import type { PdfTimesheetData } from "@/lib/pdf/types";

const styles = StyleSheet.create({
  titleBar: {
    backgroundColor: BRAND_COLORS.maroon,
    color: BRAND_COLORS.white,
    padding: 12,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    textAlign: "center",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 10,
    color: BRAND_COLORS.gray,
  },
  infoValue: {
    fontSize: 12,
    fontWeight: 700,
  },
});

export function PDFHeader({ data, subtitle }: { data: PdfTimesheetData; subtitle: string }) {
  return (
    <View>
      <View style={styles.titleBar}>
        <Text style={styles.title}>{SHEET_TITLE}</Text>
        <Text style={{ fontSize: 11, textAlign: "center", marginTop: 2 }}>{subtitle}</Text>
      </View>
      <View style={styles.infoRow}>
        <View>
          <Text style={styles.infoLabel}>Employee Name</Text>
          <Text style={styles.infoValue}>{data.employeeName}</Text>
        </View>
        <View>
          <Text style={styles.infoLabel}>Week</Text>
          <Text style={styles.infoValue}>
            {formatWeekRange(data.weekStartDate, data.weekEndDate)}
          </Text>
        </View>
        <View>
          <Text style={styles.infoLabel}>Check Date</Text>
          <Text style={styles.infoValue}>{data.checkDate ?? ""}</Text>
        </View>
      </View>
    </View>
  );
}
