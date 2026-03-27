import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const TAB_ITEMS = [
  { name: "homepage", icon: "home-filled", label: "Home" },
  { name: "journeys", icon: "alt-route", label: "Logbook" },
  { name: "activity", icon: "accessibility-new", label: "Activity" },
  { name: "nutrition", icon: "restaurant-menu", label: "Nutrition" },
] as const;

const QUICK_TYPES = [
  {
    id: "running",
    icon: "directions-run",
    label: "Run",
    color: "#2F42C7",
    tint: "#EEF1FF",
    x: -108,
    y: -96,
  },
  {
    id: "walking",
    icon: "directions-walk",
    label: "Walk",
    color: "#6A73D6",
    tint: "#F1F0FF",
    x: -36,
    y: -132,
  },
  {
    id: "cycling",
    icon: "pedal-bike",
    label: "Cycle",
    color: "#4C72BA",
    tint: "#EEF5FF",
    x: 36,
    y: -132,
  },
  {
    id: "hiking",
    icon: "terrain",
    label: "Hike",
    color: "#7D9B52",
    tint: "#F1F7E8",
    x: 108,
    y: -96,
  },
] as const;

export function AppTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;
  const currentRoute = state.routes[state.index];
  const visibleRoutes = useMemo(
    () =>
      state.routes.filter((route) =>
        TAB_ITEMS.some((item) => item.name === route.name),
      ),
    [state.routes],
  );
  const isMainTabRoute = TAB_ITEMS.some(
    (item) => item.name === currentRoute?.name,
  );

  useEffect(() => {
    Animated.parallel([
      Animated.timing(animation, {
        toValue: menuOpen ? 1 : 0,
        duration: menuOpen ? 220 : 180,
        easing: menuOpen ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [animation, menuOpen]);

  const handleTabPress = async (routeName: string) => {
    const route = state.routes.find((item) => item.name === routeName);

    if (!route) {
      return;
    }

    await Haptics.selectionAsync();
    setMenuOpen(false);

    const event = navigation.emit({
      type: "tabPress",
      target: route.key,
      canPreventDefault: true,
    });

    if (!event.defaultPrevented) {
      navigation.navigate(route.name);
    }
  };

  const handleStartPress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setMenuOpen(false);
    router.push("/(tabs)/choose-path");
  };

  const handleStartLongPress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMenuOpen((current) => !current);
  };

  const handleQuickType = async (type: (typeof QUICK_TYPES)[number]["id"]) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setMenuOpen(false);
    router.push({
      pathname: "/(tabs)/choose-trail",
      params: { type },
    });
  };

  if (!isMainTabRoute) {
    return null;
  }

  return (
    <View style={styles.shell} pointerEvents="box-none">
      {menuOpen ? (
        <Pressable
          onPress={() => setMenuOpen(false)}
          style={StyleSheet.absoluteFillObject}
        />
      ) : null}

      <View pointerEvents="box-none" style={styles.overlayArea}>
        {QUICK_TYPES.map((option) => {
          const translateX = animation.interpolate({
            inputRange: [0, 1],
            outputRange: [0, option.x],
          });
          const translateY = animation.interpolate({
            inputRange: [0, 1],
            outputRange: [0, option.y],
          });
          const scale = animation.interpolate({
            inputRange: [0, 1],
            outputRange: [0.2, 1],
          });
          const opacity = animation.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
          });

          return (
            <Animated.View
              key={option.id}
              pointerEvents={menuOpen ? "auto" : "none"}
              style={[
                styles.quickBubbleWrap,
                {
                  opacity,
                  transform: [{ translateX }, { translateY }, { scale }],
                },
              ]}
            >
              <Pressable
                onPress={() => handleQuickType(option.id)}
                style={[styles.quickBubble, { backgroundColor: option.tint }]}
              >
                <MaterialIcons
                  color={option.color}
                  name={option.icon}
                  size={22}
                />
                <Text
                  style={[styles.quickBubbleLabel, { color: option.color }]}
                >
                  {option.label}
                </Text>
              </Pressable>
            </Animated.View>
          );
        })}
      </View>

      <View style={styles.bar}>
        <View style={[styles.sideGroup, styles.leftGroup]}>
          {visibleRoutes.slice(0, 2).map((route) => {
            const config = TAB_ITEMS.find((item) => item.name === route.name);
            if (!config) {
              return null;
            }

            const focused =
              state.index ===
              state.routes.findIndex((item) => item.key === route.key);
            const color = focused ? "#2F42C7" : "#8E8680";

            return (
              <Pressable
                key={route.key}
                onPress={() => handleTabPress(route.name)}
                style={styles.tabButton}
              >
                <MaterialIcons color={color} name={config.icon} size={24} />
              </Pressable>
            );
          })}
        </View>

        <View pointerEvents="none" style={styles.centerGap} />

        <View style={[styles.sideGroup, styles.rightGroup]}>
          {visibleRoutes.slice(2).map((route) => {
            const config = TAB_ITEMS.find((item) => item.name === route.name);
            if (!config) {
              return null;
            }

            const focused =
              state.index ===
              state.routes.findIndex((item) => item.key === route.key);
            const color = focused ? "#2F42C7" : "#8E8680";

            return (
              <Pressable
                key={route.key}
                onPress={() => handleTabPress(route.name)}
                style={styles.tabButton}
              >
                <MaterialIcons color={color} name={config.icon} size={24} />
              </Pressable>
            );
          })}
        </View>

        <Pressable
          onLongPress={handleStartLongPress}
          onPress={handleStartPress}
          style={styles.startButtonWrap}
        >
          <Animated.View
            style={[
              styles.startButton,
              {
                transform: [
                  {
                    scale: animation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.06],
                    }),
                  },
                ],
              },
            ]}
          >
            <MaterialIcons
              color="#FFFFFF"
              name="navigation"
              size={26}
              style={styles.startIcon}
            />
          </Animated.View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    position: "relative",
    paddingHorizontal: 10,
    paddingBottom: Platform.OS === "ios" ? 20 : 12,
    paddingTop: 8,
    backgroundColor: "#F4EFE8",
  },
  overlayArea: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 52,
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "box-none",
  },
  quickBubbleWrap: {
    position: "absolute",
  },
  quickBubble: {
    minWidth: 72,
    borderRadius: 22,
    paddingHorizontal: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  quickBubbleLabel: {
    fontSize: 12,
    fontWeight: "700",
  },
  bar: {
    height: 64,
    borderRadius: 0,
    backgroundColor: "transparent",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    overflow: "visible",
  },
  sideGroup: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: "50%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
  },
  leftGroup: {
    left: 0,
    paddingLeft: 8,
    paddingRight: 42,
  },
  rightGroup: {
    right: 0,
    paddingLeft: 42,
    paddingRight: 8,
  },
  centerGap: {
    width: 84,
  },
  tabButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  startButtonWrap: {
    position: "absolute",
    left: "50%",
    top: -20,
    marginLeft: -37,
  },
  startButton: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: "#2F42C7",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2F42C7",
    shadowOpacity: 0.28,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
    borderWidth: 6,
    borderColor: "#F4EFE8",
  },
  startIcon: {
    marginLeft: 2,
    marginTop: 1,
  },
});
