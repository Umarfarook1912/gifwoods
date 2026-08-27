"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import Placeholder from "@tiptap/extension-placeholder";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { useEffect, useCallback, useState } from "react";
import { RichTextToolbar } from "./RichTextToolbar";
import { RICH_TEXT_COPY } from "@/constants/rich-text-editor";

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder }: Props) {
  const [imageUrl, setImageUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [showImageInput, setShowImageInput] = useState(false);
  const [showYoutubeInput, setShowYoutubeInput] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [showColorMenu, setShowColorMenu] = useState(false);
  const [charCount, setCharCount] = useState(0);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: {
          openOnClick: false,
          HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
        },
      }),
      TextStyle,
      Color,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Image.configure({ inline: false, allowBase64: false }),
      Youtube.configure({ controls: true, width: 640, height: 360 }),
      Placeholder.configure({
        placeholder: placeholder ?? RICH_TEXT_COPY.PLACEHOLDER,
      }),
    ],
    content: value || "",
    onUpdate({ editor: ed }) {
      onChange(ed.getHTML());
      setCharCount(ed.getText().length);
    },
    editorProps: {
      attributes: {
        class:
          "min-h-[220px] px-4 py-3 text-sm text-dark leading-relaxed focus:outline-none prose prose-sm max-w-none",
      },
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (!editor) return;
    if (editor.getHTML() === value) return;
    editor.commands.setContent(value || "", { emitUpdate: false });
    setCharCount(editor.getText().length);
  }, [editor, value]);

  const insertImage = useCallback(() => {
    if (!editor || !imageUrl.trim()) return;
    editor.chain().focus().setImage({ src: imageUrl.trim() }).run();
    setImageUrl("");
    setShowImageInput(false);
  }, [editor, imageUrl]);

  const insertYoutube = useCallback(() => {
    if (!editor || !youtubeUrl.trim()) return;
    editor.commands.setYoutubeVideo({ src: youtubeUrl.trim() });
    setYoutubeUrl("");
    setShowYoutubeInput(false);
  }, [editor, youtubeUrl]);

  const applyLink = useCallback(() => {
    if (!editor) return;
    const href = linkUrl.trim();
    if (!href) {
      editor.chain().focus().unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
    }
    setLinkUrl("");
    setShowLinkInput(false);
  }, [editor, linkUrl]);

  if (!editor) return null;

  return (
    <div className="mt-1 overflow-hidden rounded-xl border border-border bg-white">
      <RichTextToolbar
        editor={editor}
        showImageInput={showImageInput}
        showYoutubeInput={showYoutubeInput}
        showLinkInput={showLinkInput}
        showColorMenu={showColorMenu}
        onToggleImage={() => {
          setShowImageInput((v) => !v);
          setShowYoutubeInput(false);
          setShowLinkInput(false);
          setShowColorMenu(false);
        }}
        onToggleYoutube={() => {
          setShowYoutubeInput((v) => !v);
          setShowImageInput(false);
          setShowLinkInput(false);
          setShowColorMenu(false);
        }}
        onToggleLink={() => {
          setShowLinkInput((v) => !v);
          setShowImageInput(false);
          setShowYoutubeInput(false);
          setShowColorMenu(false);
          if (editor.isActive("link")) {
            setLinkUrl(editor.getAttributes("link").href ?? "");
          }
        }}
        onToggleColor={() => {
          setShowColorMenu((v) => !v);
          setShowImageInput(false);
          setShowYoutubeInput(false);
          setShowLinkInput(false);
        }}
      />

      {showLinkInput && (
        <div className="flex items-center gap-2 border-b border-border bg-cream/30 px-3 py-2">
          <input
            type="url"
            className="flex-1 rounded-lg border border-border px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-gold/50"
            placeholder={RICH_TEXT_COPY.LINK_PROMPT}
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyLink()}
          />
          <button
            type="button"
            onClick={applyLink}
            className="rounded-lg bg-gold px-3 py-1.5 text-xs font-semibold text-dark transition-colors hover:bg-gold-dark"
          >
            {RICH_TEXT_COPY.INSERT}
          </button>
        </div>
      )}

      {showImageInput && (
        <div className="flex items-center gap-2 border-b border-border bg-cream/30 px-3 py-2">
          <input
            type="url"
            className="flex-1 rounded-lg border border-border px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-gold/50"
            placeholder={RICH_TEXT_COPY.IMAGE_PLACEHOLDER}
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && insertImage()}
          />
          <button
            type="button"
            onClick={insertImage}
            className="rounded-lg bg-gold px-3 py-1.5 text-xs font-semibold text-dark transition-colors hover:bg-gold-dark"
          >
            {RICH_TEXT_COPY.INSERT}
          </button>
        </div>
      )}

      {showYoutubeInput && (
        <div className="flex items-center gap-2 border-b border-border bg-cream/30 px-3 py-2">
          <input
            type="url"
            className="flex-1 rounded-lg border border-border px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-gold/50"
            placeholder={RICH_TEXT_COPY.YOUTUBE_PLACEHOLDER}
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && insertYoutube()}
          />
          <button
            type="button"
            onClick={insertYoutube}
            className="rounded-lg bg-gold px-3 py-1.5 text-xs font-semibold text-dark transition-colors hover:bg-gold-dark"
          >
            {RICH_TEXT_COPY.EMBED}
          </button>
        </div>
      )}

      <EditorContent editor={editor} />

      <div className="flex items-center justify-between gap-3 border-t border-border bg-cream/40 px-3 py-2">
        <p className="text-[11px] text-warm-gray">{RICH_TEXT_COPY.FOOTER_HELP}</p>
        <p className="shrink-0 text-[11px] font-medium text-warm-gray">
          {charCount} {RICH_TEXT_COPY.CHARACTERS}
        </p>
      </div>
    </div>
  );
}
