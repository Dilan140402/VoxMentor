import { useState, useRef } from "react";
import { Upload, FileText, X, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface FileUploadProps {
  onFileContent: (content: string) => void;
}

export function FileUpload({ onFileContent }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validar tamaño (5MB máximo)
    const maxSize = 5 * 1024 * 1024; // 5MB en bytes
    if (selectedFile.size > maxSize) {
      setError("El archivo no debe superar los 5MB");
      setFile(null);
      return;
    }

    // Validar tipo de archivo
    const validTypes = ["text/plain", "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!validTypes.includes(selectedFile.type) && !selectedFile.name.endsWith('.txt')) {
      setError("Solo se permiten archivos de texto (.txt, .pdf, .doc, .docx)");
      setFile(null);
      return;
    }

    setError("");
    setFile(selectedFile);

    // Leer contenido del archivo
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      onFileContent(content);
    };
    reader.readAsText(selectedFile);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setError("");
    onFileContent("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.pdf,.doc,.docx"
        onChange={handleFileChange}
        className="hidden"
      />

      <AnimatePresence mode="wait">
        {!file ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClick}
            className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-cyan-500 hover:bg-cyan-500/5 transition-all"
          >
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-300 font-medium mb-1">
              Sube tu texto de práctica
            </p>
            <p className="text-gray-500 text-sm">
              Archivos .txt, .pdf, .doc (máx. 5MB)
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="file"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-emerald-300 font-medium truncate">{file.name}</p>
              <p className="text-emerald-200 text-xs">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <button
              onClick={handleRemoveFile}
              className="p-1 hover:bg-red-500/20 rounded transition-colors"
            >
              <X className="w-5 h-5 text-gray-400 hover:text-red-400" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-400 text-sm mt-2"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}
