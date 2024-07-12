import { IconButton, MD3Colors, Text, useTheme } from "react-native-paper";
import { FlatList, StyleSheet, View } from "react-native";
import {
  useFocusEffect,
  useGlobalSearchParams,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";
import { useCallback, useEffect, useState } from "react";
import { formatDate, formatToReal } from "@/utils/formatters";

export default function PurchaseDetail(props) {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [detail, setDetail] = useState();

  async function getDetail(id) {
    try {
      const { data } = await supabase
        .from("purchases")
        .select(
          `
          id,
          markets(
            id,
            name
          ),
          total_cost,
          total_itens,
          created_at,
          purchase_product(
            products(
              id,
              name
            ),
            price_day
          )
        `
        )
        .eq("id", id)
        .single()
        .throwOnError();

      console.log(id);

      setDetail(data);
    } catch (err) {
      console.log(err);
    }
  }

  useFocusEffect(
    useCallback(() => {
      if (id) {
        getDetail(id);
      }
    }, [id])
  );

  console.log(detail?.purchase_product);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
      }}
      edges={["top"]}
    >
      <View
        style={{
          paddingHorizontal: 16,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <IconButton
          icon="chevron-left"
          mode="contained"
          size={25}
          onPress={() => router.back()}
        />
        <Text variant="titleMedium">Detalhes</Text>
      </View>
      <View style={{ paddingHorizontal: 16 }}>
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            variant="displayMedium"
            style={{
              textTransform: "uppercase",
              fontWeight: 700,
              color: theme.colors.tertiary,
            }}
          >
            {detail?.markets?.name}
          </Text>
          <Text
            variant="bodySmall"
            style={{
              color: theme.colors.secondary,
              marginVertical: 5,
            }}
          >
            Dia{" "}
            {detail?.created_at && formatDate(detail?.created_at, "dd/MM/yyyy")}
          </Text>
        </View>
      </View>
      <FlatList
        style={{
          flex: 1,
        }}
        contentContainerStyle={{
          paddingTop: 10,
          paddingHorizontal: 16,
        }}
        data={detail?.purchase_product ?? []}
        keyExtractor={(item) => `${item?.products?.id}`}
        renderItem={({ item }) => (
          <View
            style={{
              backgroundColor: theme.colors.secondaryContainer,
              ...styles.itemRow,
            }}
          >
            <Text variant="titleSmall">{item.products?.name}</Text>
            <Text variant="titleSmall">{formatToReal(item.price_day)}</Text>
          </View>
        )}
      />
      <View
        style={{
          ...styles.footer,
          backgroundColor: theme.colors.secondaryContainer,
        }}
      >
        <Text
          variant="titleLarge"
          style={{
            color: theme.colors.onSecondaryContainer,
            fontWeight: 500,
          }}
        >
          Custo total
        </Text>
        <Text
          variant="titleLarge"
          style={{
            color: theme.colors.onSecondaryContainer,
            fontWeight: 500,
          }}
        >
          R$ 10.00
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  itemRow: {
    paddingHorizontal: 10,
    paddingVertical: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    borderRadius: 10,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 50,
    paddingTop: 10,
    borderTopEndRadius: 24,
    borderTopStartRadius: 24,
  },
});
