// Não precisamos importar o @google/generative-ai para listar, vamos usar a API REST direta

// Substitua pela sua NOVA chave
const API_KEY = "[ENCRYPTION_KEY]"; 

async function listModels() {
  try {
    // Fazemos um GET direto na URL da API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
    
    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();

    console.log("Modelos disponíveis para você:\n");
    data.models.forEach((model) => {
      // Filtra para mostrar apenas os modelos que suportam "generateContent" (que é o que você precisa)
      if (model.supportedGenerationMethods.includes("generateContent")) {
        console.log(`- Nome exato para usar: "${model.name.replace('models/', '')}"`);
        console.log(`  Descrição: ${model.description}`);
        console.log(`  Métodos: ${model.supportedGenerationMethods.join(', ')}\n`);
      }
    });
    
  } catch (error) {
    console.error("Falha ao listar os modelos:", error.message);
  }
}

listModels();