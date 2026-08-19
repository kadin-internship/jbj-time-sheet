import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { BRAND_COLORS } from "@/lib/constants/brand";
import { computeTotals } from "@/lib/utils/totals";
import { filterVisibleProjects } from "@/lib/pdf/visibleProjects";
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
  headerCell: {
    color: BRAND_COLORS.white,
    fontSize: 9,
    fontWeight: 700,
    padding: 5,
  },
  cell: {
    fontSize: 9,
    padding: 5,
    color: BRAND_COLORS.gray,
  },
  totalCell: {
    fontSize: 9,
    fontWeight: 700,
    padding: 5,
    color: BRAND_COLORS.gray,
  },
  projectCol: { width: "34%" },
  dayCol: { width: "11%", textAlign: "center" },
  totalCol: { width: "11%", textAlign: "center" },
});

export function GridTable({ data }: { data: PdfTimesheetData }) {
  const entries = data.projects.flatMap((p) =>
    data.weekDates.map((wd) => ({
      projectId: p.id,
      entryDate: wd.date,
      hours: data.hours[p.id]?.[wd.date] ?? 0,
    })),
  );
  const totals = computeTotals(entries);
  const visibleProjects = filterVisibleProjects(data.projects, totals.projectTotals);

  return (
    <View style={styles.table}>
      <View style={styles.headerRow}>
        <Text style={[styles.headerCell, styles.projectCol]}>Project</Text>
        {data.weekDates.map((wd) => (
          <Text key={wd.date} style={[styles.headerCell, styles.dayCol]}>
            {wd.label.slice(0, 3)}
          </Text>
        ))}
        <Text style={[styles.headerCell, styles.totalCol]}>Total</Text>
      </View>

      {visibleProjects.map((project) => (
        <View key={project.id} style={styles.row}>
          <Text style={[styles.cell, styles.projectCol]}>{project.name}</Text>
          {data.weekDates.map((wd) => {
            const value = data.hours[project.id]?.[wd.date] ?? 0;
            return (
              <Text key={wd.date} style={[styles.cell, styles.dayCol]}>
                {value > 0 ? value.toFixed(2) : ""}
              </Text>
            );
          })}
          <Text style={[styles.totalCell, styles.totalCol]}>
            {(totals.projectTotals[project.id] ?? 0).toFixed(2)}
          </Text>
        </View>
      ))}

      <View style={styles.totalRow}>
        <Text style={[styles.totalCell, styles.projectCol]}>Daily Total</Text>
        {data.weekDates.map((wd) => (
          <Text key={wd.date} style={[styles.totalCell, styles.dayCol]}>
            {(totals.dailyTotals[wd.date] ?? 0).toFixed(2)}
          </Text>
        ))}
        <Text style={[styles.totalCell, styles.totalCol]}>{totals.weekTotal.toFixed(2)}</Text>
      </View>
    </View>
  );
}
