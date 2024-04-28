import {StateField} from "@codemirror/state";
import {Decoration, DecorationSet, EditorView} from "@codemirror/view";

import "./HighlightDecoration.css";

const referenceMark = Decoration.mark({class: "qg-cm-reference"});
const referenceMarkActivePrimary = Decoration.mark({class: "qg-cm-reference qg-cm-active-primary"});
const referenceMarkActiveSecondary = Decoration.mark({class: "qg-cm-reference qg-cm-active-secondary"});

export const referenceDecorations = StateField.define<DecorationSet>({
    create() {
        return Decoration.none;
    },
    update(_underlines, _tr) {
        return Decoration.set([
            referenceMark.range(10, 15),
            referenceMarkActiveSecondary.range(20, 25),
            referenceMarkActivePrimary.range(30, 40),
            referenceMarkActiveSecondary.range(50, 53),
        ]);
    },
    provide: (f) => EditorView.decorations.from(f),
});
