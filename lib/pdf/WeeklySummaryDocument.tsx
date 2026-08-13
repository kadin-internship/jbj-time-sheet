import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { PDFHeader } from "@/lib/pdf/components/PDFHeader";
import { SummaryTable } from "@/lib/pdf/components/SummaryTable";
import { SignatureBlock } from "@/lib/pdf/components/SignatureBlock";
import { BRAND_COLORS } from "@/lib/constants/brand";
import type { PdfTimesheetData } from "@/lib/pdf/types";

const styles = StyleSheet.create({
  page: { padding: 28, fontSize: 10, color: BRAND_COLORS.gray },
  notesBox: {
    borderWidth: 1,
    borderColor: BRAND_COLORS.rose,
    padding: 8,
    minHeight: 80,
  },
  notesLabel: { fontSize: 9, fontWeight: 700, marginBottom: 4 },
  notesText: { fontSize: 10 },
});

export function WeeklySummaryDocument({ data }: { data: PdfTimesheetData }) {
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <PDFHeader data={data} subtitle="Weekly Summary" />
        <SummaryTable data={data} />
        <View style={styles.notesBox}>
          <Text style={styles.notesLabel}>Weekly Activity</Text>
          <Text style={styles.notesText}>{data.weeklyActivityNotes || ""}</Text>
        </View>
        <SignatureBlock />
      </Page>
    </Document>
  );
}
