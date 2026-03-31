import React, { useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TextInput as RNTextInput,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

export type AppInputProps = {
  label?: string;
  icon?: IoniconName;
  placeholder?: string;
  value: string;
  onChangeText: (v: string) => void;
  secureTextEntry?: boolean;
  rightIcon?: IoniconName;
  onRightIconPress?: () => void;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  returnKeyType?: 'next' | 'done' | 'go' | 'search' | 'send';
  onSubmitEditing?: () => void;
  textContentType?: 'emailAddress' | 'password' | 'name' | 'username' | 'none';
  autoComplete?: 'email' | 'password' | 'name' | 'username' | 'off';
  inputRef?: React.RefObject<RNTextInput | null>;
  /**
   * 'dark' forces glass/white-text style for dark overlay surfaces (e.g. login).
   * 'auto' (default) reads from the active theme.
   */
  surface?: 'auto' | 'dark';
};

export function AppInput({
  label,
  icon,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  rightIcon,
  onRightIconPress,
  keyboardType = 'default',
  returnKeyType = 'done',
  onSubmitEditing,
  textContentType,
  autoComplete,
  inputRef,
  surface = 'auto',
}: AppInputProps) {
  const { colors } = useTheme();
  const focus = useSharedValue(0);
  const isGlass = surface === 'dark';

  const c = useMemo(
    () =>
      isGlass
        ? {
            borderIdle:  'rgba(255,255,255,0.18)',
            borderFocus: colors.brand,
            bgIdle:      'rgba(255,255,255,0.10)',
            bgFocus:     'rgba(255,255,255,0.18)',
            icon:        'rgba(255,255,255,0.45)',
            text:        '#FFFFFF',
            placeholder: 'rgba(255,255,255,0.30)',
            label:       'rgba(255,255,255,0.55)',
          }
        : {
            borderIdle:  colors.border,
            borderFocus: colors.brand,
            bgIdle:      colors.surfaceSecondary,
            bgFocus:     colors.surface,
            icon:        colors.icon,
            text:        colors.textPrimary,
            placeholder: colors.textTertiary,
            label:       colors.textSecondary,
          },
    [isGlass, colors],
  );

  const wrapStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(focus.value, [0, 1], [c.borderIdle, c.borderFocus]),
    backgroundColor: interpolateColor(focus.value, [0, 1], [c.bgIdle, c.bgFocus]),
  }));

  return (
    <View style={styles.group}>
      {label ? (
        <Text style={[styles.label, { color: c.label }]}>{label}</Text>
      ) : null}
      <Animated.View style={[styles.wrap, wrapStyle]}>
        {icon ? <Ionicons name={icon} size={17} color={c.icon} /> : null}
        <TextInput
          ref={inputRef}
          style={[styles.input, { color: c.text }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={c.placeholder}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          textContentType={textContentType}
          autoComplete={autoComplete}
          selectionColor={colors.brand}
          onFocus={() => {
            focus.value = withTiming(1, { duration: 180 });
          }}
          onBlur={() => {
            focus.value = withTiming(0, { duration: 180 });
          }}
        />
        {rightIcon ? (
          <TouchableOpacity onPress={onRightIconPress} hitSlop={12}>
            <Ionicons name={rightIcon} size={17} color={c.icon} />
          </TouchableOpacity>
        ) : null}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: 7 },
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    height: 52,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
  },
});
