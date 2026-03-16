"use client";

import { useEffect, useState } from "react";
import { Loader2, Upload, FileText, Save } from "lucide-react";
import { toast } from "sonner";
import {
  extractResumeTextFromPdf,
  saveImportedResumeText,
} from "@/actions/resume";
import useFetch from "@/hooks/use-fetch";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

const fileToBase64 = async (file) => {
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  let binary = "";

  for (let i = 0; i < uint8Array.length; i += 1) {
    binary += String.fromCharCode(uint8Array[i]);
  }

  return btoa(binary);
};

export default function ResumeImporter({
  initialText,
  onTextReady,
  onResumeSaved,
}) {
  const [text, setText] = useState(initialText || "");

  const {
    data: extractedData,
    loading: isExtracting,
    fn: extractPdfFn,
  } = useFetch(extractResumeTextFromPdf);
  const {
    data: savedData,
    loading: isSaving,
    fn: saveImportedTextFn,
  } = useFetch(saveImportedResumeText);

  useEffect(() => {
    if (extractedData?.text) {
      setText(extractedData.text);
      onTextReady?.(extractedData.text);
      toast.success("Text extracted from PDF");
    }
  }, [extractedData, onTextReady]);

  useEffect(() => {
    if (savedData?.id) {
      toast.success("Resume text saved");
      onResumeSaved?.(text);
    }
  }, [savedData, text, onResumeSaved]);

  const handlePdfUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }

    try {
      const base64Data = await fileToBase64(file);
      await extractPdfFn({
        fileName: file.name,
        base64Data,
      });
    } catch (error) {
      toast.error(error.message || "Failed to process PDF");
    }
  };

  const handleSaveText = async () => {
    await saveImportedTextFn(text);
  };

  const textLength = text.trim().length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Import Resume (PDF or Paste)
        </CardTitle>
        <CardDescription>
          Upload a PDF to extract text, or paste resume text directly.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent">
            <FileText className="h-4 w-4" />
            {isExtracting ? "Extracting..." : "Upload PDF"}
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handlePdfUpload}
              disabled={isExtracting}
            />
          </label>
          <Button
            type="button"
            variant="outline"
            onClick={handleSaveText}
            disabled={isSaving || textLength < 250}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Resume Text
              </>
            )}
          </Button>
        </div>

        <Textarea
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            onTextReady?.(event.target.value);
          }}
          className="min-h-52"
          placeholder="Paste extracted resume text here..."
        />

        <p className="text-xs text-muted-foreground">
          Current text length: {textLength} characters (minimum 250 to save).
        </p>
      </CardContent>
    </Card>
  );
}
