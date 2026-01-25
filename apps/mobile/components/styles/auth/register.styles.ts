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
});
