interface KETFont {
    family?: string;
    size?: number;
}
interface KETIndent {
    first_line?: number;
    left?: number;
    right?: number;
}
interface KETFontStyleOverrides {
    font?: KETFont;
    color?: string;
    bold?: boolean;
    italic?: boolean;
    superscript?: boolean;
    subscript?: boolean;
}
interface KETTextPart extends KETFontStyleOverrides {
    text: string;
}
interface KETParagraph extends KETFontStyleOverrides {
    alignment?: string;
    indent?: KETIndent;
    parts: KETTextPart[];
}
export declare function textToKet(textNode: any): {
    type: "text";
    boundingBox: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    alignment?: string;
    indent?: KETIndent;
    paragraphs: KETParagraph[];
    font?: KETFont;
    color?: string;
    bold?: boolean;
    italic?: boolean;
    superscript?: boolean;
    subscript?: boolean;
    selected: any;
};
export {};
