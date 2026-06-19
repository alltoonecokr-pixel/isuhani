import { Node, mergeAttributes } from "@tiptap/core";
import Image from "@tiptap/extension-image";

// 영상 임베드 — <iframe>를 블록 atom 노드로. 저장 시 cleanForSave가 <figure.cms-video>로 감싼다.
export const Iframe = Node.create({
  name: "iframe",
  group: "block",
  atom: true,
  selectable: true,
  draggable: false,

  addAttributes() {
    return {
      src: { default: null },
      frameborder: { default: "0" },
      allowfullscreen: { default: true },
    };
  },

  parseHTML() {
    return [{ tag: "iframe" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "iframe",
      mergeAttributes(HTMLAttributes, { allowfullscreen: "true" }),
    ];
  },
});

// 이미지 — figcaption 왕복을 위해 data-caption / alt 속성을 보존.
export const CaptionImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      "data-caption": {
        default: null,
        parseHTML: (el) => el.getAttribute("data-caption"),
        renderHTML: (attrs) =>
          attrs["data-caption"]
            ? { "data-caption": attrs["data-caption"] }
            : {},
      },
    };
  },
});
