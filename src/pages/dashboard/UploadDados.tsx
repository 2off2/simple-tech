import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { RAW_BASE_URL } from "@/lib/api";
import { ReportRenderer } from "@/components/ReportRenderer";
interface UploadDadosProps {
  onUploadSuccess?: () => void;
}
export function UploadDados({
  onUploadSuccess
}: UploadDadosProps) {
  const [inputFiles, setInputFiles] = useState<File[]>([]);
  const [outputFiles, setOutputFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("");
  const [reportLoading, setReportLoading] = useState(false);
  const [reportMarkdown, setReportMarkdown] = useState<string | null>(null);
  const {
    toast
  } = useToast();
  const removeInputFile = useCallback((index: number) => {
    setInputFiles(prev => prev.filter((_, i) => i !== index));
  }, []);
  const removeOutputFile = useCallback((index: number) => {
    setOutputFiles(prev => prev.filter((_, i) => i !== index));
  }, []);
  const onDropInputFile = useCallback((acceptedFiles: File[]) => {
    const valid = acceptedFiles.filter(f => {
      const lower = f.name.toLowerCase();
      return lower.endsWith('.xlsx') || lower.endsWith('.xls') || lower.endsWith('.csv');
    });
    if (valid.length !== acceptedFiles.length) {
      toast({
        title: "Formato inválido",
        description: "Selecione .xlsx, .xls ou .csv.",
        variant: "destructive"
      });
    }
    if (valid.length > 0) {
      setInputFiles(prev => [...prev, ...valid]);
    }
  }, [toast]);
  const onDropOutputFile = useCallback((acceptedFiles: File[]) => {
    const valid = acceptedFiles.filter(f => {
      const lower = f.name.toLowerCase();
      return lower.endsWith('.xlsx') || lower.endsWith('.xls') || lower.endsWith('.csv');
    });
    if (valid.length !== acceptedFiles.length) {
      toast({
        title: "Formato inválido",
        description: "Selecione .xlsx, .xls ou .csv.",
        variant: "destructive"
      });
    }
    if (valid.length > 0) {
      setOutputFiles(prev => [...prev, ...valid]);
    }
  }, [toast]);
  const inputDropzone = useDropzone({
    onDrop: onDropInputFile,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv']
    },
    multiple: true
  });
  const outputDropzone = useDropzone({
    onDrop: onDropOutputFile,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv']
    },
    multiple: true
  });
  const handleAnalyze = async () => {
    // Verificação inicial
    if (inputFiles.length === 0 && outputFiles.length === 0) {
      toast({
        title: "Erro",
        description: "Por favor, selecione ao menos um arquivo (entrada ou saída).",
        variant: "destructive"
      });
      return;
    }

    // Iniciar upload
    setUploading(true);
    setUploadProgress(0);
    setUploadStatus("Iniciando upload...");

    const filesToSend: File[] = [...inputFiles, ...outputFiles];
    const totalFiles = filesToSend.length;
    const hasOutflow = outputFiles.length > 0;

    try {
      // Loop para enviar arquivos individualmente
      for (let i = 0; i < filesToSend.length; i++) {
        const file = filesToSend[i];
        const fileNumber = i + 1;
        
        setUploadStatus(`A enviar ${fileNumber} de ${totalFiles}: ${file.name}`);

        // Criar FormData para envio individual
        const formData = new FormData();
        formData.append('file', file);
        formData.append('has_outflow', hasOutflow.toString());

        try {
          // Envio individual via fetch
          const response = await fetch(`${RAW_BASE_URL}/api/upload-excel-bundle-multi`, {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            throw new Error(`Erro no upload de ${file.name}: ${response.statusText}`);
          }

          // Atualizar progresso
          const progress = Math.round(((fileNumber) / totalFiles) * 100);
          setUploadProgress(progress);
          
        } catch (fileError) {
          // Gestão de erros individuais
          const errorMsg = fileError instanceof Error ? fileError.message : "Erro desconhecido";
          setUploadStatus(`Erro no ficheiro ${file.name}: ${errorMsg}`);
          
          toast({
            title: "Erro no upload",
            description: `Falha ao enviar ${file.name}. ${errorMsg}`,
            variant: "destructive"
          });
          
          throw fileError; // Interromper o loop
        }
      }

      // Finalizar com sucesso
      setUploadStatus("Concluído! Todos os arquivos foram enviados com sucesso.");
      setUploadProgress(100);
      
      toast({
        title: "Sucesso!",
        description: "Arquivos enviados e processados com sucesso."
      });
      
      console.log('Disparando evento data-updated...');
      window.dispatchEvent(new Event('data-updated'));
      console.log('Evento data-updated disparado!');
      
      onUploadSuccess?.();
      
    } catch (error) {
      console.error('Erro no upload:', error);
      const errorMsg = error instanceof Error ? error.message : "Erro desconhecido";
      setUploadStatus(`Erro: ${errorMsg}`);
      
      toast({
        title: "Erro",
        description: "Erro ao processar os arquivos. Verifique se os arquivos estão no formato correto.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };
  const gerarRelatorio = async () => {
    try {
      setReportLoading(true);
      const context = {
        inputFiles: inputFiles.map(f => f.name),
        outputFiles: outputFiles.map(f => f.name),
        totalArquivos: inputFiles.length + outputFiles.length
      };
      
      // Usar fetch direto ao invés de apiService
      const response = await fetch(`${RAW_BASE_URL}/api/generate-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          page: "UploadDados",
          context
        })
      });

      if (!response.ok) {
        throw new Error(`Erro ao gerar relatório: ${response.statusText}`);
      }

      const res = await response.json();
      setReportMarkdown(res.report_markdown);
      
      toast({
        title: "Relatório gerado"
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro desconhecido";
      toast({
        title: "Erro ao gerar relatório",
        description: msg,
        variant: "destructive"
      });
    } finally {
      setReportLoading(false);
    }
  };
  return <div className="space-y-6">
      <div className="flex items-start justify-between">
        <h1 className="text-3xl font-bold text-foreground">Importe seus dados financeiros</h1>
        
      </div>
      <p className="text-muted-foreground mt-2">
        Envie seu arquivo Excel para começar a análise financeira completa
      </p>

      {/* Upload Areas */}
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Card 1: Planilhas de Entrada (Obrigatório) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Planilhas de Entrada (Obrigatório)</CardTitle>
            <p className="text-sm text-muted-foreground">
              Arquivos de entrada com dados financeiros (entradas e saídas)
            </p>
          </CardHeader>
          <CardContent>
            <div {...inputDropzone.getRootProps()} className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${uploading ? 'opacity-50 pointer-events-none' : ''}
                ${inputDropzone.isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
              `}>
              <input {...inputDropzone.getInputProps()} disabled={uploading} />
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                
                {inputFiles.length > 0 ? <div className="flex flex-col items-center gap-2 w-full">
                    <div className="flex items-center gap-3 text-primary">
                      <FileText className="h-5 w-5" />
                      <span className="font-medium">{inputFiles.length} arquivo(s) selecionado(s)</span>
                      <Check className="h-5 w-5" />
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center w-full">
                      {inputFiles.map((f, idx) => <div key={idx} className="flex items-center gap-2 bg-muted/60 rounded-full px-3 py-1">
                          <span className="text-sm text-foreground/80 max-w-[220px] truncate">{f.name}</span>
                          <button type="button" aria-label={`Remover ${f.name}`} onClick={e => {
                      e.stopPropagation();
                      removeInputFile(idx);
                    }} className="inline-flex items-center justify-center rounded-full hover:bg-muted p-1">
                            <X className="h-4 w-4" />
                          </button>
                        </div>)}
                    </div>
                  </div> : <div>
                    <p className="text-lg font-medium text-foreground mb-2">
                      {inputDropzone.isDragActive ? 'Solte o arquivo aqui' : 'Arraste e solte seu arquivo de entrada'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      ou clique para selecionar (.xlsx, .xls, .csv)
                    </p>
                  </div>}
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium text-foreground mb-2">Estrutura do arquivo de entrada:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>Coluna "Data":</strong> Data da transação</li>
                <li>• <strong>Coluna "Descrição":</strong> Descrição da transação</li>
                <li>• <strong>Coluna "Entrada" ou "Saída":</strong> Valores monetários</li>
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
            <div {...outputDropzone.getRootProps()} className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${uploading ? 'opacity-50 pointer-events-none' : ''}
                ${outputDropzone.isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
              `}>
              <input {...outputDropzone.getInputProps()} disabled={uploading} />
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-muted/10 rounded-full flex items-center justify-center">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                </div>
                
                {outputFiles.length > 0 ? <div className="flex flex-col items-center gap-2 w-full">
                    <div className="flex items-center gap-3 text-primary">
                      <FileText className="h-5 w-5" />
                      <span className="font-medium">{outputFiles.length} arquivo(s) selecionado(s)</span>
                      <Check className="h-5 w-5" />
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center w-full">
                      {outputFiles.map((f, idx) => <div key={idx} className="flex items-center gap-2 bg-muted/60 rounded-full px-3 py-1">
                          <span className="text-sm text-foreground/80 max-w-[220px] truncate">{f.name}</span>
                          <button type="button" aria-label={`Remover ${f.name}`} onClick={e => {
                      e.stopPropagation();
                      removeOutputFile(idx);
                    }} className="inline-flex items-center justify-center rounded-full hover:bg-muted p-1">
                            <X className="h-4 w-4" />
                          </button>
                        </div>)}
                    </div>
                  </div> : <div>
                    <p className="text-lg font-medium text-foreground mb-2">
                      {outputDropzone.isDragActive ? 'Solte o arquivo aqui' : 'Arraste e solte seu arquivo de saída'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      ou clique para selecionar (.xlsx, .xls, .csv)
                    </p>
                  </div>}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feedback de Upload */}
      {uploading && (
        <div className="max-w-4xl mx-auto space-y-4 p-6 bg-muted/30 rounded-lg border">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-foreground font-medium">{uploadStatus}</span>
              <span className="text-muted-foreground">{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        </div>
      )}

      {/* Status Final */}
      {!uploading && uploadStatus && uploadProgress === 100 && (
        <div className="max-w-4xl mx-auto p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
          <p className="text-sm text-green-700 dark:text-green-400 font-medium">
            ✓ {uploadStatus}
          </p>
        </div>
      )}

      {/* Action Button */}
      {(inputFiles.length > 0 || outputFiles.length > 0) && <div className="flex justify-center">
          <Button onClick={handleAnalyze} disabled={uploading} size="lg" className="px-8">
            {uploading ? 'Processando...' : 'Analisar Dados'}
          </Button>
        </div>}

      {/* Relatório */}
      {reportMarkdown && (
        <div className="max-w-4xl mx-auto">
          <ReportRenderer 
            markdown={reportMarkdown}
            description="Análise dos dados enviados"
          />
        </div>
      )}
    </div>;
}