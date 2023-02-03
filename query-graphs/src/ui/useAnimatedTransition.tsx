import {useEffect, useRef, useState} from "react";

export type Interpolator<T> = (c: number) => T;
type InterpolatorFactory<T> = (from: T, to: T) => Interpolator<T>;

export function useAnimatedTransition<T>(goalState: T, duration: number, interpolatorFactory: InterpolatorFactory<T>): T {
    const interpolator = useRef<Interpolator<T>>();
    const currentState = useRef<T>(goalState);
    const [progress, setProgress] = useState<number>(0);

    // Update the interpolated state
    if (interpolator.current) {
        if (progress < 1) {
            currentState.current = interpolator.current(progress);
        } else {
            currentState.current = goalState;
            interpolator.current = undefined;
        }
    }

    // Whenever the goalState changes, we start a new transition
    useEffect(() => {
        // Stash away the current state
        interpolator.current = interpolatorFactory(currentState.current, goalState);
        // Animate the `progress` value from 0 to 1
        setProgress(0);
        let animationFrame: number | undefined;
        let initialTimeout: NodeJS.Timeout | undefined;
        const start = Date.now();
        function onFrame() {
            initialTimeout = undefined;
            const newProgress = Math.min((Date.now() - start) / duration, 1);
            setProgress(newProgress);
            if (newProgress < 1) {
                animationFrame = requestAnimationFrame(onFrame);
            }
        }
        // Start the loop; use a `setTimeout` to debounce. This is important,
        // so that the initial frame at `progress = 0` actually gets rendered
        // by the browser, and CSS transitions are correctly picked up.
        initialTimeout = setTimeout(onFrame, 0);
        return () => {
            if (initialTimeout !== undefined) clearTimeout(initialTimeout);
            if (animationFrame !== undefined) cancelAnimationFrame(animationFrame);
        };
    }, [duration, goalState]);
    return currentState.current;
}
