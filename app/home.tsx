import { CardPurchase } from "@/components/CardPurchase";
import { supabase } from "@/lib/supabase";
import { useSessionStore } from "@/store/session";

import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { Button, FAB, Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { session, setSession } = useSessionStore();
  const [loading, setLoading] = useState(false);

  const [list, setList] = useState([]);

  const getAllPurchases = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("purchases")
        .select(
          `
          id,
          total_itens,
          total_cost,
          markets(
            id,
            name
          ),
          created_at
        `
        )
        .eq("user_id", session.user.id)
        .throwOnError();

      setList(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    supabase.auth
      .signOut()
      .then(() => {
        setSession(undefined);
        router.replace("/");
      })
      .catch((err) => {
        console.log("signout", err);
      });
  };

  useEffect(() => {
    getAllPurchases();
  }, []);

  return (
    <SafeAreaView
      style={{
        ...styles.container,
        backgroundColor: theme.colors.background,
      }}
    >
      <View style={styles.header}>
        <Text
          variant="headlineMedium"
          style={{
            color: theme.colors.onBackground,
          }}
        >
          Compras
        </Text>
        <Button
          onPress={handleLogout}
          labelStyle={{
            textDecorationLine: "underline",
          }}
        >
          Sair
        </Button>
      </View>
      <FlatList
        style={styles.subcontainer}
        data={list}
        keyExtractor={(item) => `${item.id}`}
        onRefresh={() => getAllPurchases()}
        refreshing={loading}
        renderItem={({ item }) => (
          <CardPurchase
            id={item.id}
            title={item.markets.name}
            totalItens={item.total_itens}
            totalCost={item.total_cost}
            date={item.created_at}
          />
        )}
      />

      <FAB
        icon="plus"
        style={styles.floatButton}
        variant="secondary"
        onPress={() => {
          router.navigate("/new");
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  floatButton: {
    position: "absolute",
    margin: 16,
    right: 10,
    bottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  card: {
    marginBottom: 10,
    padding: 10,
    borderRadius: 10,
    shadowOffset: {
      width: 0.5,
      height: 0.1,
    },
    shadowOpacity: 0.6,
  },
  subcontainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
});
