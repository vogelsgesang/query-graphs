/// <reference types="react" />
import "./FileOpener.css";
export interface FileOpenerData {
    content: string;
    contentUrl?: string;
    fileName?: string;
}
interface FileOpenerProps {
    setData: (data: FileOpenerData) => Promise<void>;
}
export declare function FileOpener({ setData }: FileOpenerProps): JSX.Element;
export {};
//# sourceMappingURL=FileOpener.d.ts.map