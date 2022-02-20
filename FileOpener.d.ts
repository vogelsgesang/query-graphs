/// <reference types="react" />
import "./FileOpener.css";
export interface FileOpenerData {
    content: string;
    fileName: string | null;
}
interface FileOpenerProps {
    setData: (data: FileOpenerData) => void;
}
export declare function FileOpener({ setData }: FileOpenerProps): JSX.Element;
export {};
//# sourceMappingURL=FileOpener.d.ts.map