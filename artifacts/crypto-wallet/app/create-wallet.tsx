import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useWallet } from "@/context/WalletContext";

type Step = "generating" | "show" | "confirm";

export default function CreateWalletScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { createWallet } = useWallet();

  const [step, setStep] = useState<Step>("generating");
  const [mnemonic, setMnemonic] = useState<string[]>([]);
  const [confirmed, setConfirmed] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  useEffect(() => {
    generateWallet();
  }, []);

  const generateWallet = async () => {
    setStep("generating");
    try {
      const { mnemonic: phrase } = await createWallet();
      setMnemonic(phrase.split(" "));
      setStep("show");
    } catch (e) {
      Alert.alert("错误", "创建钱包失败，请重试");
      router.back();
    }
  };

  const handleContinue = async () => {
    if (!confirmed) {
      Alert.alert("请确认", "请勾选确认你已备份助记词");
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace("/(tabs)");
  };

  if (step === "generating") {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>
          正在生成安全钱包...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: topPad + 20, paddingBottom: bottomPad + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: colors.foreground }]}>
          备份助记词
        </Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          这 12 个单词是你钱包的唯一恢复凭证，请抄写并保存在安全的地方
        </Text>

        <View
          style={[
            styles.warningBox,
            {
              backgroundColor: colors.warning + "18",
              borderColor: colors.warning + "50",
            },
          ]}
        >
          <Text style={[styles.warningText, { color: colors.warning }]}>
            ⚠ 切勿截图或将助记词分享给任何人。一旦丢失无法恢复！
          </Text>
        </View>

        <View style={styles.mnemonicGrid}>
          {mnemonic.map((word, i) => (
            <View
              key={i}
              style={[
                styles.wordCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.wordIndex, { color: colors.mutedForeground }]}>
                {i + 1}
              </Text>
              <Text style={[styles.wordText, { color: colors.foreground }]}>
                {word}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            paddingBottom: bottomPad + 16,
          },
        ]}
      >
        <Pressable
          onPress={() => setConfirmed(!confirmed)}
          style={styles.checkRow}
        >
          <View
            style={[
              styles.checkbox,
              {
                borderColor: confirmed ? colors.primary : colors.border,
                backgroundColor: confirmed ? colors.primary : "transparent",
              },
            ]}
          >
            {confirmed && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={[styles.checkLabel, { color: colors.foreground }]}>
            我已将助记词抄写在安全的地方
          </Text>
        </Pressable>

        <Pressable
          onPress={handleContinue}
          style={({ pressed }) => [
            styles.continueBtn,
            {
              backgroundColor: confirmed ? colors.primary : colors.muted,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <Text
            style={[
              styles.continueBtnText,
              { color: confirmed ? "#fff" : colors.mutedForeground },
            ]}
          >
            进入钱包
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
  },
  scroll: {
    paddingHorizontal: 24,
    gap: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
  },
  warningBox: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  warningText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    lineHeight: 20,
  },
  mnemonicGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  wordCard: {
    width: "30%",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  wordIndex: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    minWidth: 16,
  },
  wordText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    gap: 14,
  },
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  checkmark: {
    color: "#fff",
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },
  checkLabel: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  continueBtn: {
    height: 54,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  continueBtnText: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
  },
});
