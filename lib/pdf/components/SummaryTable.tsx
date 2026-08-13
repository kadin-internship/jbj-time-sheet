import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { BRAND_COLORS } from "@/lib/constants/brand";
import { computeTotals } from "@/lib/utils/totals";
import type { PdfTimesheetData } from "@/lib/pdf/types";

const styles = StyleSheet.create({
  table: {
    borderWidth: 1,
    borderColor: BRAND_COLORS.rose,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: "row",
    backgroundColor: BRAND_COLORS.maroon,
  },
  row: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: BRAND_COLORS.rose,
  },
  totalRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: BRAND_COLORS.rose,
    backgroundColor: "#F3E1E1",
  },
  headerCell: { color: BRAND_COLORS.white, fontSize: 10, fontWeight: 700, padding: 6 },
  cell: { fontSize: 10, padding: 6, color: BRAND_COLORS.gray },
  totalCell: { fontSize: 10, fontWeight: 700, padding: 6, color: BRAND_COLORS.gray },
  projectCol: { width: "70%" },
  totalCol: { width: "30%", textAlign: "center" },
});

export function SummaryTable({ data }: { data: PdfTimesheetData }) {
  const entries = data.projects.flatMap((p) =>
    data.weekDates.map((wd) => ({
      projectId: p.id,
      entryDate: wd.date,
      hours: data.hours[p.id]?.[wd.date] ?? 0,
    })),
  );
  const totals = computeTotals(entries);
  const worked = data.projects.filter((p) => (totals.projectTotals[p.id] ?? 0) > 0);

  return (
    <View style={styles.table}>
      <View style={styles.headerRow}>
        <Text style={[styles.headerCell, styles.projectCol]}>Project</Text>
        <Text style={[styles.headerCell, styles.totalCol]}>Total Hours</Text>
      </View>
      {worked.length === 0 && (
        <View style={styles.row}>
          <Text style={[styles.cell, { width: "100%" }]}>No hours recorded this week.</Text>
        </View>
      )}
      {worked.map((project) => (
        <View key={project.id} style={styles.row}>
          <Text style={[styles.cell, styles.projectCol]}>{project.name}</Text>
          <Text style={[styles.cell, styles.totalCol]}>
            {(totals.projectTotals[project.id] ?? 0).toFixed(2)}
          </Text>
        </View>
      ))}
      <View style={styles.totalRow}>
        <Text style={[styles.totalCell, styles.projectCol]}>Week Total</Text>
        <Text style={[styles.totalCell, styles.totalCol]}>{totals.weekTotal.toFixed(2)}</Text>
      </View>
    </View>
  );
}
