import type {HTMLAttributes, ReactNode} from "react";
import "./FloatingOverlay.css";

type FloatingOverlayProps = HTMLAttributes<HTMLDivElement> & {
    title: string;
    children?: ReactNode;
};

export function FloatingOverlay({title, children, ...rest}: FloatingOverlayProps) {
    return (
        <div className="react-flow__panel qg-float-overlay" {...rest}>
            <div className="qg-float-titlebar">{title}</div>
            <div className="qg-float-content">{children}</div>
        </div>
    );
}
