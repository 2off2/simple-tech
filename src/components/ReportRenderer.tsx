import ReactMarkdown from 'react-markdown';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

interface ReportRendererProps {
  markdown: string;
  title?: string;
  description?: string;
}

export function ReportRenderer({ 
  markdown, 
  title = "Relatório Executivo",
  description = "Análise detalhada gerada por IA"
}: ReportRendererProps) {
  return (
    <Card className="shadow-card border-primary/20">
      <CardHeader className="border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-foreground">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="prose prose-sm max-w-none dark:prose-invert
          prose-headings:text-foreground prose-headings:font-bold
          prose-h1:text-3xl prose-h1:mb-4 prose-h1:mt-6
          prose-h2:text-2xl prose-h2:mb-3 prose-h2:mt-5 prose-h2:border-b prose-h2:border-border prose-h2:pb-2
          prose-h3:text-xl prose-h3:mb-2 prose-h3:mt-4
          prose-p:text-foreground prose-p:leading-7 prose-p:mb-4
          prose-strong:text-foreground prose-strong:font-semibold
          prose-em:text-muted-foreground
          prose-ul:list-disc prose-ul:ml-6 prose-ul:my-4
          prose-ol:list-decimal prose-ol:ml-6 prose-ol:my-4
          prose-li:text-foreground prose-li:mb-2
          prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-muted-foreground
          prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono
          prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto
          prose-table:border-collapse prose-table:w-full prose-table:my-4
          prose-th:border prose-th:border-border prose-th:bg-muted prose-th:p-3 prose-th:text-left prose-th:font-semibold
          prose-td:border prose-td:border-border prose-td:p-3
          prose-a:text-primary prose-a:underline prose-a:underline-offset-2 hover:prose-a:text-primary/80
          prose-hr:border-border prose-hr:my-6
        ">
          <ReactMarkdown>{markdown}</ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  );
}
