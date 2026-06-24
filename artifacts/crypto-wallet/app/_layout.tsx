import "react-native-get-random-values";
import "@ethersproject/shims";

import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { WalletProvider } from "@/context/WalletContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen
        name="create-wallet"
        options={{
          headerShown: true,
          headerTitle: "创建钱包",
          headerBackTitle: "返回",
          headerStyle: { backgroundColor: "#0A0B14" },
          headerTintColor: "#7B6EF6",
          headerTitleStyle: { color: "#FFFFFF", fontFamily: "Inter_600SemiBold" },
        }}
      />
      <Stack.Screen
        name="import-wallet"
        options={{
          headerShown: true,
          headerTitle: "导入钱包",
          headerBackTitle: "返回",
          headerStyle: { backgroundColor: "#0A0B14" },
          headerTintColor: "#7B6EF6",
          headerTitleStyle: { color: "#FFFFFF", fontFamily: "Inter_600SemiBold" },
        }}
      />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <WalletProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <KeyboardProvider>
                <RootLayoutNav />
              </KeyboardProvider>
            </GestureHandlerRootView>
          </WalletProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
