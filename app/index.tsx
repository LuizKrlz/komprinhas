import { useFocusEffect, useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, View } from "react-native";
import {
  Button,
  HelperText,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/lib/supabase";
import { useSessionStore } from "@/store/session";
import {
  startTransition,
  useCallback,
  useEffect,
  useLayoutEffect,
} from "react";

const schema = z.object({
  email: z.string().email({
    message: "E-mail inválid",
  }),
  password: z.string().min(1, "Campo obrigatório"),
});

export default function LoginScreen() {
  const { session, setSession } = useSessionStore();
  const theme = useTheme();
  const router = useRouter();

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: zodResolver(schema),
  });

  const handleLogin = handleSubmit(async (values) => {
    supabase.auth
      .signInWithPassword(values)
      .then(({ data: { session }, error }) => {
        if (error?.status === 400) {
          console.log(error.message);
        } else {
          setSession(session);
          reset();
          router.replace("/home");
        }
      })
      .catch((err) => {
        console.log(err);
      });
  });

  useFocusEffect(
    useCallback(() => {
      if (session) {
        router.replace("/home");
      }
    }, [session])
  );

  return (
    <SafeAreaView
      style={{ ...styles.safe, backgroundColor: theme.colors.background }}
      edges={["top", "bottom"]}
    >
      <View style={styles.container}>
        <Text
          variant="displayMedium"
          style={{
            fontWeight: 700,
            color: theme.colors.primary,
          }}
        >
          Komprinhas
        </Text>
        <Text
          variant="titleMedium"
          style={{
            color: theme.colors.secondary,
          }}
        >
          Controle todos os seus gastos na palma de sua mão e acompanhe de perto
          suas finanças.
        </Text>

        <Controller
          control={control}
          name="email"
          render={({
            field: { value, onChange },
            fieldState: { invalid, error },
          }) => (
            <View>
              <TextInput
                onChangeText={onChange}
                value={value}
                right={<TextInput.Icon icon="email-outline" />}
                label="E-mail"
                placeholder="Digite seu e-mail"
                inputMode="email"
                autoCapitalize="none"
                error={invalid}
              />
              {error?.message && (
                <HelperText type="error">{error?.message}</HelperText>
              )}
            </View>
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({
            field: { onChange, value },
            fieldState: { error, invalid },
          }) => (
            <View>
              <TextInput
                onChangeText={onChange}
                value={value}
                right={<TextInput.Icon icon="key-outline" />}
                label="Senha"
                placeholder="Digite sua senha"
                secureTextEntry
                error={invalid}
              />
              {error?.message && (
                <HelperText type="error">{error?.message}</HelperText>
              )}
            </View>
          )}
        />

        <Button
          mode="contained"
          onPress={handleLogin}
          style={{ marginTop: 16 }}
        >
          Entrar
        </Button>
        <Button>Criar uma conta</Button>
      </View>
      <Button labelStyle={styles.linkRecovery}>Recuperar conta?</Button>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    gap: 16,
    justifyContent: "center",
  },
  linkRecovery: {
    fontWeight: 700,
    textDecorationStyle: "solid",
    textDecorationLine: "underline",
  },
});
