import React, { forwardRef, useImperativeHandle, useMemo, useRef, useState } from "react";
import { PanResponder, StyleSheet, View } from "react-native";
import { Canvas, Path } from "@shopify/react-native-skia";
import { Point, Stroke } from "../utils/geometry";

export interface WritingPadHandle {
  clear: () => void;
  getStrokes: () => Stroke[];
  isEmpty: () => boolean;
}

interface WritingPadProps {
  size: number;
  /** Guide strokes in the templates' fixed 0-100 coordinate space. */
  guideStrokes: Stroke[];
  inkColor?: string;
  guideColor?: string;
  strokeWidth?: number;
  onStrokeEnd?: () => void;
}

/** All templates are authored on a fixed 0-100 grid (see data/templates/builders.ts). */
const GRID = 100;

function toPathString(points: Point[]): string {
  if (points.length === 0) return "";
  const [first, ...rest] = points;
  let d = `M ${first.x.toFixed(1)} ${first.y.toFixed(1)}`;
  for (const p of rest) d += ` L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
  return d;
}

export const WritingPad = forwardRef<WritingPadHandle, WritingPadProps>(function WritingPad(
  { size, guideStrokes, inkColor = "#4338ca", guideColor = "#cbd0dc", strokeWidth = 10, onStrokeEnd },
  ref
) {
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  // The in-progress stroke is mutated in a ref (touch move fires at high
  // frequency) and mirrored into `tick` state just to trigger a re-render.
  const currentStroke = useRef<Stroke>([]);
  const [tick, setTick] = useState(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        currentStroke.current = [{ x: locationX, y: locationY }];
        setTick((n) => n + 1);
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        currentStroke.current.push({ x: locationX, y: locationY });
        setTick((n) => n + 1);
      },
      onPanResponderRelease: () => {
        // Capture the finished points before resetting the ref - the
        // setStrokes updater can run after this handler returns, by which
        // point currentStroke.current would already be reassigned to [].
        const finishedStroke = currentStroke.current;
        if (finishedStroke.length > 1) {
          setStrokes((prev) => [...prev, finishedStroke]);
        }
        currentStroke.current = [];
        setTick((n) => n + 1);
        onStrokeEnd?.();
      },
      onPanResponderTerminate: () => {
        const finishedStroke = currentStroke.current;
        if (finishedStroke.length > 1) {
          setStrokes((prev) => [...prev, finishedStroke]);
        }
        currentStroke.current = [];
        setTick((n) => n + 1);
      },
    })
  ).current;

  useImperativeHandle(ref, () => ({
    clear: () => {
      setStrokes([]);
      currentStroke.current = [];
      setTick((n) => n + 1);
    },
    getStrokes: () =>
      currentStroke.current.length > 1 ? [...strokes, currentStroke.current] : strokes,
    isEmpty: () => strokes.length === 0 && currentStroke.current.length <= 1,
  }));

  const scale = size / GRID;

  const guidePaths = useMemo(
    () =>
      guideStrokes.map((stroke) => toPathString(stroke.map((p) => ({ x: p.x * scale, y: p.y * scale })))),
    [guideStrokes, scale]
  );

  const finishedInkPaths = useMemo(() => strokes.map((stroke) => toPathString(stroke)), [strokes]);

  const currentInkPath =
    tick >= 0 && currentStroke.current.length > 1 ? toPathString(currentStroke.current) : null;

  return (
    <View
      style={[styles.pad, { width: size, height: size }]}
      {...panResponder.panHandlers}
      accessibilityRole="image"
      accessibilityLabel="Writing pad"
    >
      <Canvas style={StyleSheet.absoluteFill}>
        {guidePaths.map((d, i) => (
          <Path
            key={`guide-${i}`}
            path={d}
            color={guideColor}
            style="stroke"
            strokeWidth={strokeWidth * 0.7}
            strokeCap="round"
            strokeJoin="round"
          />
        ))}
        {finishedInkPaths.map((d, i) => (
          <Path
            key={`ink-${i}`}
            path={d}
            color={inkColor}
            style="stroke"
            strokeWidth={strokeWidth}
            strokeCap="round"
            strokeJoin="round"
          />
        ))}
        {currentInkPath && (
          <Path
            path={currentInkPath}
            color={inkColor}
            style="stroke"
            strokeWidth={strokeWidth}
            strokeCap="round"
            strokeJoin="round"
          />
        )}
      </Canvas>
    </View>
  );
});

const styles = StyleSheet.create({
  pad: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    overflow: "hidden",
  },
});
