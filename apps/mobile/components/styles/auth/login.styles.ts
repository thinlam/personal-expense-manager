import { StyleSheet } from "react-native";
import { colors, spacing, typography } from "../";

export const loginStyles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: spacing.lg,
    justifyContent: "center",
  },

  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },

  brandIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(230,240,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.stroke,
  },

  brandText: {
    color: colors.text,
    ...typography.brand,
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

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },

  helper: {
    color: "#9DB0D9",
    ...typography.helper,
  },

  linkMuted: {
    color: "#AFC4FF",
    ...typography.helper,
    textDecorationLine: "underline",
  },

  primaryBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  primaryBtnDisabled: {
    opacity: 0.5,
  },

  primaryBtnText: {
    color: "#FFFFFF",
    ...typography.buttonPrimary,
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
    ...typography.helper,
  },

  secondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 14,
    paddingVertical: 12,
  },

  secondaryBtnText: {
    color: colors.text,
    ...typography.buttonSecondary,
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

  disclaimer: {
    marginTop: spacing.md,
    textAlign: "center",
    color: "rgba(182,195,225,0.75)",
    ...typography.disclaimer,
  },
});
