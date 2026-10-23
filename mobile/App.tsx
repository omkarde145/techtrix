import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Modal,
  Text,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { SyncProvider } from './src/context/SyncContext';
import { Header } from './src/components/Header';
import { FieldInspectionScreen } from './src/screens/FieldInspectionScreen';
import { CitizenTrackerScreen } from './src/screens/CitizenTrackerScreen';
import { AdminApprovalScreen } from './src/screens/AdminApprovalScreen';
import { OfflineQueueScreen } from './src/screens/OfflineQueueScreen';

const MainNavigator: React.FC = () => {
  const { role } = useAuth();
  const [queueVisible, setQueueVisible] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);

  const triggerBhashiniVoice = () => {
    setVoiceNotice('भाषिणी: "भू-टैगिंग सत्यापन शुरू करने के लिए लाभार्थी चुनें।" (Choose beneficiary to begin geotag)');
    setTimeout(() => setVoiceNotice(null), 4500);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#064e3b" />
      <Header onOpenSyncQueue={() => setQueueVisible(true)} />

      {/* Main Screen Body */}
      <View style={styles.screenContainer}>
        {role === 'inspector' && <FieldInspectionScreen />}
        {role === 'citizen' && <CitizenTrackerScreen />}
        {role === 'admin' && <AdminApprovalScreen />}
      </View>

      {/* Floating Bhashini Voice Assistant Pill */}
      <TouchableOpacity style={styles.voiceFab} onPress={triggerBhashiniVoice}>
        <Text style={styles.voiceFabIcon}>🎙️</Text>
        <Text style={styles.voiceFabText}>Bhashini Voice</Text>
      </TouchableOpacity>

      {/* Voice Prompt Toast */}
      {voiceNotice && (
        <View style={styles.voiceToast}>
          <Text style={styles.voiceToastText}>{voiceNotice}</Text>
        </View>
      )}

      {/* Offline Queue Modal */}
      <Modal visible={queueVisible} animationType="slide" transparent={false}>
        <OfflineQueueScreen onClose={() => setQueueVisible(false)} />
      </Modal>
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <SyncProvider>
          <MainNavigator />
        </SyncProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#064e3b',
  },
  screenContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  voiceFab: {
    position: 'absolute',
    bottom: 20,
    right: 16,
    backgroundColor: '#064e3b',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#059669',
    gap: 6,
  },
  voiceFabIcon: {
    fontSize: 16,
  },
  voiceFabText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  voiceToast: {
    position: 'absolute',
    bottom: 74,
    left: 20,
    right: 20,
    backgroundColor: '#1e293b',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#38bdf8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  voiceToastText: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});
