"use client";

import type { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  UnderlineIcon,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  ImageIcon,
  Quote,
  Code2,
  RemoveFormatting,
  Palette,
  PlayCircle,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { RICH_TEXT_COLORS, RICH_TEXT_COPY } from "@/constants/rich-text-editor";

interface Props {
  editor: Editor;
  showImageInput: boolean;
  showYoutubeInput: boolean;
  showLinkInput: boolean;
  showColorMenu: boolean;
  onToggleImage: () => void;
  onToggleYoutube: () => void;
  onToggleLink: () => void;
  onToggleColor: () => void;
}

function ToolbarButton({
  active,
  onClick,
  title,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={cn(
        "p-1.5 rounded hover:bg-gold/10 transition-colors text-dark",
        active && "bg-gold/20 text-dark"
      )}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="w-px h-5 bg-border mx-0.5 flex-shrink-0" />;
}

export function RichTextToolbar({
  editor,
  showImageInput,
  showYoutubeInput,
  showLinkInput,
  showColorMenu,
  onToggleImage,
  onToggleYoutube,
  onToggleLink,
  onToggleColor,
}: Props) {
  const styleValue = editor.isActive("heading", { level: 2 })
    ? "h2"
    : editor.isActive("heading", { level: 3 })
      ? "h3"
      : "p";

  return (
    <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-border bg-cream/60">
      <select
        aria-label="Text style"
        className="mr-1 h-8 rounded-md border border-border bg-white px-2 text-xs text-dark"
        value={styleValue}
        onChange={(e) => {
          const v = e.target.value;
          if (v === "h2") editor.chain().focus().toggleHeading({ level: 2 }).run();
          else if (v === "h3") editor.chain().focus().toggleHeading({ level: 3 }).run();
          else editor.chain().focus().setParagraph().run();
        }}
      >
        <option value="p">{RICH_TEXT_COPY.STYLE_NORMAL}</option>
        <option value="h2">{RICH_TEXT_COPY.STYLE_H2}</option>
        <option value="h3">{RICH_TEXT_COPY.STYLE_H3}</option>
      </select>

      <ToolbarButton title="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
        <Bold className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton title="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <Italic className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton title="Underline" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
        <UnderlineIcon className="h-3.5 w-3.5" />
      </ToolbarButton>

      <Divider />

      <ToolbarButton title="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        <List className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton title="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        <ListOrdered className="h-3.5 w-3.5" />
      </ToolbarButton>

      <Divider />

      <ToolbarButton title="Align left" active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()}>
        <AlignLeft className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton title="Align center" active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()}>
        <AlignCenter className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton title="Align right" active={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()}>
        <AlignRight className="h-3.5 w-3.5" />
      </ToolbarButton>

      <Divider />

      <ToolbarButton title="Link" active={showLinkInput || editor.isActive("link")} onClick={onToggleLink}>
        <LinkIcon className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton title="Image" active={showImageInput} onClick={onToggleImage}>
        <ImageIcon className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton title="YouTube" active={showYoutubeInput} onClick={onToggleYoutube}>
        <PlayCircle className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton title="Quote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        <Quote className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton title="Code" active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()}>
        <Code2 className="h-3.5 w-3.5" />
      </ToolbarButton>

      <Divider />

      <div className="relative">
        <ToolbarButton title="Text color" active={showColorMenu} onClick={onToggleColor}>
          <Palette className="h-3.5 w-3.5" />
        </ToolbarButton>
        {showColorMenu && (
          <div className="absolute left-0 top-full z-20 mt-1 flex gap-1 rounded-lg border border-border bg-white p-2 shadow-md">
            {RICH_TEXT_COLORS.map((c) => (
              <button
                key={c.label}
                type="button"
                title={c.label}
                className="h-5 w-5 rounded-full border border-border"
                style={{ backgroundColor: c.value || "transparent" }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  if (!c.value) editor.chain().focus().unsetColor().run();
                  else editor.chain().focus().setColor(c.value).run();
                  onToggleColor();
                }}
              />
            ))}
          </div>
        )}
      </div>

      <ToolbarButton
        title="Clear formatting"
        onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
      >
        <RemoveFormatting className="h-3.5 w-3.5" />
      </ToolbarButton>
    </div>
  );
}
