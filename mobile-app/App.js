import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Pressable, SafeAreaView, Text, TextInput, View } from "react-native";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { StatusBar } from "expo-status-bar";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const palette = {
  bg: "#0f172a",
  card: "#1e293b",
  border: "#334155",
  text: "#ffffff",
  muted: "#94a3b8",
  accent: "#4f8cff",
  success: "#22c55e",
  danger: "#ff5d73"
};

const storageKeys = {
  accessToken: "billr_mobile_access_token",
  refreshToken: "billr_mobile_refresh_token",
  user: "billr_mobile_user"
};

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: palette.bg,
    card: palette.card,
    text: palette.text,
    border: palette.border,
    primary: palette.accent
  }
};

const apiBaseUrl = Constants.expoConfig?.extra?.apiBaseUrl || "http://10.0.2.2:4000";

function currency(value) {
  return `Rs ${Number(value || 0).toFixed(2)}`;
}

async function apiRequest(path, options = {}, accessToken) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(options.headers || {})
    }
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message || "Request failed");
  }
  return payload;
}

function SectionCard({ title, subtitle, children }) {
  return (
    <View style={{ backgroundColor: palette.card, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: palette.border, marginBottom: 14 }}>
      <Text style={{ color: palette.muted, fontSize: 12, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>{subtitle}</Text>
      <Text style={{ color: palette.text, fontSize: 18, fontWeight: "700", marginBottom: 12 }}>{title}</Text>
      {children}
    </View>
  );
}

function Metric({ label, value, color = palette.text }) {
  return (
    <View style={{ flex: 1, backgroundColor: palette.card, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: palette.border }}>
      <Text style={{ color: palette.muted, marginBottom: 8 }}>{label}</Text>
      <Text style={{ color, fontSize: 20, fontWeight: "700" }}>{value}</Text>
    </View>
  );
}

function LoginScreen({ onLogin, loading }) {
  const [identifier, setIdentifier] = useState("9999999999");
  const [password, setPassword] = useState("Admin@12345");

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.bg, padding: 20, justifyContent: "center" }}>
      <StatusBar style="light" />
      <Text style={{ color: palette.muted, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 8 }}>Billr Mobile</Text>
      <Text style={{ color: palette.text, fontSize: 28, fontWeight: "800", marginBottom: 20 }}>Cloud billing for field teams</Text>
      <View style={{ backgroundColor: palette.card, borderRadius: 22, padding: 18, borderWidth: 1, borderColor: palette.border }}>
        <TextInput value={identifier} onChangeText={setIdentifier} placeholder="Phone or Email" placeholderTextColor={palette.muted} style={inputStyle} autoCapitalize="none" />
        <TextInput value={password} onChangeText={setPassword} placeholder="Password" placeholderTextColor={palette.muted} style={inputStyle} secureTextEntry />
        <Pressable
          onPress={() => onLogin({ identifier, password, deviceName: "Billr Mobile" })}
          style={{ backgroundColor: palette.accent, borderRadius: 16, padding: 16, alignItems: "center", marginTop: 8 }}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontWeight: "700" }}>Sign In</Text>}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function SalesScreen({ session }) {
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await apiRequest("/api/invoices?limit=20", {}, session.accessToken);
        if (active) {
          setInvoices(data.data || []);
        }
      } catch (error) {
        Alert.alert("Sales", error.message);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [session.accessToken]);

  const totals = useMemo(() => {
    const total = invoices.reduce((sum, invoice) => sum + Number(invoice.total || 0), 0);
    const pending = invoices.filter((invoice) => invoice.status === "PENDING").reduce((sum, invoice) => sum + Number(invoice.total || 0), 0);
    return { total, pending };
  }, [invoices]);

  return (
    <SafeAreaView style={screenStyle}>
      <View style={{ flexDirection: "row", gap: 12, marginBottom: 14 }}>
        <Metric label="Total Amount" value={currency(totals.total)} />
        <Metric label="Pending" value={currency(totals.pending)} color={palette.danger} />
      </View>
      <SectionCard title="Recent Invoices" subtitle="Sales">
        {loading ? (
          <ActivityIndicator color={palette.accent} />
        ) : (
          <FlatList
            data={invoices}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <View style={listRowStyle}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: palette.text, fontWeight: "700" }}>{item.customer?.name || "-"}</Text>
                  <Text style={{ color: palette.muted, marginTop: 4 }}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={{ color: palette.text, fontWeight: "700" }}>{currency(item.total)}</Text>
                  <Text style={{ color: item.status === "PENDING" ? palette.danger : palette.success, marginTop: 4 }}>{item.status}</Text>
                </View>
              </View>
            )}
          />
        )}
      </SectionCard>
    </SafeAreaView>
  );
}

function ProductsScreen({ session }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    apiRequest("/api/products", {}, session.accessToken)
      .then((data) => setProducts(data.data || []))
      .catch((error) => Alert.alert("Products", error.message));
  }, [session.accessToken]);

  return (
    <SafeAreaView style={screenStyle}>
      <SectionCard title="Inventory" subtitle="Products">
        <FlatList
          data={products}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <View style={listRowStyle}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: palette.text, fontWeight: "700" }}>{item.name || `Product #${item.id}`}</Text>
                <Text style={{ color: palette.muted, marginTop: 4 }}>Stock: {item.stock}</Text>
              </View>
              <Text style={{ color: palette.text, fontWeight: "700" }}>{currency(item.price)}</Text>
            </View>
          )}
        />
      </SectionCard>
    </SafeAreaView>
  );
}

function CustomersScreen({ session }) {
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    apiRequest("/api/customers", {}, session.accessToken)
      .then((data) => setCustomers(data.data || []))
      .catch((error) => Alert.alert("Customers", error.message));
  }, [session.accessToken]);

  return (
    <SafeAreaView style={screenStyle}>
      <SectionCard title="Ledger" subtitle="Customers">
        <FlatList
          data={customers}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <View style={listRowStyle}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: palette.text, fontWeight: "700" }}>{item.name}</Text>
                <Text style={{ color: palette.muted, marginTop: 4 }}>{item.phone || item.address || "No details"}</Text>
              </View>
              <Text style={{ color: Number(item.balance) > 0 ? palette.danger : palette.success, fontWeight: "700" }}>
                {currency(item.balance)}
              </Text>
            </View>
          )}
        />
      </SectionCard>
    </SafeAreaView>
  );
}

function SettingsScreen({ session, onLogout }) {
  return (
    <SafeAreaView style={screenStyle}>
      <SectionCard title="Account" subtitle="Session">
        <Text style={{ color: palette.text, fontSize: 16, fontWeight: "700" }}>{session.user?.name}</Text>
        <Text style={{ color: palette.muted, marginTop: 6 }}>{session.user?.phone || session.user?.email || "-"}</Text>
        <Text style={{ color: palette.muted, marginTop: 6 }}>Role: {session.user?.role}</Text>
        <Pressable onPress={onLogout} style={{ backgroundColor: palette.danger, borderRadius: 16, padding: 14, alignItems: "center", marginTop: 16 }}>
          <Text style={{ color: "#fff", fontWeight: "700" }}>Logout</Text>
        </Pressable>
      </SectionCard>
      <SectionCard title="Cloud Setup" subtitle="API">
        <Text style={{ color: palette.muted }}>Backend URL</Text>
        <Text style={{ color: palette.text, marginTop: 6 }}>{apiBaseUrl}</Text>
      </SectionCard>
    </SafeAreaView>
  );
}

function AppTabs({ session, onLogout }) {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarStyle: { backgroundColor: palette.card, borderTopColor: palette.border }, tabBarActiveTintColor: palette.text, tabBarInactiveTintColor: palette.muted }}>
      <Tab.Screen name="Sales">{() => <SalesScreen session={session} />}</Tab.Screen>
      <Tab.Screen name="Products">{() => <ProductsScreen session={session} />}</Tab.Screen>
      <Tab.Screen name="Customers">{() => <CustomersScreen session={session} />}</Tab.Screen>
      <Tab.Screen name="Settings">{() => <SettingsScreen session={session} onLogout={onLogout} />}</Tab.Screen>
    </Tab.Navigator>
  );
}

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const [accessToken, refreshToken, userJson] = await Promise.all([
        AsyncStorage.getItem(storageKeys.accessToken),
        AsyncStorage.getItem(storageKeys.refreshToken),
        AsyncStorage.getItem(storageKeys.user)
      ]);

      if (accessToken && refreshToken && userJson) {
        setSession({
          accessToken,
          refreshToken,
          user: JSON.parse(userJson)
        });
      }
      setLoading(false);
    })();
  }, []);

  const handleLogin = async (credentials) => {
    setAuthLoading(true);
    try {
      const response = await apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials)
      });
      const nextSession = {
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
        user: response.data.user
      };
      await Promise.all([
        AsyncStorage.setItem(storageKeys.accessToken, nextSession.accessToken),
        AsyncStorage.setItem(storageKeys.refreshToken, nextSession.refreshToken),
        AsyncStorage.setItem(storageKeys.user, JSON.stringify(nextSession.user))
      ]);
      setSession(nextSession);
    } catch (error) {
      Alert.alert("Login failed", error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (session?.refreshToken) {
        await apiRequest("/api/auth/logout", {
          method: "POST",
          body: JSON.stringify({ refreshToken: session.refreshToken })
        });
      }
    } catch (_error) {
      // Ignore logout network failures and clear local state.
    }

    await Promise.all([
      AsyncStorage.removeItem(storageKeys.accessToken),
      AsyncStorage.removeItem(storageKeys.refreshToken),
      AsyncStorage.removeItem(storageKeys.user)
    ]);
    setSession(null);
  };

  if (loading) {
    return (
      <SafeAreaView style={[screenStyle, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator color={palette.accent} />
      </SafeAreaView>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!session ? (
          <Stack.Screen name="Login">{() => <LoginScreen onLogin={handleLogin} loading={authLoading} />}</Stack.Screen>
        ) : (
          <Stack.Screen name="App">{() => <AppTabs session={session} onLogout={handleLogout} />}</Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const screenStyle = {
  flex: 1,
  backgroundColor: palette.bg,
  padding: 16
};

const inputStyle = {
  backgroundColor: palette.bg,
  color: palette.text,
  borderWidth: 1,
  borderColor: palette.border,
  borderRadius: 16,
  padding: 14,
  marginBottom: 12
};

const listRowStyle = {
  paddingVertical: 14,
  borderBottomWidth: 1,
  borderBottomColor: palette.border,
  flexDirection: "row",
  alignItems: "center",
  gap: 12
};
