import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useWallet } from "@/context/WalletContext";

type ImportMode = "mnemonic" | "privatekey";

export default function ImportWalletScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { importFromMnemonic, importFromPrivateKey } = useWallet();

  const [mode, setMode] = useState<ImportMode>("mnemonic");
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const handleImport = async () => {
    if (!input.trim()) {
      Alert.alert("请输入", mode === "mnemonic" ? "请输入助记词" : "请输入私钥");
      return;
    }

    setIsLoading(true);
    try {
      if (mode === "mnemonic") {
        const words = input.trim().split(/\s+/);
        if (words.length !== 12 && words.length !== 24) {
          Alert.alert("格式错误", "助记词应为 12 或 24 个单词");
          return;
        }
        await importFromMnemonic(words.join(" "));
      } else {
        const pk = input.trim();
        if (!pk.match(/^(0x)?[0-9a-fA-F]{64}$/)) {
          Alert.alert("格式错误", "请输入有效的私钥（64位十六进制数）");
          return;
        }
        await importFromPrivateKey(pk.startsWith("0x") ? pk : "0x" + pk);
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(tabs)");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "导入失败";
      Alert.alert("导入失败", msg.includes("invalid") ? "输入格式无效，请检查后重试" : msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: topPad + 20, paddingBottom: bottomPad + 100 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: colors.foreground }]}>
          导入钱包
        </Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          通过助记词或私钥恢复你的钱包
        </Text>

        <View
          style={[styles.modeToggle, { backgroundColor: colors.secondary, borderRadius: 12 }]}
        >
          {(["mnemonic", "privatekey"] as ImportMode[]).map((m) => (
            <Pressable
              key={m}
              onPress={() => {
                setMode(m);
                setInput("");
              }}
              style={({ pressed }) => [
                styles.modeBtn,
                {
                  backgroundColor:
                    mode === m ? colors.primary : "transparent",
                  opacity: pressed ? 0.85 : 1,
                  borderRadius: 10,
                },
              ]}
            >
              <Text
                style={[
                  styles.modeBtnText,
                  {
                    color: mode === m ? "#fff" : colors.mutedForeground,
                    fontFamily: mode === m ? "Inter_600SemiBold" : "Inter_400Regular",
                  },
                ]}
              >
                {m === "mnemonic" ? "助记词" : "私钥"}
              </Text>
            </Pressable>
          ))}
        </View>

        {mode === "mnemonic" ? (
          <View>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>
              输入 12 或 24 个助记词，单词之间用空格分隔
            </Text>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="word1 word2 word3 ..."
              placeholderTextColor={colors.mutedForeground}
              multiline
              numberOfLines={4}
              autoCapitalize="none"
              autoCorrect={false}
              style={[
                styles.textArea,
                {
                  backgroundColor: colors.input,
                  borderColor: colors.border,
                  color: colors.foreground,
                },
              ]}
            />
          </View>
        ) : (
          <View>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>
              输入你的以太坊私钥（64位十六进制，可带或不带 0x 前缀）
            </Text>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="0x..."
              placeholderTextColor={colors.mutedForeground}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
              style={[
                styles.textInput,
                {
                  backgroundColor: colors.input,
                  borderColor: colors.border,
                  color: colors.foreground,
                },
              ]}
            />
          </View>
        )}

        <View
          style={[
            styles.securityNote,
            {
              backgroundColor: colors.primary + "15",
              borderColor: colors.primary + "40",
            },
          ]}
        >
          <Text style={[styles.securityNoteText, { color: colors.mutedForeground }]}>
            🔐 你的密钥仅保存在本设备上，不会上传到任何服务器
          </Text>
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
          onPress={handleImport}
          disabled={isLoading}
          style={({ pressed }) => [
            styles.importBtn,
            {
              backgroundColor: colors.primary,
              opacity: pressed || isLoading ? 0.75 : 1,
            },
          ]}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.importBtnText}>导入钱包</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  modeToggle: {
    flexDirection: "row",
    padding: 4,
    gap: 4,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
  },
  modeBtnText: {
    fontSize: 15,
  },
  label: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginBottom: 10,
    lineHeight: 20,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    minHeight: 120,
    textAlignVertical: "top",
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    height: 56,
  },
  securityNote: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  securityNoteText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  importBtn: {
    height: 54,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  importBtnText: {
    color: "#fff",
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
  },
});
