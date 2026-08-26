// Five Star Conveyancing — PDF quote document template
// Rendered with @react-pdf/renderer, which uses its own CSS-subset styling
// engine (StyleSheet.create) rather than the site's normal CSS — hex colors
// here are a fixed approximation of the brand palette in lib/theme.ts, not a
// shared source of truth, since react-pdf can't consume oklch() values.

import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { PublicQuoteResult } from "five-star-conveyancing-quote-engine/api/publicResult";
import type { LineItem } from "five-star-conveyancing-quote-engine/types";

const NAVY = "#2b2640";
const TEAL = "#4a4270";
const BORDER = "#d9d6e6";
const TEXT_BODY = "#5c5670";
const TEXT_MUTED = "#7a7590";

const styles = StyleSheet.create({
  page: { padding: 36, fontSize: 10, color: TEXT_BODY, fontFamily: "Helvetica" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 },
  siteTitle: { fontSize: 14, fontWeight: 700, color: NAVY },
  reference: { fontSize: 9, color: TEXT_MUTED, marginTop: 2 },
  firmName: { fontSize: 16, fontWeight: 700, color: NAVY, marginBottom: 2 },
  sra: { fontSize: 9, color: TEXT_MUTED, marginBottom: 14 },
  sectionTitle: { fontSize: 10, fontWeight: 700, color: NAVY, marginTop: 14, marginBottom: 6 },
  table: { borderTopWidth: 1, borderTopColor: BORDER, borderTopStyle: "solid" },
  row: {
    flexDirection: "row",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    borderBottomStyle: "solid",
  },
  cellName: { flex: 3 },
  cellFlag: { flex: 1, fontSize: 8, color: TEXT_MUTED },
  cellAmount: { flex: 1, textAlign: "right" },
  totalsBlock: { marginTop: 16, alignSelf: "flex-end", width: 220 },
  totalsRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3 },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 6,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    borderTopStyle: "solid",
  },
  grandTotalLabel: { fontSize: 11, fontWeight: 700, color: NAVY },
  grandTotalValue: { fontSize: 11, fontWeight: 700, color: TEAL },
  footer: { position: "absolute", bottom: 28, left: 36, right: 36, fontSize: 8, color: TEXT_MUTED },
});

function formatMoney(amount: number): string {
  return `£${amount.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function categoryLabel(item: LineItem): string {
  switch (item.category) {
    case "legal_fee":
      return "Legal fee";
    case "supplement":
      return "Supplement";
    case "disbursement":
      return "Disbursement";
    case "sdlt":
      return "SDLT / LTT";
    default:
      return item.category;
  }
}

export function QuotePdfDocument({ quoteReference, result, generatedAt }: { quoteReference: string; result: PublicQuoteResult; generatedAt: Date }) {
  const displayName = result.firm.tradingName ?? result.firm.legalEntityName;

  return (
    <Document title={`Five Star Conveyancing quote ${quoteReference}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.siteTitle}>Five Star Conveyancing</Text>
            <Text style={styles.reference}>Quote reference: {quoteReference}</Text>
            <Text style={styles.reference}>Generated: {generatedAt.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</Text>
          </View>
        </View>

        <Text style={styles.firmName}>{displayName}</Text>
        {result.firm.sraNumber && <Text style={styles.sra}>SRA number: {result.firm.sraNumber}</Text>}

        {result.eligibilityStatus === "excluded_with_reason" ? (
          <Text>{result.exclusionReason ?? "This firm is not eligible for this transaction."}</Text>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Fee breakdown</Text>
            <View style={styles.table}>
              {result.lineItems.map((item, i) => (
                <View key={i} style={styles.row}>
                  <Text style={styles.cellName}>{item.chargeName}</Text>
                  <Text style={styles.cellFlag}>{categoryLabel(item)}</Text>
                  <Text style={styles.cellFlag}>{item.isGuaranteed ? "Fixed" : item.isEstimated ? "Estimated" : ""}</Text>
                  <Text style={styles.cellAmount}>{formatMoney(item.amountExVat)}</Text>
                </View>
              ))}
            </View>

            <View style={styles.totalsBlock}>
              <View style={styles.totalsRow}>
                <Text>Legal fee subtotal</Text>
                <Text>{formatMoney(result.legalFeeSubtotal)}</Text>
              </View>
              <View style={styles.totalsRow}>
                <Text>VAT</Text>
                <Text>{formatMoney(result.vatTotal)}</Text>
              </View>
              <View style={styles.totalsRow}>
                <Text>Disbursements</Text>
                <Text>{formatMoney(result.disbursementsTotal)}</Text>
              </View>
              {result.sdltEstimate !== null && (
                <View style={styles.totalsRow}>
                  <Text>SDLT / LTT estimate</Text>
                  <Text>{formatMoney(result.sdltEstimate)}</Text>
                </View>
              )}
              <View style={styles.grandTotalRow}>
                <Text style={styles.grandTotalLabel}>Total</Text>
                <Text style={styles.grandTotalValue}>{result.totalEstimate !== null ? formatMoney(result.totalEstimate) : "—"}</Text>
              </View>
            </View>
          </>
        )}

        <Text style={styles.footer}>
          This is an estimate based on the information provided and the firm&apos;s published fee scale at the time of generation. It is not a
          binding offer. Fees may change before completion — please confirm final figures directly with the firm before instructing them.
        </Text>
      </Page>
    </Document>
  );
}
