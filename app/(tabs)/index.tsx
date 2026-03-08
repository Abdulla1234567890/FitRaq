import { Redirect, useLocalSearchParams } from 'expo-router';

export default function HomeIndexRedirect() {
  const params = useLocalSearchParams<{ name?: string }>();
  const name = Array.isArray(params.name) ? params.name[0] : params.name;

  return <Redirect href={{ pathname: '/(tabs)/homepage', params: name ? { name } : undefined }} />;
}
