import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";
import { cn } from "@/lib/utils";

/** Renders the variable badge in the editor UI */
function VariableBadgeView({ node }: { node: { attrs: { key: string } } }) {
  return (
    <NodeViewWrapper as="span" className="inline" contentEditable={false}>
      <span
        className={cn(
          "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-mono font-medium",
          "bg-primary/15 text-primary border border-primary/30",
          "select-none cursor-default mx-0.5 align-baseline"
        )}
      >
        <span className="opacity-60">{`{`}</span>
        {node.attrs.key}
        <span className="opacity-60">{`}`}</span>
      </span>
    </NodeViewWrapper>
  );
}

export const VariableNode = Node.create({
  name: "variable",
  group: "inline",
  inline: true,
  atom: true,

  addAttributes() {
    return {
      key: { default: "" },
    };
  },

  parseHTML() {
    return [
      {
        tag: "span[data-variable]",
        getAttrs: (el) => ({
          key: (el as HTMLElement).getAttribute("data-variable") ?? "",
        }),
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const key = HTMLAttributes.key ?? "";
    return [
      "span",
      mergeAttributes({ "data-variable": key }, {
        class:
          "inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-primary/15 text-primary border border-primary/30 mx-0.5",
        contenteditable: "false",
      }),
      `{${key}}`,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(VariableBadgeView);
  },
});
