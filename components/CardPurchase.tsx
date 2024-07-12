import { formatDate, formatToReal } from "@/utils/formatters";
import { Link, useRouter } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";

export function CardPurchase({ id, title, totalItens, totalCost, date }) {
  const theme = useTheme();
  const router = useRouter();

  const color = theme.colors.onPrimaryContainer;

  return (
    <Pressable onPress={() => router.navigate(`/detail/${id}`)}>
      <View
        style={{
          ...styles.card,
          backgroundColor: theme.colors.surfaceVariant,
          borderWidth: 1,
          borderColor: theme.colors.outlineVariant,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text variant="titleLarge" style={{ color, fontWeight: 700 }}>
            {title}
          </Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 10,
          }}
        >
          <Text variant="bodyMedium" style={{ color }}>
            Total Itens
          </Text>
          <Text style={{ color, fontWeight: 600 }} variant="bodyMedium">
            {totalItens}
          </Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 10,
          }}
        >
          <Text variant="bodyMedium" style={{ color }}>
            Valor total
          </Text>
          <Text variant="bodyMedium" style={{ color, fontWeight: 600 }}>
            {formatToReal(totalCost)}
          </Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-end",
          }}
        >
          <Text variant="bodyMedium" style={{ color, fontWeight: 600 }}>
            {formatDate(date)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  subcontainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
});
