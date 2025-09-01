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
  const [cashflowFile, setCashflowFile] = useState<File | null>(null);
  const [accountingFile, setAccountingFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const onDropCashflow = useCallback((acceptedFiles: File[]) => {
    const uploadedFile = acceptedFiles[0];
    if (uploadedFile) {
      setCashflowFile(uploadedFile);
    }
  }, []);

  const onDropAccounting = useCallback((acceptedFiles: File[]) => {
    const uploadedFile = acceptedFiles[0];
    if (uploadedFile) {
      setAccountingFile(uploadedFile);
      
      // Simular pré-visualização dos dados do arquivo contábil
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

  const { getRootProps: getCashflowRootProps, getInputProps: getCashflowInputProps, isDragActive: isCashflowDragActive } = useDropzone({
    onDrop: onDropCashflow,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    multiple: false
  });

  const { getRootProps: getAccountingRootProps, getInputProps: getAccountingInputProps, isDragActive: isAccountingDragActive } = useDropzone({
    onDrop: onDropAccounting,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    multiple: false
  });

  const handleAnalyze = async () => {
    if (!cashflowFile || !accountingFile) {
      toast({
        title: "Erro",
        description: "Por favor, selecione ambos os arquivos antes de prosseguir.",
        variant: "destructive",
      });
      return;
    }
    
    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('cashflow_file', cashflowFile);
      formData.append('accounting_file', accountingFile);
      
      const response = await fetch('http://localhost:8000/api/data/upload_bundle', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        toast({
          title: "Sucesso!",
          description: "Arquivos enviados e processados com sucesso.",
        });
        // Chama callback para indicar sucesso no upload
        onUploadSuccess?.();
      } else {
        throw new Error('Erro no upload');
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao processar os arquivos. Tente novamente.",
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
          Envie seus arquivos CSV para começar a análise financeira completa
        </p>
      </div>

      {/* Upload Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
        {/* Fluxo de Caixa */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Arquivo de Fluxo de Caixa (CSV)</CardTitle>
            <p className="text-sm text-muted-foreground">Regime de Caixa</p>
          </CardHeader>
          <CardContent>
            <div
              {...getCashflowRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                ${isCashflowDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
              `}
            >
              <input {...getCashflowInputProps()} />
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                
                {cashflowFile ? (
                  <div className="flex items-center gap-2 text-primary">
                    <FileText className="h-4 w-4" />
                    <span className="font-medium text-sm">{cashflowFile.name}</span>
                    <Check className="h-4 w-4" />
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">
                      {isCashflowDragActive ? 'Solte o arquivo aqui' : 'Arraste e solte o CSV'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ou clique para selecionar
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dados Contábeis */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Arquivo Contábil (CSV)</CardTitle>
            <p className="text-sm text-muted-foreground">Regime de Competência</p>
          </CardHeader>
          <CardContent>
            <div
              {...getAccountingRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                ${isAccountingDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
              `}
            >
              <input {...getAccountingInputProps()} />
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                
                {accountingFile ? (
                  <div className="flex items-center gap-2 text-primary">
                    <FileText className="h-4 w-4" />
                    <span className="font-medium text-sm">{accountingFile.name}</span>
                    <Check className="h-4 w-4" />
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">
                      {isAccountingDragActive ? 'Solte o arquivo aqui' : 'Arraste e solte o CSV'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ou clique para selecionar
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
      {cashflowFile && accountingFile && (
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