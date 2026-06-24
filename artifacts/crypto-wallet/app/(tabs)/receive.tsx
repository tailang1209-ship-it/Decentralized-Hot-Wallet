import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useWallet } from "@/context/WalletContext";

export default function ReceiveScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { address, network, copyToClipboard } = useWallet();

  const [copied, setCopied] = useState(false);

  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const handleCopy = async () => {
    if (!address) return;
    await copyToClipboard(address);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const shortAddress = address
    ? `${address.slice(0, 10)}...${address.slice(-8)}`
    : "";

  if (!address) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.noWalletText, { color: colors.mutedForeground }]}>
          钱包未初始化
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.scroll,
        { paddingBottom: bottomPad + 100 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.networkBadge, { backgroundColor: colors.primary + "20" }]}>
          <View style={[styles.networkDot, { backgroundColor: colors.primary }]} />
          <Text style={[styles.networkName, { color: colors.primary }]}>
            {network.name}
          </Text>
        </View>

        <View style={[styles.qrContainer, { backgroundColor: "#fff", borderRadius: 20 }]}>
          <QRCode
            value={address}
            size={200}
            color="#0A0B14"
            backgroundColor="#ffffff"
          />
        </View>

        <Text style={[styles.scanLabel, { color: colors.mutedForeground }]}>
          扫码或复制地址以接收 {network.symbol}
        </Text>

        <View style={[styles.addressBox, { backgroundColor: colors.secondary, borderRadius: 14 }]}>
          <Text
            style={[styles.addressFull, { color: colors.foreground }]}
            selectable
          >
            {address}
          </Text>
        </View>

        <Pressable
          onPress={handleCopy}
          style={({ pressed }) => [
            styles.copyBtn,
            {
              backgroundColor: copied ? colors.success : colors.primary,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <Text style={styles.copyBtnText}>
            {copied ? "已复制 ✓" : "复制地址"}
          </Text>
        </Pressable>
      </View>

      <View style={[styles.warningCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.warningTitle, { color: colors.foreground }]}>
          注意事项
        </Text>
        {[
          `仅接收 ${network.symbol} 及 ERC-20 代币到此地址`,
          "发送其他网络的资产可能导致永久丢失",
          "每笔收款均有链上交易记录",
        ].map((tip, i) => (
          <View key={i} style={styles.tipRow}>
            <View style={[styles.tipDot, { backgroundColor: colors.primary }]} />
            <Text style={[styles.tipText, { color: colors.mutedForeground }]}>
              {tip}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  noWalletText: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 16,
    alignItems: "center",
  },
  card: {
    width: "100%",
    borderRadius: 24,
    borderWidth: 1,
    padding: 28,
    alignItems: "center",
    gap: 18,
  },
  networkBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  networkDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  networkName: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  qrContainer: {
    padding: 20,
  },
  scanLabel: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  addressBox: {
    width: "100%",
    padding: 14,
  },
  addressFull: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
    letterSpacing: 0.5,
    textAlign: "center",
  },
  copyBtn: {
    height: 50,
    width: "100%",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  copyBtnText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  warningCard: {
    width: "100%",
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    gap: 12,
  },
  warningTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 4,
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  tipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
});
