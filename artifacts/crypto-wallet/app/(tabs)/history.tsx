import React from "react";
import {
  FlatList,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useWallet } from "@/context/WalletContext";
import { Transaction } from "@/context/WalletContext";

function formatDate(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString("zh-CN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function TxItem({
  tx,
  address,
  onPress,
}: {
  tx: Transaction;
  address: string | null;
  onPress: () => void;
}) {
  const colors = useColors();
  const isSend = tx.type === "send" || tx.from?.toLowerCase() === address?.toLowerCase();
  const statusColor =
    tx.status === "confirmed"
      ? colors.success
      : tx.status === "failed"
      ? colors.destructive
      : colors.warning;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.txItem,
        {
          backgroundColor: pressed ? colors.secondary : colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      <View
        style={[
          styles.txIcon,
          {
            backgroundColor: isSend
              ? colors.destructive + "20"
              : colors.success + "20",
          },
        ]}
      >
        <Text
          style={[
            styles.txArrow,
            { color: isSend ? colors.destructive : colors.success },
          ]}
        >
          {isSend ? "↑" : "↓"}
        </Text>
      </View>

      <View style={styles.txInfo}>
        <Text style={[styles.txType, { color: colors.foreground }]}>
          {isSend ? "发送" : "接收"}
        </Text>
        <Text style={[styles.txAddr, { color: colors.mutedForeground }]}>
          {isSend
            ? `至 ${formatAddress(tx.to)}`
            : `来自 ${formatAddress(tx.from)}`}
        </Text>
        <Text style={[styles.txDate, { color: colors.mutedForeground }]}>
          {formatDate(tx.timestamp)}
        </Text>
      </View>

      <View style={styles.txRight}>
        <Text
          style={[
            styles.txAmount,
            { color: isSend ? colors.destructive : colors.success },
          ]}
        >
          {isSend ? "-" : "+"}
          {parseFloat(tx.amount).toFixed(4)} ETH
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + "20" }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {tx.status === "confirmed"
              ? "已确认"
              : tx.status === "failed"
              ? "失败"
              : "待确认"}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { transactions, address, network } = useWallet();

  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const openExplorer = (hash: string) => {
    const url = `${network.explorer}/tx/${hash}`;
    Linking.openURL(url).catch(() => {});
  };

  if (transactions.length === 0) {
    return (
      <View
        style={[
          styles.empty,
          { backgroundColor: colors.background, paddingBottom: bottomPad + 84 },
        ]}
      >
        <View style={[styles.emptyIcon, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={styles.emptyIconText}>⏱</Text>
        </View>
        <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
          暂无交易记录
        </Text>
        <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
          你的转账记录将在这里显示
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={transactions}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TxItem
          tx={item}
          address={address}
          onPress={() => openExplorer(item.hash)}
        />
      )}
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.list,
        { paddingBottom: bottomPad + 100 },
      ]}
      showsVerticalScrollIndicator={false}
      ItemSeparatorComponent={() => (
        <View style={{ height: 10 }} />
      )}
      scrollEnabled={transactions.length > 0}
    />
  );
}

const styles = StyleSheet.create({
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  emptyIconText: {
    fontSize: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  txItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  txIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  txArrow: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
  txInfo: {
    flex: 1,
    gap: 2,
  },
  txType: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  txAddr: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  txDate: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  txRight: {
    alignItems: "flex-end",
    gap: 6,
  },
  txAmount: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
});
