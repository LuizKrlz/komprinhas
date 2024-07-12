import { useRouter } from "expo-router";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { StyleSheet, View, Pressable } from "react-native";
import {
  Button,
  HelperText,
  IconButton,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import BottomSheet, {
  BottomSheetView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import { useCallback, useRef } from "react";
import { useSessionStore } from "@/store/session";
import { SearchMarket } from "@/components/SearchMarket";
import { SearchProduct } from "@/components/SearchProduct";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { formatToReal } from "@/utils/formatters";
import { supabase } from "@/lib/supabase";
import { Toast } from "toastify-react-native";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  market: z.object(
    {
      id: z.number(),
      name: z.string(),
    },
    {
      required_error: "Selecione um mercado",
    }
  ),
  products: z
    .array(
      z.object({
        id: z.number(),
        product: z.object({
          id: z.number(),
          name: z.string(),
        }),
        price_day: z.string(),
      })
    )
    .min(1, "Adicione pelo menos um produto"),
});

type FormData = z.infer<typeof schema>;

export default function NewPurchase() {
  const { session } = useSessionStore();
  const theme = useTheme();
  const router = useRouter();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const bottomSheetProductRef = useRef<BottomSheet>(null);

  const { control, setValue, watch, handleSubmit, reset, formState } =
    useForm<FormData>({
      resolver: zodResolver(schema),
    });

  const { prepend, fields, remove } = useFieldArray({
    control,
    name: "products",
  });

  const products = watch("products");

  const total = products?.reduce(
    (prev, current) => prev + parseFloat(current.price_day.replace(",", ".")),
    0
  );

  // renders
  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop
        {...props}
        // disappearsOnIndex={0}
        appearsOnIndex={1}
      />
    ),
    []
  );

  const onSubmit = handleSubmit(async (values) => {
    const totalItens = values.products.length;
    const totalPrice = values.products.reduce(
      (current, next) => current + parseFloat(next.price_day.replace(",", ".")),
      0
    );

    try {
      const { data } = await supabase
        .from("purchases")
        .insert({
          user_id: session?.user?.id,
          total_itens: totalItens,
          total_cost: totalPrice,
          market_id: values.market.id,
        })
        .select()
        .single()
        .throwOnError();

      const allProducts = values.products.flatMap((item) => ({
        product_id: item.product.id,
        purchase_id: data.id,
        price_day: item.price_day.replace(",", "."),
      }));

      await supabase
        .from("purchase_product")
        .insert(allProducts)
        .throwOnError();

      reset();
      router.replace("/home");
      Toast.success("Compra adicionada com sucesso");
    } catch (err) {
      console.error(err);
    }
  });

  console.log(formState.errors);

  return (
    <>
      <SafeAreaView
        edges={["top"]}
        style={{ flex: 1, backgroundColor: theme.colors.background }}
      >
        <View style={{ flex: 1, paddingHorizontal: 16 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <IconButton
              icon="chevron-left"
              mode="contained"
              size={25}
              onPress={() => router.back()}
            />
            <Text variant="titleMedium">Nova compra</Text>
          </View>
          <Controller
            control={control}
            name="market"
            render={({ field, fieldState: { error, invalid } }) => (
              <View>
                <TextInput
                  label="Mercado"
                  value={field.value?.name}
                  error={invalid}
                  readOnly
                  style={{
                    zIndex: 1,
                  }}
                />
                <Pressable
                  style={{
                    zIndex: 99,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    top: 0,
                    position: "absolute",
                  }}
                  onPress={() => bottomSheetRef.current?.expand()}
                ></Pressable>
                {error?.message && (
                  <HelperText type={"error"}>{error?.message}</HelperText>
                )}
              </View>
            )}
          />

          <View
            style={{
              flexDirection: "row",
              paddingTop: 16,
              alignItems: "center",
              justifyContent: "space-between",
              // marginBottom: 16,
            }}
          >
            <Text variant="titleMedium">Produtos</Text>
            <IconButton
              icon="plus"
              mode="contained-tonal"
              size={15}
              onPress={() => bottomSheetProductRef.current?.expand()}
            />
          </View>
          {"products" in formState.errors && (
            <HelperText type="error">
              {formState.errors.products?.message}
            </HelperText>
          )}
          <ScrollView style={{ flex: 1, marginTop: 16 }}>
            {fields.map((item, index) => (
              <Controller
                key={`product_item_${item.id}`}
                control={control}
                name={`products.${index}.price_day`}
                render={({ field }) => (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginVertical: 5,
                    }}
                  >
                    <Text variant="titleMedium" style={{ flex: 1 }}>
                      {item?.product?.name}
                    </Text>
                    <TextInput
                      value={field.value}
                      onChangeText={field.onChange}
                      style={{ flex: 1, maxWidth: 120 }}
                      inputMode="decimal"
                      label="Preço do dia"
                    />
                    <IconButton
                      icon="minus"
                      mode="contained"
                      onPress={() => remove(index)}
                      size={15}
                    />
                  </View>
                )}
              />
            ))}
          </ScrollView>
        </View>
        <View
          style={{
            ...styles.footer,
            backgroundColor: theme.colors.secondaryContainer,
          }}
        >
          <View style={styles.row}>
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
              {formatToReal(total)}
            </Text>
          </View>
          <Button onPress={onSubmit} mode="contained">
            Salvar
          </Button>
        </View>
      </SafeAreaView>
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={["50%", "90%"]}
        backdropComponent={renderBackdrop}
      >
        <BottomSheetView
          style={{
            flex: 1,
            padding: 16,
            backgroundColor: theme.colors.background,
          }}
        >
          <SearchMarket
            userId={session?.user?.id}
            onSelect={(itemSelected) => {
              setValue("market", itemSelected);
              bottomSheetRef.current?.forceClose();
            }}
          />
        </BottomSheetView>
      </BottomSheet>

      <BottomSheet
        ref={bottomSheetProductRef}
        index={-1}
        snapPoints={["50%", "90%"]}
        backdropComponent={renderBackdrop}
      >
        <BottomSheetView
          style={{
            flex: 1,
            padding: 16,
            backgroundColor: theme.colors.background,
          }}
        >
          <SearchProduct
            userId={session?.user?.id}
            onSelect={(itemSelected) => {
              prepend({
                id: itemSelected.id,
                product: itemSelected,
                price_day: "0",
              });
              bottomSheetProductRef.current?.forceClose();
            }}
          />
        </BottomSheetView>
      </BottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 50,
    paddingTop: 10,
    borderTopEndRadius: 24,
    borderTopStartRadius: 24,
  },
});
