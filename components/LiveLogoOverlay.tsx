import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  useAnimatedGestureHandler,
  withSpring,
  runOnJS
} from 'react-native-reanimated';
import { PanGestureHandler, PinchGestureHandler, State } from 'react-native-gesture-handler';

interface Logo {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadDate: Date;
}

interface LogoPosition {
  id: string;
  logoId: string;
  x: number;
  y: number;
  scale: number;
  opacity: number;
  rotation: number;
  visible: boolean;
}

interface LiveLogoOverlayProps {
  logos: Logo[];
  logoPositions: LogoPosition[];
  onUpdatePosition: (id: string, updates: Partial<LogoPosition>) => void;
  onSelectPosition: (id: string) => void;
  selectedPositionId?: string;
  containerWidth: number;
  containerHeight: number;
  isLive: boolean;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function LiveLogoOverlay({
  logos,
  logoPositions,
  onUpdatePosition,
  onSelectPosition,
  selectedPositionId,
  containerWidth,
  containerHeight,
  isLive,
}: LiveLogoOverlayProps) {
  const getLogoById = (logoId: string) => logos.find(logo => logo.id === logoId);

  const LogoItem = ({ position }: { position: LogoPosition }) => {
    const logo = getLogoById(position.logoId);
    if (!logo || !position.visible) return null;

    const translateX = useSharedValue((position.x / 100) * containerWidth);
    const translateY = useSharedValue((position.y / 100) * containerHeight);
    const scale = useSharedValue(position.scale);
    const rotation = useSharedValue(position.rotation);

    const panGestureHandler = useAnimatedGestureHandler({
      onStart: (_, context: any) => {
        context.startX = translateX.value;
        context.startY = translateY.value;
        runOnJS(onSelectPosition)(position.id);
      },
      onActive: (event, context) => {
        translateX.value = context.startX + event.translationX;
        translateY.value = context.startY + event.translationY;
      },
      onEnd: () => {
        // Constrain to container bounds
        translateX.value = withSpring(
          Math.max(0, Math.min(containerWidth - 50, translateX.value))
        );
        translateY.value = withSpring(
          Math.max(0, Math.min(containerHeight - 50, translateY.value))
        );

        // Update position in percentage
        const newX = (translateX.value / containerWidth) * 100;
        const newY = (translateY.value / containerHeight) * 100;
        runOnJS(onUpdatePosition)(position.id, { x: newX, y: newY });
      },
    });

    const pinchGestureHandler = useAnimatedGestureHandler({
      onStart: () => {
        runOnJS(onSelectPosition)(position.id);
      },
      onActive: (event) => {
        scale.value = Math.max(0.1, Math.min(3, event.scale * position.scale));
      },
      onEnd: () => {
        runOnJS(onUpdatePosition)(position.id, { scale: scale.value });
      },
    });

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
        { rotate: `${rotation.value}deg` },
      ],
      opacity: position.opacity,
    }));

    const isSelected = selectedPositionId === position.id;

    return (
      <PanGestureHandler onGestureEvent={panGestureHandler} enabled={!isLive}>
        <Animated.View>
          <PinchGestureHandler onGestureEvent={pinchGestureHandler} enabled={!isLive}>
            <AnimatedTouchableOpacity
              style={[
                styles.logoContainer,
                animatedStyle,
                isSelected && !isLive && styles.selectedLogo,
              ]}
              onPress={() => !isLive && onSelectPosition(position.id)}
              activeOpacity={isLive ? 1 : 0.8}
            >
              <Image source={{ uri: logo.url }} style={styles.logoImage} />
              {isSelected && !isLive && (
                <View style={styles.selectionBorder} />
              )}
            </AnimatedTouchableOpacity>
          </PinchGestureHandler>
        </Animated.View>
      </PanGestureHandler>
    );
  };

  return (
    <View style={[styles.overlay, { width: containerWidth, height: containerHeight }]}>
      {logoPositions.map((position) => (
        <LogoItem key={position.id} position={position} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 10,
  },
  logoContainer: {
    position: 'absolute',
    width: 50,
    height: 50,
  },
  logoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
  selectedLogo: {
    borderWidth: 2,
    borderColor: '#40E0D0',
    borderRadius: 6,
  },
  selectionBorder: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderWidth: 2,
    borderColor: '#40E0D0',
    borderRadius: 6,
    borderStyle: 'dashed',
  },
});