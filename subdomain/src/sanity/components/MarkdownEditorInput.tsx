/**
 * Custom Sanity Input: WYSIWYG Markdown Editor
 *
 * Mengganti plain <textarea> untuk field konten artikel (dan field lain
 * yang butuh rich text). Pakai @mdxeditor/editor — React-based Markdown
 * editor dengan toolbar (Bold, Italic, Underline, Headings, Lists, Quote,
 * Code, Link, Image, Table, Thematic Break) yang berperilaku seperti
 * Google Docs: pilih teks → klik tombol → otomatis ke-format.
 *
 * Output tetap berupa string Markdown, jadi:
 *   - Data existing (Markdown string di Sanity Content Lake) tetap compatible
 *   - Rendering di web pakai ReactMarkdown (tidak perlu ubah)
 *
 * Reference: https://mdxeditor.editorjs.io/
 */

"use client";

import { useCallback, useEffect, useRef } from "react";
import { set, unset } from "sanity";
import {
  MDXEditor,
  type MDXEditorMethods,
  headingsPlugin,
  listsPlugin,
  linkPlugin,
  linkDialogPlugin,
  quotePlugin,
  thematicBreakPlugin,
  tablePlugin,
  imagePlugin,
  markdownShortcutPlugin,
  toolbarPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  BlockTypeSelect,
  CodeToggle,
  ListsToggle,
  CreateLink,
  InsertImage,
  InsertTable,
  InsertThematicBreak,
  Separator,
  DiffSourceToggleWrapper,
} from "@mdxeditor/editor";

// Import styling wajib dari MDXEditor (sekali saja, di komponen ini)
import "@mdxeditor/editor/style.css";

interface MarkdownEditorInputProps {
  value: string | undefined;
  onChange: (patch: ReturnType<typeof set> | ReturnType<typeof unset>) => void;
  // Sanity extra props (path, presence, etc.) — diabaikan
  [key: string]: unknown;
}

export function MarkdownEditorInput({
  value,
  onChange,
}: MarkdownEditorInputProps) {
  const editorRef = useRef<MDXEditorMethods>(null);

  // Sinkronisasi external value → editor (mis. saat dokumen di-load dari Sanity)
  // Hanya set kalau berbeda untuk avoid loop.
  useEffect(() => {
    if (editorRef.current) {
      const current = editorRef.current.getMarkdown();
      if ((current ?? "") !== (value ?? "")) {
        editorRef.current.setMarkdown(value ?? "");
      }
    }
  }, [value]);

  const handleChange = useCallback(
    (markdown: string) => {
      // Sanity convention: unset kalau kosong, set kalau ada isi
      if (!markdown || markdown.trim() === "") {
        onChange(unset());
      } else {
        onChange(set(markdown));
      }
    },
    [onChange]
  );

  return (
    <div className="mdx-editor-sanity-wrapper">
      <MDXEditor
        ref={editorRef}
        markdown={value ?? ""}
        onChange={handleChange}
        contentEditableClassName="markdown-content min-h-[400px] focus:outline-none px-4 py-3"
        plugins={[
          toolbarPlugin({
            toolbarContents: () => (
              <>
                <DiffSourceToggleWrapper>
                  <UndoRedo />
                </DiffSourceToggleWrapper>
                <Separator />
                <BoldItalicUnderlineToggles />
                <Separator />
                <BlockTypeSelect />
                <Separator />
                <ListsToggle />
                <CodeToggle />
                <CreateLink />
                <InsertImage />
                <InsertTable />
                <InsertThematicBreak />
              </>
            ),
          }),
          headingsPlugin({ allowedHeadingLevels: [1, 2, 3, 4] }),
          listsPlugin(),
          linkPlugin(),
          linkDialogPlugin(),
          quotePlugin(),
          thematicBreakPlugin(),
          tablePlugin(),
          imagePlugin({
            imageUploadHandler: async () => {
              // Untuk upload image di konten artikel, user bisa pakai URL
              // eksternal (insert via dialog) atau upload manual lewat field
              // image terpisah di schema. Disable local file upload di editor
              // untuk konsistensi dengan Sanity asset management.
              return Promise.reject(
                new Error(
                  "Upload gambar langsung dari editor belum didukung. Gunakan tombol 'Insert Image' lalu paste URL gambar, atau upload gambar via field Cover Image di schema."
                )
              );
            },
          }),
          markdownShortcutPlugin(),
        ]}
        placeholder="Tulis konten artikel di sini. Gunakan toolbar di atas untuk format (Bold, Heading, List, dll). Support shortcut Markdown seperti **bold**, # heading, - bullet."
      />
    </div>
  );
}

export default MarkdownEditorInput;
