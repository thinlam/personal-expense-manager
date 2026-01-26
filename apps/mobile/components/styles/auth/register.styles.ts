import { StyleSheet } from "react-native";
import { colors, spacing, typography } from "../";

export const registerStyles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: spacing.lg,
    justifyContent: "center",
  },

  title: {
    color: colors.text,
    ...typography.title,
    marginBottom: 6,
  },

  subtitle: {
    color: colors.textSecondary,
    ...typography.subtitle,
    marginBottom: spacing.lg,
  },

  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.strokeSoft,
    borderRadius: 18,
    padding: spacing.md,
  },

  label: {
    color: "#CFE0FF",
    ...typography.label,
    marginBottom: 8,
  },

  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: colors.inputBg,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },

  input: {
    flex: 1,
    color: colors.text,
    ...typography.input,
  },

  iconBtn: {
    paddingLeft: 6,
  },

  helper: {
    color: "#9DB0D9",
    ...typography.helper,
    marginTop: 6,
  },

  primaryBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.md,
  },

  primaryBtnDisabled: {
    opacity: 0.5,
  },

  primaryBtnText: {
    color: "#FFFFFF",
    ...typography.buttonPrimary,
  },

  footerText: {
    color: colors.textSecondary,
    ...typography.footer,
    textAlign: "center",
    marginTop: spacing.md,
  },

  link: {
    color: "#AFC4FF",
    fontWeight: "800",
    textDecorationLine: "underline",
  },
  headerRow: {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 24,
},

backBtn: {
  padding: 6,
  marginRight: 8,
},

headerTitle: {
  color: colors.text,
  fontSize: 16,
  fontWeight: "700",
},

bigTitle: {
  color: colors.text,
  fontSize: 24,
  fontWeight: "800",
  marginBottom: 6,
},

dividerRow: {
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.sm,
  marginVertical: spacing.md,
},

dividerLine: {
  flex: 1,
  height: 1,
  backgroundColor: colors.strokeSoft,
},

dividerText: {
  color: "#9DB0D9",
  fontSize: 12,
},

checkboxRow: {
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
  marginTop: 12,
},

checkboxText: {
  color: colors.textSecondary,
  fontSize: 12,
  flex: 1,
},

linkInline: {
  color: "#1FEE6D",
  fontWeight: "700",
},

googleBtn: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
  borderWidth: 1,
  borderColor: colors.stroke,
  borderRadius: 14,
  paddingVertical: 12,
},

googleText: {
  color: colors.text,
  fontSize: 14,
  fontWeight: "600",
},

});
