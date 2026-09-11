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
import { RichTextUrlBar } from "./RichTextUrlBar";
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
  const [imageSelected, setImageSelected] = useState(false);

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
          "min-h-[220px] px-4 py-3 text-sm text-dark leading-relaxed focus:outline-none prose prose-sm max-w-none prose-img:rounded-xl prose-img:my-3 prose-img:h-auto prose-img:w-full prose-img:max-w-full",
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

  useEffect(() => {
    if (!editor) return;
    const sync = () => {
      setImageSelected(editor.isActive("image"));
      setCharCount(editor.getText().length);
    };
    editor.on("selectionUpdate", sync);
    editor.on("transaction", sync);
    sync();
    return () => {
      editor.off("selectionUpdate", sync);
      editor.off("transaction", sync);
    };
  }, [editor]);

  const insertImage = useCallback(() => {
    if (!editor || !imageUrl.trim()) return;
    editor.chain().focus().setImage({ src: imageUrl.trim() }).run();
    setImageUrl("");
    setShowImageInput(false);
  }, [editor, imageUrl]);

  const removeImage = useCallback(() => {
    if (!editor || !editor.isActive("image")) return;
    editor.chain().focus().deleteSelection().run();
  }, [editor]);

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
        imageSelected={imageSelected}
        onRemoveImage={removeImage}
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
        <RichTextUrlBar
          value={linkUrl}
          onChange={setLinkUrl}
          onSubmit={applyLink}
          placeholder={RICH_TEXT_COPY.LINK_PROMPT}
          submitLabel={RICH_TEXT_COPY.INSERT}
        />
      )}

      {showImageInput && (
        <RichTextUrlBar
          value={imageUrl}
          onChange={setImageUrl}
          onSubmit={insertImage}
          placeholder={RICH_TEXT_COPY.IMAGE_PLACEHOLDER}
          submitLabel={RICH_TEXT_COPY.INSERT}
        />
      )}

      {showYoutubeInput && (
        <RichTextUrlBar
          value={youtubeUrl}
          onChange={setYoutubeUrl}
          onSubmit={insertYoutube}
          placeholder={RICH_TEXT_COPY.YOUTUBE_PLACEHOLDER}
          submitLabel={RICH_TEXT_COPY.EMBED}
        />
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
