import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/lib/api";

interface UploadDadosProps {
  onUploadSuccess?: () => void;
}

export function UploadDados({ onUploadSuccess }: UploadDadosProps) {
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const onDropFile = useCallback((acceptedFiles: File[]) => {
    const uploadedFile = acceptedFiles[0];
    if (uploadedFile) {
      // Verificar se é arquivo Excel
      const isExcel = uploadedFile.name.endsWith('.xlsx') || 
                     uploadedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      
      if (!isExcel) {
        toast({
          title: "Formato inválido",
          description: "Por favor, selecione um arquivo Excel (.xlsx).",
          variant: "destructive",
        });
        return;
      }
      
      setExcelFile(uploadedFile);
    }
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDropFile,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    multiple: false
  });

  const handleAnalyze = async () => {
    if (!excelFile) {
      toast({
        title: "Erro",
        description: "Por favor, selecione o arquivo Excel antes de prosseguir.",
        variant: "destructive",
      });
      return;
    }
    
    setUploading(true);
    
    try {
      await apiService.uploadExcelBundle(excelFile);
      
      toast({
        title: "Sucesso!",
        description: "Arquivo enviado e processado com sucesso.",
      });
      
      onUploadSuccess?.();
    } catch (error) {
      console.error('Erro no upload:', error);
      toast({
        title: "Erro",
        description: "Erro ao processar o arquivo. Verifique se contém as abas 'FluxoDeCaixa' e 'DadosContabeis'.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Importe seus dados financeiros</h1>
        <p className="text-muted-foreground mt-2">
          Envie seu arquivo Excel para começar a análise financeira completa
        </p>
      </div>

      {/* Upload Area */}
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Arquivo de Dados da Empresa (.xlsx)</CardTitle>
            <p className="text-sm text-muted-foreground">
              O arquivo deve conter duas abas: <strong>FluxoDeCaixa</strong> e <strong>DadosContabeis</strong>
            </p>
          </CardHeader>
          <CardContent>
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
                
                {excelFile ? (
                  <div className="flex items-center gap-3 text-primary">
                    <FileText className="h-5 w-5" />
                    <span className="font-medium">{excelFile.name}</span>
                    <Check className="h-5 w-5" />
                  </div>
                ) : (
                  <div>
                    <p className="text-lg font-medium text-foreground mb-2">
                      {isDragActive ? 'Solte o arquivo aqui' : 'Arraste e solte seu arquivo Excel'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      ou clique para selecionar (.xlsx)
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Instruções */}
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium text-foreground mb-2">Estrutura do arquivo Excel:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>Aba "FluxoDeCaixa":</strong> Dados do regime de caixa (entradas e saídas efetivas)</li>
                <li>• <strong>Aba "DadosContabeis":</strong> Dados do regime de competência (faturamento e custos)</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Button */}
      {excelFile && (
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