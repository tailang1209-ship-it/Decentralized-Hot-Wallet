import { BlurView } from "expo-blur";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { SymbolView } from "expo-symbols";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, View, useColorScheme } from "react-native";
import { useColors } from "@/hooks/useColors";

function NativeTabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: "wallet.bifold", selected: "wallet.bifold.fill" }} />
        <Label>钱包</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="send">
        <Icon sf={{ default: "arrow.up.circle", selected: "arrow.up.circle.fill" }} />
        <Label>发送</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="receive">
        <Icon sf={{ default: "arrow.down.circle", selected: "arrow.down.circle.fill" }} />
        <Label>接收</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="history">
        <Icon sf={{ default: "clock", selected: "clock.fill" }} />
        <Label>记录</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <Icon sf={{ default: "gearshape", selected: "gearshape.fill" }} />
        <Label>设置</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function ClassicTabLayout() {
  const colors = useColors();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  const tabScreenOptions = {
    tabBarActiveTintColor: colors.primary,
    tabBarInactiveTintColor: colors.mutedForeground,
    headerShown: true,
    headerStyle: { backgroundColor: colors.background },
    headerTintColor: colors.primary,
    headerTitleStyle: {
      color: colors.foreground,
      fontFamily: "Inter_600SemiBold" as const,
      fontSize: 17,
    },
    tabBarStyle: {
      position: "absolute" as const,
      backgroundColor: isIOS ? "transparent" : colors.background,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      elevation: 0,
      ...(isWeb ? { height: 84 } : {}),
    },
    tabBarBackground: () =>
      isIOS ? (
        <BlurView
          intensity={80}
          tint={isDark ? "dark" : "dark"}
          style={StyleSheet.absoluteFill}
        />
      ) : isWeb ? (
        <View
          style={[StyleSheet.absoluteFill, { backgroundColor: colors.background }]}
        />
      ) : null,
    tabBarLabelStyle: {
      fontFamily: "Inter_500Medium" as const,
      fontSize: 10,
    },
  };

  return (
    <Tabs screenOptions={tabScreenOptions}>
      <Tabs.Screen
        name="index"
        options={{
          title: "钱包",
          headerTitle: "CryptoVault",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="wallet.bifold" tintColor={color} size={22} />
            ) : (
              <Feather name="credit-card" size={21} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="send"
        options={{
          title: "发送",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="arrow.up.circle" tintColor={color} size={22} />
            ) : (
              <Feather name="arrow-up-circle" size={21} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="receive"
        options={{
          title: "接收",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="arrow.down.circle" tintColor={color} size={22} />
            ) : (
              <Feather name="arrow-down-circle" size={21} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "记录",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="clock" tintColor={color} size={22} />
            ) : (
              <Feather name="clock" size={21} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "设置",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="gearshape" tintColor={color} size={22} />
            ) : (
              <Feather name="settings" size={21} color={color} />
            ),
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  if (isLiquidGlassAvailable()) {
    return <NativeTabLayout />;
  }
  return <ClassicTabLayout />;
}
