/// <reference types="react" />
import "./FileOpener.css";
export interface FileOpenerData {
    url: URL;
    fileName?: string;
}
interface RawLoadState {
    state: "pristine" | "loading" | "error";
    detail?: string;
}
interface LoadStateController {
    loadState: RawLoadState;
    clearLoadState: () => void;
    setProgress: (msg: string) => void;
    setError: (msg: string) => void;
    tryAndDisplayErrors: (doIt: () => Promise<void>) => Promise<void>;
}
export declare function useLoadStateController(): LoadStateController;
interface FileOpenerProps {
    setData: (data: FileOpenerData) => Promise<void>;
    loadStateController: LoadStateController;
}
export declare function FileOpener({ setData, loadStateController }: FileOpenerProps): JSX.Element;
export {};
//# sourceMappingURL=FileOpener.d.ts.map