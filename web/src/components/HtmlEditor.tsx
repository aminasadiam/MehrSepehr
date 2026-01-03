import { createEffect, onMount } from "solid-js";
import Quill from "quill";
import "quill/dist/quill.snow.css";

interface HtmlEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function HtmlEditor(props: HtmlEditorProps) {
  let editorRef: HTMLDivElement | undefined;
  let quillInstance: Quill | null = null;

  onMount(() => {
    if (!editorRef) return;

    // Initialize Quill editor
    quillInstance = new Quill(editorRef, {
      theme: "snow",
      placeholder: props.placeholder || "متن را وارد کنید...",
      modules: {
        toolbar: [
          ["bold", "italic", "underline"],
          ["blockquote", "code-block"],
          [{ header: 1 }, { header: 2 }],
          [{ list: "ordered" }, { list: "bullet" }],
          ["link", "image"],
          ["clean"],
        ],
      },
    });

    // Set initial content
    if (props.value) {
      quillInstance.root.innerHTML = props.value;
    }

    // Handle content changes
    quillInstance.on("text-change", () => {
      const html = quillInstance!.root.innerHTML;
      props.onChange(html);
    });
  });

  // Update content when props.value changes externally
  createEffect(() => {
    if (
      quillInstance &&
      props.value &&
      quillInstance.root.innerHTML !== props.value
    ) {
      quillInstance.root.innerHTML = props.value;
    }
  });

  return (
    <div class="html-editor-wrapper">
      <div
        ref={editorRef}
        class="rounded-lg border-2 border-slate-200 bg-white overflow-hidden"
        style={{ height: "300px" }}
      ></div>
      <style>{`
        .html-editor-wrapper .ql-container {
          font-size: 16px;
          border: none !important;
        }
        .html-editor-wrapper .ql-editor {
          padding: 12px;
          min-height: 250px;
          font-family: inherit;
        }
        .html-editor-wrapper .ql-toolbar {
          border: none !important;
          border-bottom: 1px solid #e2e8f0 !important;
          background-color: #f8fafc;
        }
        .html-editor-wrapper .ql-toolbar.ql-snow .ql-formats {
          margin-right: 15px;
        }
        .html-editor-wrapper .ql-toolbar.ql-snow .ql-stroke {
          stroke: #64748b;
        }
        .html-editor-wrapper .ql-toolbar.ql-snow .ql-fill {
          fill: #64748b;
        }
        .html-editor-wrapper .ql-toolbar.ql-snow .ql-picker-label {
          color: #64748b;
        }
        .html-editor-wrapper .ql-toolbar.ql-snow .ql-picker-options {
          color: #64748b;
        }
      `}</style>
    </div>
  );
}
