"use client";

import { useCallback, useRef, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Upload, FileText, X, Loader2 } from "lucide-react";

interface EpicInputProps {
  onSubmit: (text: string) => void;
  isLoading: boolean;
}

export function EpicInput({ onSubmit, isLoading }: EpicInputProps) {
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.name.endsWith(".md") && !file.name.endsWith(".txt")) {
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setText(content);
      setFileName(file.name);
    };
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const clearFile = () => {
    setFileName(null);
    setText("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = () => {
    if (text.trim()) {
      onSubmit(text.trim());
    }
  };

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative rounded-lg border-2 border-dashed transition-colors ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50"
        }`}
      >
        {fileName && (
          <div className="flex items-center gap-2 px-4 pt-3 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span>{fileName}</span>
            <button
              onClick={clearFile}
              className="ml-auto rounded p-0.5 hover:bg-muted"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        <Textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (fileName) setFileName(null);
          }}
          placeholder="Вставьте текст эпика или перетащите .md файл сюда..."
          className="min-h-[300px] resize-y border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm leading-relaxed"
        />

        {!text && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground/50">
            <Upload className="h-8 w-8" />
            <span className="text-sm">Drag & drop .md или .txt файл</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Button
          onClick={handleSubmit}
          disabled={!text.trim() || isLoading}
          className="min-w-[160px]"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Оцениваю...
            </>
          ) : (
            "Оценить эпик"
          )}
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".md,.txt"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />

        <Button
          variant="outline"
          size="lg"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
        >
          <Upload className="mr-2 h-4 w-4" />
          Загрузить файл
        </Button>

        {text && (
          <span className="text-xs text-muted-foreground ml-auto">
            {text.length.toLocaleString()} символов
          </span>
        )}
      </div>
    </div>
  );
}
