// Teste específico para verificar se o frontend está recebendo os dados corretos
console.log('=== TESTE FRONTEND DEBUG ===');

async function testFrontendDebug() {
  try {
    console.log('1. Testando API de estatísticas...');
    const statsResponse = await fetch('https://simple-tech-kogdf99g5-jairs-projects-1526a6e6.vercel.app/api/data/statistics');
    const stats = await statsResponse.json();
    console.log('Estatísticas:', stats);
    
    console.log('\n2. Testando API de dados processados (como o frontend faz)...');
    const dataResponse = await fetch('https://simple-tech-kogdf99g5-jairs-projects-1526a6e6.vercel.app/api/data/view_processed?start_date=1900-01-01&end_date=2100-12-31&order=asc&limit=5000');
    const data = await dataResponse.json();
    console.log('Dados processados (filtrados):', data);
    
    console.log('\n3. Simulando cálculo do frontend...');
    if (Array.isArray(data)) {
      const totalEntradas = data.reduce((sum, item) => sum + (item.entrada || 0), 0);
      const totalSaidas = data.reduce((sum, item) => sum + (item.saida || 0), 0);
      const fluxoLiquido = totalEntradas - totalSaidas;
      
      console.log('Resultados do cálculo:');
      console.log('  Total Entradas:', totalEntradas);
      console.log('  Total Saídas:', totalSaidas);
      console.log('  Fluxo Líquido:', fluxoLiquido);
      
      console.log('\n4. Verificando transações com saída...');
      const saidas = data.filter(item => item.saida > 0);
      console.log('Transações com saída:', saidas.length);
      if (saidas.length > 0) {
        console.log('Primeira transação de saída:', saidas[0]);
        console.log('Última transação de saída:', saidas[saidas.length - 1]);
      }
      
      console.log('\n5. Verificando estrutura dos dados...');
      if (data.length > 0) {
        console.log('Primeiro item:', data[0]);
        console.log('Campos disponíveis:', Object.keys(data[0]));
      }
    } else {
      console.log('ERRO: Dados não são um array:', data);
    }
    
  } catch (error) {
    console.error('Erro:', error);
  }
}

testFrontendDebug();
