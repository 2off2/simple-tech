import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface UploadDadosProps {
  onUploadSuccess?: () => void;
}

export function UploadDados({ onUploadSuccess }: UploadDadosProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const uploadedFile = acceptedFiles[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      
      // Simular pré-visualização dos dados
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const lines = text.split('\n');
        const headers = lines[0]?.split(',') || [];
        const preview = lines.slice(1, 6).map(line => {
          const values = line.split(',');
          return headers.reduce((obj, header, index) => ({
            ...obj,
            [header]: values[index] || ''
          }), {});
        });
        setPreviewData(preview);
      };
      reader.readAsText(uploadedFile);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    multiple: false
  });

  const handleAnalyze = async () => {
    if (!file) return;
    
    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('http://localhost:8000/api/data/upload_csv', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        toast({
          title: "Sucesso!",
          description: "Dados enviados e processados com sucesso.",
        });
        // Chama callback para indicar sucesso no upload
        onUploadSuccess?.();
      } else {
        throw new Error('Erro no upload');
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao processar o arquivo. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Importe seus dados de fluxo de caixa</h1>
        <p className="text-muted-foreground mt-2">
          Envie seu arquivo CSV para começar a análise financeira
        </p>
      </div>

      {/* Upload Area */}
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8">
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
            `}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              
              {file ? (
                <div className="flex items-center gap-2 text-primary">
                  <FileText className="h-5 w-5" />
                  <span className="font-medium">{file.name}</span>
                  <Check className="h-5 w-5" />
                </div>
              ) : (
                <div>
                  <p className="text-lg font-medium text-foreground mb-2">
                    {isDragActive ? 'Solte o arquivo aqui' : 'Arraste e solte seu arquivo CSV'}
                  </p>
                  <p className="text-muted-foreground">
                    ou clique para selecionar um arquivo
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      {previewData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              Pré-visualização dos dados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    {Object.keys(previewData[0] || {}).map((header) => (
                      <th key={header} className="text-left p-2 font-medium text-foreground">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, index) => (
                    <tr key={index} className="border-b border-border/50">
                      {Object.values(row).map((value, colIndex) => (
                        <td key={colIndex} className="p-2 text-muted-foreground">
                          {value as string}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Button */}
      {file && (
        <div className="flex justify-center">
          <Button
            onClick={handleAnalyze}
            disabled={uploading}
            size="lg"
            className="px-8"
          >
            {uploading ? 'Processando...' : 'Analisar Dados'}
          </Button>
        </div>
      )}
    </div>
  );
}