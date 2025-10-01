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
  const [inputFile, setInputFile] = useState<File | null>(null);
  const [outputFile, setOutputFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const onDropInputFile = useCallback((acceptedFiles: File[]) => {
    const uploadedFile = acceptedFiles[0];
    if (uploadedFile) {
      const lower = uploadedFile.name.toLowerCase();
      const isAccepted = lower.endsWith('.xlsx') || lower.endsWith('.xls') || lower.endsWith('.csv');
      if (!isAccepted) {
        toast({
          title: "Formato inválido",
          description: "Selecione .xlsx, .xls ou .csv.",
          variant: "destructive",
        });
        return;
      }
      setInputFile(uploadedFile);
    }
  }, [toast]);

  const onDropOutputFile = useCallback((acceptedFiles: File[]) => {
    const uploadedFile = acceptedFiles[0];
    if (uploadedFile) {
      const lower = uploadedFile.name.toLowerCase();
      const isAccepted = lower.endsWith('.xlsx') || lower.endsWith('.xls') || lower.endsWith('.csv');
      if (!isAccepted) {
        toast({
          title: "Formato inválido",
          description: "Selecione .xlsx, .xls ou .csv.",
          variant: "destructive",
        });
        return;
      }
      setOutputFile(uploadedFile);
    }
  }, [toast]);

  const inputDropzone = useDropzone({
    onDrop: onDropInputFile,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv']
    },
    multiple: false
  });

  const outputDropzone = useDropzone({
    onDrop: onDropOutputFile,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv']
    },
    multiple: false
  });

  const handleAnalyze = async () => {
    if (!inputFile) {
      toast({
        title: "Erro",
        description: "Por favor, selecione o arquivo de entrada antes de prosseguir.",
        variant: "destructive",
      });
      return;
    }
    
    setUploading(true);
    
    try {
      await apiService.uploadExcelBundle(inputFile);
      
      toast({
        title: "Sucesso!",
        description: "Arquivos enviados e processados com sucesso.",
      });
      
      window.dispatchEvent(new Event('data-updated'));
      onUploadSuccess?.();
    } catch (error) {
      console.error('Erro no upload:', error);
      toast({
        title: "Erro",
        description: "Erro ao processar os arquivos. Verifique se contém as abas 'FluxoDeCaixa' e 'DadosContabeis'.",
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

      {/* Upload Areas */}
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Card 1: Planilhas de Entrada (Obrigatório) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Planilhas de Entrada (Obrigatório)</CardTitle>
            <p className="text-sm text-muted-foreground">
              O arquivo deve conter duas abas: <strong>FluxoDeCaixa</strong> e <strong>DadosContabeis</strong>
            </p>
          </CardHeader>
          <CardContent>
            <div
              {...inputDropzone.getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${inputDropzone.isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
              `}
            >
              <input {...inputDropzone.getInputProps()} />
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                
                {inputFile ? (
                  <div className="flex items-center gap-3 text-primary">
                    <FileText className="h-5 w-5" />
                    <span className="font-medium">{inputFile.name}</span>
                    <Check className="h-5 w-5" />
                  </div>
                ) : (
                  <div>
                    <p className="text-lg font-medium text-foreground mb-2">
                      {inputDropzone.isDragActive ? 'Solte o arquivo aqui' : 'Arraste e solte seu arquivo de entrada'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      ou clique para selecionar (.xlsx, .xls, .csv)
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium text-foreground mb-2">Estrutura do arquivo de entrada:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>Aba "FluxoDeCaixa":</strong> Dados do regime de caixa (entradas e saídas efetivas)</li>
                <li>• <strong>Aba "DadosContabeis":</strong> Dados do regime de competência (faturamento e custos)</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Planilhas de Saída (Opcional) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Planilhas de Saída (Opcional)</CardTitle>
            <p className="text-sm text-muted-foreground">
              Arquivo complementar com dados de saída ou projeções
            </p>
          </CardHeader>
          <CardContent>
            <div
              {...outputDropzone.getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${outputDropzone.isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
              `}
            >
              <input {...outputDropzone.getInputProps()} />
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-muted/10 rounded-full flex items-center justify-center">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                </div>
                
                {outputFile ? (
                  <div className="flex items-center gap-3 text-primary">
                    <FileText className="h-5 w-5" />
                    <span className="font-medium">{outputFile.name}</span>
                    <Check className="h-5 w-5" />
                  </div>
                ) : (
                  <div>
                    <p className="text-lg font-medium text-foreground mb-2">
                      {outputDropzone.isDragActive ? 'Solte o arquivo aqui' : 'Arraste e solte seu arquivo de saída'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      ou clique para selecionar (.xlsx, .xls, .csv)
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Button */}
      {inputFile && (
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