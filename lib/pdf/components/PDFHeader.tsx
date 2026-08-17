import path from "node:path";
import { View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import { BRAND_COLORS, SHEET_TITLE } from "@/lib/constants/brand";
import { formatWeekRange } from "@/lib/utils/week";
import type { PdfTimesheetData } from "@/lib/pdf/types";

const LOGO_PATH = path.join(process.cwd(), "public/icons/icon-512.png");

const styles = StyleSheet.create({
  titleBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: BRAND_COLORS.maroon,
    padding: 12,
    marginBottom: 12,
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: 4,
  },
  titleTextBlock: {
    flex: 1,
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    color: BRAND_COLORS.white,
    textAlign: "center",
  },
  infoRow: {
    flexDirection: "row",
    gap: 32,
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
        <Image src={LOGO_PATH} style={styles.logo} />
        <View style={styles.titleTextBlock}>
          <Text style={styles.title}>{SHEET_TITLE}</Text>
          <Text style={{ fontSize: 11, textAlign: "center", marginTop: 2, color: BRAND_COLORS.white }}>
            {subtitle}
          </Text>
        </View>
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
      </View>
    </View>
  );
}
