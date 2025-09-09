import { Tabs } from 'expo-router';
import { Settings, Play, ChartBar as BarChart3, Zap, Trophy, Users } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import LoginScreen from '@/components/LoginScreen';

export default function TabLayout() {
  const { isAuthenticated, isAdmin, isContributor } = useAuth();

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#40E0D0',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: '#1B1B1B',
          borderTopColor: '#333',
          paddingBottom: 5,
          height: 70,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Setup',
          tabBarIcon: ({ size, color }) => (
            <Settings size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="stream"
        options={{
          title: 'Live',
          tabBarIcon: ({ size, color }) => (
            <Play size={size} color={color} />
          ),
        }}
      />
      
      {/* Admin-only tabs */}
      {(isAdmin() || isContributor() || isEditor() || isModerator()) && (
        <>
          <Tabs.Screen
            name="scoreboard"
            options={{
              title: 'Scoreboard',
              tabBarIcon: ({ size, color }) => (
                <BarChart3 size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="moments"
            options={{
              title: 'Moments',
              tabBarIcon: ({ size, color }) => (
                <Zap size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="summary"
            options={{
              title: 'Summary',
              tabBarIcon: ({ size, color }) => (
                <Trophy size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="users"
            options={{
              title: 'Users',
              tabBarIcon: ({ size, color }) => (
                <Users size={size} color={color} />
              ),
            }}
          />
        </>
      )}
    </Tabs>
  );
}