import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Stack } from "expo-router";
import { PaperProvider } from "react-native-paper";
import ToastContainer from "toastify-react-native";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function RootLayout() {
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      console.log(event);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider>
        <ToastContainer />
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="index" options={{ title: "Login" }} />
          <Stack.Screen name="home" options={{ title: "Home" }} />
          <Stack.Screen
            name="detail/[id]"
            options={{
              title: "Detalhes",
            }}
          />
          <Stack.Screen
            name="new"
            options={{
              title: "Nova compra",
            }}
          />
        </Stack>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}
