import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
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

export default function SendScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { address, balance, sendEth, network } = useWallet();

  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [gasEstimate, setGasEstimate] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [addressError, setAddressError] = useState("");
  const [amountError, setAmountError] = useState("");

  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  useEffect(() => {
    if (toAddress.length > 10 && amount) {
      estimateGas();
    }
  }, [toAddress, amount, network.rpc]);

  const estimateGas = async () => {
    try {
      const { ethers } = await import("ethers");
      const provider = new ethers.providers.JsonRpcProvider(network.rpc);
      const gasPrice = await provider.getGasPrice();
      const gasLimit = 21000;
      const fee = ethers.utils.formatEther(gasPrice.mul(gasLimit));
      setGasEstimate(parseFloat(fee).toFixed(8));
    } catch {
      setGasEstimate(null);
    }
  };

  const validateAndSend = async () => {
    setAddressError("");
    setAmountError("");
    let valid = true;

    if (!toAddress.trim()) {
      setAddressError("请输入收款地址");
      valid = false;
    } else {
      try {
        const { ethers } = await import("ethers");
        if (!ethers.utils.isAddress(toAddress.trim())) {
          setAddressError("无效的以太坊地址");
          valid = false;
        }
      } catch {
        setAddressError("无效的地址格式");
        valid = false;
      }
    }

    const amtNum = parseFloat(amount);
    if (!amount || isNaN(amtNum) || amtNum <= 0) {
      setAmountError("请输入有效金额");
      valid = false;
    } else if (balance && amtNum >= parseFloat(balance)) {
      setAmountError("余额不足（需预留矿工费）");
      valid = false;
    }

    if (!valid) return;

    Alert.alert(
      "确认转账",
      `发送 ${amount} ${network.symbol}\n至 ${toAddress.slice(0, 8)}...${toAddress.slice(-6)}\n\n预计矿工费: ${gasEstimate ?? "计算中"} ETH`,
      [
        { text: "取消", style: "cancel" },
        {
          text: "确认发送",
          style: "destructive",
          onPress: executeSend,
        },
      ]
    );
  };

  const executeSend = async () => {
    setIsSending(true);
    try {
      const hash = await sendEth(toAddress.trim(), amount);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTxHash(hash);
      setToAddress("");
      setAmount("");
    } catch (e: unknown) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const msg = e instanceof Error ? e.message : "转账失败";
      Alert.alert("转账失败", msg.includes("insufficient") ? "余额不足" : msg);
    } finally {
      setIsSending(false);
    }
  };

  const setMaxAmount = () => {
    if (!balance) return;
    const max = parseFloat(balance) - 0.001;
    if (max > 0) {
      setAmount(max.toFixed(6));
    }
  };

  if (txHash) {
    return (
      <View
        style={[
          styles.successContainer,
          { backgroundColor: colors.background, paddingBottom: bottomPad + 84 },
        ]}
      >
        <View
          style={[styles.successCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <View
            style={[styles.successIcon, { backgroundColor: colors.success + "20" }]}
          >
            <Text style={styles.successEmoji}>✓</Text>
          </View>
          <Text style={[styles.successTitle, { color: colors.foreground }]}>
            转账已广播
          </Text>
          <Text style={[styles.successSubtitle, { color: colors.mutedForeground }]}>
            交易已提交到网络，等待矿工确认
          </Text>
          <View
            style={[styles.hashBox, { backgroundColor: colors.secondary, borderRadius: 10 }]}
          >
            <Text style={[styles.hashLabel, { color: colors.mutedForeground }]}>
              交易哈希
            </Text>
            <Text style={[styles.hashValue, { color: colors.primary }]} numberOfLines={2}>
              {txHash}
            </Text>
          </View>
          <Pressable
            onPress={() => setTxHash(null)}
            style={({ pressed }) => [
              styles.newTxBtn,
              { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Text style={styles.newTxBtnText}>再次转账</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: bottomPad + 100 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.balanceCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.balanceLabel, { color: colors.mutedForeground }]}>
            可用余额
          </Text>
          <Text style={[styles.balanceValue, { color: colors.foreground }]}>
            {balance ? parseFloat(balance).toFixed(6) : "—"} {network.symbol}
          </Text>
        </View>

        <View style={styles.form}>
          <View>
            <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>
              收款地址
            </Text>
            <TextInput
              value={toAddress}
              onChangeText={(t) => { setToAddress(t); setAddressError(""); }}
              placeholder="0x..."
              placeholderTextColor={colors.mutedForeground}
              autoCapitalize="none"
              autoCorrect={false}
              style={[
                styles.input,
                {
                  backgroundColor: colors.input,
                  borderColor: addressError ? colors.destructive : colors.border,
                  color: colors.foreground,
                },
              ]}
            />
            {!!addressError && (
              <Text style={[styles.errorText, { color: colors.destructive }]}>
                {addressError}
              </Text>
            )}
          </View>

          <View>
            <View style={styles.amountRow}>
              <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>
                金额 ({network.symbol})
              </Text>
              <Pressable onPress={setMaxAmount}>
                <Text style={[styles.maxBtn, { color: colors.primary }]}>全部</Text>
              </Pressable>
            </View>
            <TextInput
              value={amount}
              onChangeText={(t) => { setAmount(t); setAmountError(""); }}
              placeholder="0.0"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="decimal-pad"
              style={[
                styles.input,
                {
                  backgroundColor: colors.input,
                  borderColor: amountError ? colors.destructive : colors.border,
                  color: colors.foreground,
                  fontSize: 20,
                },
              ]}
            />
            {!!amountError && (
              <Text style={[styles.errorText, { color: colors.destructive }]}>
                {amountError}
              </Text>
            )}
          </View>

          {gasEstimate && (
            <View style={[styles.gasRow, { backgroundColor: colors.secondary, borderRadius: 12 }]}>
              <Text style={[styles.gasLabel, { color: colors.mutedForeground }]}>
                预计矿工费
              </Text>
              <Text style={[styles.gasValue, { color: colors.foreground }]}>
                ≈ {gasEstimate} ETH
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            paddingBottom: bottomPad + 84,
          },
        ]}
      >
        <Pressable
          onPress={validateAndSend}
          disabled={isSending}
          style={({ pressed }) => [
            styles.sendBtn,
            { backgroundColor: colors.primary, opacity: pressed || isSending ? 0.75 : 1 },
          ]}
        >
          {isSending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.sendBtnText}>发送 {network.symbol}</Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 20,
  },
  successContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  successCard: {
    width: "100%",
    borderRadius: 24,
    borderWidth: 1,
    padding: 28,
    alignItems: "center",
    gap: 14,
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  successEmoji: {
    fontSize: 28,
    color: "#00CBA8",
  },
  successTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  successSubtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
  },
  hashBox: {
    width: "100%",
    padding: 14,
    gap: 6,
  },
  hashLabel: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  hashValue: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
  newTxBtn: {
    height: 48,
    paddingHorizontal: 32,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  newTxBtnText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  balanceCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
  },
  balanceLabel: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  balanceValue: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    marginTop: 4,
    letterSpacing: -0.5,
  },
  form: {
    gap: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    marginBottom: 8,
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  maxBtn: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    height: 56,
  },
  errorText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 6,
  },
  gasRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
  },
  gasLabel: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  gasValue: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  sendBtn: {
    height: 54,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnText: {
    color: "#fff",
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
  },
});
