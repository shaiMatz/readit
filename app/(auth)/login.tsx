import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  ImageBackground,
  Platform,
  StatusBar,
  TextInput as RNTextInput,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '@/store/authStore';
import { spacing } from '@/theme';
import { AppInput } from '@/components/ui/AppInput';
import { AppButton } from '@/components/ui/AppButton';
import { InlineAlert } from '@/components/ui/InlineAlert';
import { DemoHint } from '@/components/auth/DemoHint';

export default function LoginScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const { login, isLoading, error } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const pwdRef = useRef<RNTextInput | null>(null);

  // Entrance animations
  const logoOp = useSharedValue(0);
  const logoSv = useSharedValue(0.82);
  const cardOp = useSharedValue(0);
  const cardY = useSharedValue(36);

  useEffect(() => {
    logoOp.value = withTiming(1, { duration: 500 });
    logoSv.value = withSpring(1, { damping: 16, stiffness: 150 });
    cardOp.value = withDelay(180, withTiming(1, { duration: 440 }));
    cardY.value = withDelay(180, withSpring(0, { damping: 22, stiffness: 170 }));
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOp.value,
    transform: [{ scale: logoSv.value }],
  }));
  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOp.value,
    transform: [{ translateY: cardY.value }],
  }));

  const handleLogin = () => login(email.trim().toLowerCase(), password);
  const fillDemo = () => { setEmail('user@readit.dev'); setPassword('password123'); };

  return (
    <ImageBackground
      source={require('../../assets/bg.jpg')}
      style={styles.bg}
      resizeMode="cover"
    >
      <LinearGradient
        colors={isDark ? [
          'rgba(0,0,0,0.88)',
          'rgba(0,0,0,0.52)',
          'rgba(0,0,0,0.52)',
          'rgba(0,0,0,0.88)',
        ] : [
          'rgba(255,255,255,0.92)',
          'rgba(255,255,255,0.62)',
          'rgba(255,255,255,0.62)',
          'rgba(255,255,255,0.92)',
        ]}
        locations={[0, 0.30, 0.70, 1]}
        style={styles.overlay}
      />

      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        translucent
        backgroundColor="transparent"
      />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          style={styles.kav}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >


            {/* Glass card */}
            <Animated.View style={[styles.card, isDark ? styles.cardDark : styles.cardLight, cardStyle]}>
              <View style={styles.cardHeader}>
                {/* Logo */}
                <View style={styles.logoArea}>
                  <Animated.Image
                    source={require('../../assets/ReadIt_No_Bg.png')}
                    style={[styles.logo, logoStyle]}
                    resizeMode="contain"
                  />
                </View>
                <Text style={[styles.headline, isDark ? styles.headlineDark : styles.headlineLight]}>Sign In</Text>
              </View>

              {error ? <InlineAlert message={error} type="error" /> : null}

              <View style={styles.fields}>
                <AppInput
                  label="Email"
                  icon="mail-outline"
                  placeholder="user@readit.dev"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  returnKeyType="next"
                  textContentType="emailAddress"
                  autoComplete="email"
                  onSubmitEditing={() => pwdRef.current?.focus()}
                  surface={isDark ? 'dark' : 'auto'}
                />
                <AppInput
                  label="Password"
                  icon="lock-closed-outline"
                  placeholder="password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPwd}
                  rightIcon={showPwd ? 'eye-off-outline' : 'eye-outline'}
                  onRightIconPress={() => setShowPwd((v) => !v)}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                  textContentType="password"
                  autoComplete="password"
                  inputRef={pwdRef}
                  surface={isDark ? 'dark' : 'auto'}
                />
              </View>

              <AppButton
                label="Sign In"
                onPress={handleLogin}
                isLoading={isLoading}
                variant="primary"
              />

              <DemoHint onFill={fillDemo} surface={isDark ? 'dark' : 'auto'} />
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject },
  safe: { flex: 1 },
  kav: { flex: 1, paddingHorizontal: spacing.lg },

  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 40,
  },

  logoArea: {
    alignItems: 'center',
  },
  logo: { width: 100, height: 100 },

  card: {
    borderRadius: 28,
    borderWidth: 1,
    padding: spacing.xxl,
    gap: spacing.lg,
    // light/dark applied inline via isDark
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  cardDark: {
    backgroundColor: 'rgba(10,10,10,0.72)',
    borderColor: 'rgba(255,255,255,0.12)',
  },
  cardLight: {
    backgroundColor: 'rgba(255,255,255,0.78)',
    borderColor: 'rgba(0,0,0,0.08)',
  },
  cardHeader: { gap: 5 },
  headline: { fontSize: 26, fontWeight: '700', letterSpacing: -0.4 },
  headlineDark: { color: '#FFFFFF' },
  headlineLight: { color: '#0D0D0D' },
  subline: { fontSize: 15 },
  sublineDark: { color: 'rgba(255,255,255,0.65)' },
  sublineLight: { color: 'rgba(0,0,0,0.50)' },
  fields: { gap: spacing.md },
});
