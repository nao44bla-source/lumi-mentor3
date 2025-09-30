// SISTEMA LUMI COMPLETO - COM IA INTEGRADA
console.log("💡 Lumi com IA está inicializando...");

// Variável global para as respostas
let respostasLumi = {};

// Carregar respostas do JSON
async function carregarRespostas() {
    try {
        const response = await fetch('responses.json');
        respostasLumi = await response.json();
        console.log("✅ Respostas locais carregadas!");
    } catch (error) {
        console.log("❌ Erro ao carregar respostas, usando padrão...");
        respostasLumi = {
            saudacoes: ["💡 Olá! Eu sou a Lumi! Como posso ajudar?"],
            calma: ["🌬️ Respire fundo: inspire 4s, segure 4s, expire 6s!"],
            default: ["💡 Lumi está aqui para ajudar!"]
        };
    }
}

// Função para resposta aleatória local
function obterRespostaAleatoria(categoria) {
    if (respostasLumi[categoria] && respostasLumi[categoria].length > 0) {
        const respostas = respostasLumi[categoria];
        return respostas[Math.floor(Math.random() * respostas.length)];
    }
    return "💡 Lumi está aqui para ajudar! Conte-me mais...";
}

// ==================== SISTEMA DE IA HÍBRIDO ====================
async function lumiEntenderMensagem(mensagem) {
    const msg = mensagem.toLowerCase().trim();
    console.log("💡 Lumi analisando:", msg);
    
    // 1. TENTA IA ONLINE PRIMEIRO
    try {
        mostrarLoading(true);
        atualizarStatus('thinking', '💭 Lumi está pensando...');
        
        const respostaIA = await tentarConexaoIA(mensagem);
        if (respostaIA && !respostaIA.includes('offline')) {
            atualizarStatus('online', '🌐 Lumi Online - DeepSeek');
            return respostaIA;
        }
    } catch (error) {
        console.log("❌ IA offline:", error.message);
    } finally {
        mostrarLoading(false);
    }
    
    // 2. FALLBACK PARA RESPOSTAS LOCAIS
    atualizarStatus('offline', '💡 Lumi Offline - Modo Local');
    return obterRespostaOffline(msg);
}

// Tentar conectar com a IA online
async function tentarConexaoIA(mensagem) {
    try {
        console.log('🌐 Tentando conectar com IA...');
        
        // URL dinâmica para desenvolvimento/produção
        const apiUrl = window.location.hostname === 'localhost' 
            ? '/api/chat' 
            : '/api/chat';
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ mensagem: mensagem }),
            timeout: 8000
        });

        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.resposta) {
            console.log('✅ Resposta IA recebida');
            return data.resposta;
        } else {
            throw new Error('Resposta vazia');
        }

    } catch (error) {
        console.log('❌ Erro na IA:', error.message);
        
        // Pequeno delay para não parecer instantâneo
        await new Promise(resolve => setTimeout(resolve, 1000));
        return null;
    }
}

// Respostas locais de fallback
function obterRespostaOffline(msg) {
    // Saudações
    if (msg === 'oi' || msg === 'olá' || msg === 'ola' || 
        msg.includes('oi ') || msg.includes('olá ') || msg.includes('ola ')) {
        return obterRespostaAleatoria('saudacoes');
    }
    
    // Ansiedade
    if (msg.includes('ansioso') || msg.includes('ansiedade') || 
        msg.includes('nervoso') || msg.includes('estress') ||
        msg.includes('estou ansioso') || msg.includes('to ansioso')) {
        return obterRespostaAleatoria('calma');
    }
    
    // Estudos
    if (msg.includes('estud') || msg.includes('prova') || 
        msg.includes('aprender') || msg.includes('matematica') ||
        msg.includes('matéria') || msg.includes('aula')) {
        return obterRespostaAleatoria('tecnicas_estudo');
    }
    
    // Organização
    if (msg.includes('organiz') || msg.includes('tarefa') || 
        msg.includes('tempo') || msg.includes('cronograma')) {
        return obterRespostaAleatoria('organizacao');
    }
    
    // Motivação
    if (msg.includes('desanim') || msg.includes('cansado') || 
        msg.includes('motivação') || msg.includes('motivacao')) {
        return obterRespostaAleatoria('motivacao');
    }
    
    return obterRespostaAleatoria('default');
}

// Função para mostrar/ocultar loading
function mostrarLoading(mostrar) {
    const sendBtn = document.getElementById('send-btn');
    const userInput = document.getElementById('user-input');
    
    if (sendBtn && userInput) {
        if (mostrar) {
            sendBtn.innerHTML = '⏳';
            sendBtn.disabled = true;
            userInput.disabled = true;
        } else {
            sendBtn.innerHTML = 'Enviar';
            sendBtn.disabled = false;
            userInput.disabled = false;
        }
    }
}

// Função para atualizar status da conexão
function atualizarStatus(status, texto) {
    const statusElement = document.getElementById('chat-status');
    const statusText = document.getElementById('status-text');
    
    if (statusElement && statusText) {
        statusElement.className = `chat-status ${status}`;
        statusText.textContent = texto;
    }
}

// ==================== FUNÇÕES BÁSICAS ====================
function adicionarMensagem(texto, ehUsuario) {
    const chatMessages = document.getElementById('chat-messages');
    
    if (!chatMessages) {
        console.error("❌ chat-messages não encontrado!");
        return;
    }
    
    const divMensagem = document.createElement('div');
    divMensagem.className = `message ${ehUsuario ? 'user-message' : 'bot-message'}`;
    divMensagem.textContent = texto;
    chatMessages.appendChild(divMensagem);
    
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function enviarMensagem() {
    const userInput = document.getElementById('user-input');
    const mensagem = userInput.value.trim();
    
    if (mensagem.length > 0) {
        adicionarMensagem(mensagem, true);
        userInput.value = '';
        
        try {
            const resposta = await lumiEntenderMensagem(mensagem);
            adicionarMensagem(resposta, false);
        } catch (error) {
            console.error('Erro:', error);
            adicionarMensagem('💡 Lumi está com dificuldades. Tente novamente!', false);
        }
    }
}

// ==================== SISTEMA DE HUMOR ====================
function configurarSistemaHumor() {
    const botoesHumor = document.querySelectorAll('.botao-humor');
    const respostaHumor = document.getElementById('resposta-humor');
    
    if (botoesHumor.length === 0) return;

    const respostasHumor = {
        'excelente': '🎉 Que ótimo! Lumi fica radiante por você!',
        'bem': '😊 Fico contente! Vamos manter essa energia!',
        'normal': '😐 Dias normais fazem parte da jornada!',
        'ansioso': '🌬️ Respire fundo comigo! Você consegue!',
        'triste': '🤗 Lumi está aqui por você.'
    };

    function salvarHumor(humor) {
        let historico = JSON.parse(localStorage.getItem('lumi_humor') || '[]');
        historico.push({
            humor: humor,
            data: new Date().toLocaleDateString('pt-BR'),
            hora: new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})
        });
        localStorage.setItem('lumi_humor', JSON.stringify(historico));
    }

    function carregarHistoricoHumor() {
        const listaHumor = document.getElementById('lista-humor');
        if (!listaHumor) return;
        
        const historico = JSON.parse(localStorage.getItem('lumi_humor') || '[]');
        const ultimos = historico.slice(-5).reverse();
        
        listaHumor.innerHTML = ultimos.map(item => `
            <div style="padding: 10px; margin: 5px; background: #f0f8ff; border-radius: 5px;">
                <strong>${item.data} ${item.hora}</strong><br>
                ${obterEmojiHumor(item.humor)} ${item.humor}
            </div>
        `).join('');
    }

    botoesHumor.forEach(botao => {
        botao.addEventListener('click', function() {
            const humor = this.getAttribute('data-humor');
            salvarHumor(humor);
            
            if (respostaHumor) {
                respostaHumor.innerHTML = `
                    <strong>Humor registrado: ${humor} ${obterEmojiHumor(humor)}</strong><br>
                    ${respostasHumor[humor]}
                `;
            }
            
            carregarHistoricoHumor();
        });
    });

    carregarHistoricoHumor();
}

function obterEmojiHumor(humor) {
    const emojis = { 'excelente': '😄', 'bem': '😊', 'normal': '😐', 'ansioso': '😰', 'triste': '😔' };
    return emojis[humor] || '😐';
}

// ==================== INICIALIZAÇÃO ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log("💡 Lumi com IA está pronta!");
    
    carregarRespostas();
    
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    
    if (sendBtn) sendBtn.addEventListener('click', enviarMensagem);
    if (userInput) {
        userInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') enviarMensagem();
        });
        userInput.focus();
    }
    
    configurarSistemaHumor();
    configurarAbas();
    
    // Status inicial
    atualizarStatus('online', '💡 Lumi Pronta - Testando Conexão...');
    
    setTimeout(() => {
        adicionarMensagem('💡 Olá! Sou a Lumi com IA integrada. Como posso ajudar?', false);
        atualizarStatus('online', '🌐 Lumi Online - DeepSeek');
    }, 1000);
});

function configurarAbas() {
    const botoesMenu = document.querySelectorAll('.botao-menu');
    const abas = document.querySelectorAll('.aba');
    
    if (botoesMenu.length > 0) {
        botoesMenu.forEach(botao => {
            botao.addEventListener('click', function() {
                const abaAlvo = this.getAttribute('data-aba');
                
                botoesMenu.forEach(b => b.classList.remove('ativo'));
                abas.forEach(aba => aba.classList.remove('ativa'));
                
                this.classList.add('ativo');
                const abaElemento = document.getElementById(abaAlvo);
                if (abaElemento) abaElemento.classList.add('ativa');
            });
        });
    }
}