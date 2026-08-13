import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { BRAND_COLORS } from "@/lib/constants/brand";

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },
  column: { width: "46%" },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: BRAND_COLORS.black,
    minHeight: 28,
  },
  label: { fontSize: 9, color: BRAND_COLORS.gray, marginTop: 3 },
});

export function SignatureBlock() {
  return (
    <View style={styles.container}>
      <View style={styles.column}>
        <View style={styles.signatureLine} />
        <Text style={styles.label}>Employee Signature</Text>
      </View>
      <View style={styles.column}>
        <View style={styles.signatureLine} />
        <Text style={styles.label}>Approval</Text>
      </View>
    </View>
  );
}
