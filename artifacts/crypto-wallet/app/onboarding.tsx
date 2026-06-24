import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
  Dimensions,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const { width } = Dimensions.get("window");

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={["#0A0B14", "#141530", "#0A0B14"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <View
        style={[
          styles.content,
          { paddingTop: topPad + 60, paddingBottom: bottomPad + 40 },
        ]}
      >
        <View style={styles.logoArea}>
          <View style={[styles.logoCircle, { backgroundColor: colors.primary + "22" }]}>
            <View style={[styles.logoInner, { backgroundColor: colors.primary }]}>
              <Text style={styles.logoIcon}>⬡</Text>
            </View>
          </View>

          <Text style={[styles.appName, { color: colors.foreground }]}>
            CryptoVault
          </Text>
          <Text style={[styles.tagline, { color: colors.mutedForeground }]}>
            去中心化热钱包，掌控你的资产
          </Text>
        </View>

        <View style={styles.features}>
          {[
            { icon: "🔐", title: "私钥本地存储", desc: "助记词加密保存在设备中" },
            { icon: "⛓", title: "多链支持", desc: "支持以太坊主网及测试网络" },
            { icon: "⚡", title: "快速转账", desc: "联网即可发送和接收加密货币" },
          ].map((f) => (
            <View
              key={f.title}
              style={[styles.featureRow, { borderColor: colors.border + "60" }]}
            >
              <Text style={styles.featureIcon}>{f.icon}</Text>
              <View style={styles.featureText}>
                <Text style={[styles.featureTitle, { color: colors.foreground }]}>
                  {f.title}
                </Text>
                <Text
                  style={[styles.featureDesc, { color: colors.mutedForeground }]}
                >
                  {f.desc}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.buttons}>
          <Pressable
            onPress={() => router.push("/create-wallet")}
            style={({ pressed }) => [
              styles.primaryBtn,
              { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Text style={styles.primaryBtnText}>创建新钱包</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push("/import-wallet")}
            style={({ pressed }) => [
              styles.secondaryBtn,
              {
                borderColor: colors.border,
                backgroundColor: colors.card,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Text style={[styles.secondaryBtnText, { color: colors.foreground }]}>
              导入已有钱包
            </Text>
          </Pressable>
        </View>

        <Text style={[styles.disclaimer, { color: colors.mutedForeground }]}>
          你的私钥由你自己掌管，我们无法恢复丢失的助记词
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: "space-between",
  },
  logoArea: {
    alignItems: "center",
    gap: 12,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  logoInner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  logoIcon: {
    fontSize: 36,
    color: "#fff",
  },
  appName: {
    fontSize: 32,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  features: {
    gap: 12,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  featureIcon: {
    fontSize: 24,
    width: 36,
    textAlign: "center",
  },
  featureText: {
    flex: 1,
    gap: 2,
  },
  featureTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  featureDesc: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  buttons: {
    gap: 12,
  },
  primaryBtn: {
    height: 54,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
  },
  secondaryBtn: {
    height: 54,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  secondaryBtnText: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
  },
  disclaimer: {
    fontSize: 12,
    textAlign: "center",
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
});
