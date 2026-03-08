import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfilePlaceholderScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.copy}>This tab can hold personal details, preferences, and account settings.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4EFE8',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  title: {
    color: '#1B140F',
    fontSize: 30,
    fontWeight: '600',
    marginBottom: 12,
  },
  copy: {
    color: '#6E665F',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
});
