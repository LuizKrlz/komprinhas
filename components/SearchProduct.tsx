import useDebounce from "@/hooks/useDebounce";
import { supabase } from "@/lib/supabase";
import { startTransition, useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import {
  Button,
  HelperText,
  Icon,
  Searchbar,
  Text,
  useTheme,
} from "react-native-paper";

export function SearchProduct({ userId, onSelect }) {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState<string>("");
  const [options, setOptions] = useState<{ id: number; name: string }[]>([]);

  const getAllProducts = async () => {
    setLoading(true);
    try {
      const query = supabase.from("products").select();

      if (search) {
        query.like("name", `%${search}%`);
      }

      const { data } = await query.eq("user_id", userId).throwOnError();

      setOptions(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async () => {
    if (!search) return;

    try {
      const { data } = await supabase
        .from("products")
        .insert({
          name: search,
          user_id: userId,
        })
        .select()
        .single()
        .throwOnError();

      onSelect(data);

      startTransition(() => {
        setSearch("");
        getAllProducts();
      });
    } catch (err) {
      console.log(err);
    }
  };

  useDebounce(
    () => {
      getAllProducts();
    },
    500,
    [search]
  );

  const handleSearch = (text: string) => {
    setSearch(text);
  };

  useEffect(() => {
    getAllProducts();
  }, []);

  return (
    <>
      <Searchbar
        mode="view"
        placeholder="Buscar produto"
        onChangeText={handleSearch}
        value={search}
        loading={loading}
        onClearIconPress={() => {
          setOptions([]);
        }}
      />

      {search && search.length && options.length == 0 && !loading && (
        <View
          style={{
            padding: 10,
          }}
        >
          <Text variant="titleSmall">Não há produtos encontrados</Text>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <Text variant="bodyMedium">Deseja adicionar?</Text>
            <Text
              variant="bodyMedium"
              style={{ fontWeight: 700, color: theme.colors.tertiary }}
            >
              {search}
            </Text>
          </View>
          <Button onPress={handleAddItem}>Adicionar </Button>
        </View>
      )}

      <FlatList
        style={{
          marginTop: 20,
        }}
        data={options}
        keyExtractor={(item) => `${item.id}`}
        renderItem={({ item }) => (
          <Pressable
            style={{
              ...styles.item,
              backgroundColor: theme.colors.surfaceVariant,
            }}
            onPress={() => {
              onSelect(item);
            }}
          >
            <Text variant="titleMedium">{item.name}</Text>
            <Icon source="gesture-tap" size={20} />
          </Pressable>
        )}
      />

      {loading && <HelperText type="info">Buscando...</HelperText>}
    </>
  );
}

const styles = StyleSheet.create({
  floatContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 65,
    borderRadius: 10,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    marginBottom: 10,
    height: 50,
  },
});
