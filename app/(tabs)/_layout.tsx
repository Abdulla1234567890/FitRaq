import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Tabs } from "expo-router";
import React from "react";

import { AppTabBar } from '@/components/app-tab-bar';
import { HapticTab } from "@/components/haptic-tab";

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <AppTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: "#2F42C7",
        tabBarInactiveTintColor: "#3D3834",
        tabBarLabelStyle: {
          display: "none",
        },
        tabBarStyle: {
          backgroundColor: "#F4EFE8",
          borderTopWidth: 0,
          elevation: 0,
          display: 'none',
        },
      }}
    >
      <Tabs.Screen
        name="homepage"
        options={{
          title: "Home Page",
          tabBarIcon: ({ color }) => (
            <MaterialIcons size={24} name="home-filled" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="journeys"
        options={{
          title: "Journeys",
          tabBarIcon: ({ color }) => (
            <MaterialIcons size={24} name="alt-route" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="journey-details"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="start-shortcut"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="choose-path"
        options={{
          href: null,
          tabBarStyle: {
            display: 'none',
          },
        }}
      />
      <Tabs.Screen
        name="choose-trail"
        options={{
          href: null,
          tabBarStyle: {
            display: 'none',
          },
        }}
      />
      <Tabs.Screen
        name="start-journey"
        options={{
          href: null,
          tabBarStyle: {
            display: 'none',
          },
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: "Activity",
          tabBarIcon: ({ color }) => (
            <MaterialIcons size={24} name="accessibility-new" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="activity-week"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="nutrition"
        options={{
          title: "Nutrition",
          tabBarIcon: ({ color }) => (
            <MaterialIcons size={24} name="restaurant-menu" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
