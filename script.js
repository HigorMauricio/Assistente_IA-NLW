const apiKeyInput = document.getElementById("apiKey");
const gameSelect = document.getElementById("gameSelect");
const questionInput = document.getElementById("question");
const aiResponse = document.getElementById("aiResponse");
const askButton = document.getElementById("askButton")
const form = document.querySelector("form");

const markdwonToHTML = (text) => {
    const converter = new showdown.Converter();
    return converter.makeHtml(text);
}

const perguntarIA = async (question, game, apiKey) => {
    const model = "gemini-2.5-flash";
    const geminiURL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
    const pergunta = `
        ## Especialidade
        Você é um especialista assistente de meta para o jogo ${game}.

        ## Tarefa
        Você deve responder as perguntas do usuário com base no seu conhecimento do jogo, estratégias, build e dicas.

        ## Regras
        - Se você não sabe a resposta, responda com "Não sei te informar" e não tente inventar uma resposta.
        - Se a pergunta não está relacionada com o jogo responda "Essa pergunta não está relacionada ao jogo ${game}".
        - Considere a data atual ${new Date().toLocaleDateString()}.
        - Faça pesquisas atualizadas, sempre buscando a ultima versão do jogo, baseada na data atual.
        - Nunca responda itens que você não tenha certeza de que exista na ultima versão do jogo.

        ## Resposta
        - Economize na resposta, seja direto e responda com no máximo 500 caracteres. Responda em Markdown, preferencialmente em tópicos.
        - Não faça saudações ou despedidas.
        - Não responda além da pergunta feita.
        
        ## Exemplo de resposta
        pergunta do usuário: Quais os itens necessários para fazer o olho do ender no minecraft?

        resposta: De acordo com a ultima versão são necessários 2 itens: \n\n\ -**Pérola do Ender(Ender Pearl)**: Conseguido ao matar um Enderman;\n -**Pó de Blaze(Blaze Powder)**: Conseguido ao matar um Blaze;

        ---

        Aqui está a pergunta do usuário: ${question}
    `

    const contents = [{
        role: "User",
        parts: [{
            text: pergunta
        }]
    }]

    const tools = [{
        google_search: {}
    }]

    //chamada API
    const resposta = await fetch(geminiURL, {
        method: 'POST', 
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contents,
            tools
        })
    })

    const data = await resposta.json();
    return data.candidates[0].content.parts[0].text;
}

const enviar_formulario = async (event) => {
    event.preventDefault();
    const apiKey = apiKeyInput.value;
    const game = gameSelect.value;
    const question = questionInput.value;

    if(apiKey == '' || game == '' || question == ''){
        alert("Por favor, preencha todos os campos");
        return;
    }

    askButton.disabled = true;
    askButton.textContent = "Perguntando...";
    askButton.classList.add("loading");

    try{
        //perguntar para a IA
        const text = await perguntarIA(question, game, apiKey);
        aiResponse.querySelector(".response-content").innerHTML = markdwonToHTML(text);
        aiResponse.classList.remove("hidden")
    } catch(error){
        console.log("Error: ", error)
    } finally{
        askButton.disabled = false;
        askButton.textContent = "Perguntar";
        askButton.classList.remove("loading");
    }
}

form.addEventListener("submit", enviar_formulario);

