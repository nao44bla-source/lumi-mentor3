// api/chat.js - Backend para DeepSeek API
export default async function handler(req, res) {
    // Configurar CORS para permitir requisições
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Lidar com preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Permitir apenas requisições POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    try {
        const { mensagem } = req.body;

        if (!mensagem) {
            return res.status(400).json({ error: 'Mensagem é obrigatória' });
        }

        console.log('📨 Mensagem recebida:', mensagem.substring(0, 50) + '...');

        // 🔐 CHAVE DA DEEPSEEK (vamos configurar depois)
        const apiKey = process.env.DEEPSEEK_API_KEY;

        if (!apiKey) {
            // Modo de desenvolvimento - respostas simuladas
            console.log('🔧 Modo desenvolvimento - simulando IA');
            const respostasSimuladas = [
                "💡 Olá! Esta é uma resposta da DeepSeek! Como posso ajudar seus estudos hoje?",
                "🌬️ Entendo que pode estar se sentindo ansioso. Que tal uma pausa para respirar?",
                "📚 Para matemática, recomendo praticar com exercícios diários!",
                "🎯 Técnica Pomodoro: 25min foco total, 5min descanso!",
                "🤗 Lumi aqui! Dias desafiadores são oportunidades de crescimento!"
            ];
            
            const resposta = respostasSimuladas[Math.floor(Math.random() * respostasSimuladas.length)];
            
            return res.status(200).json({ 
                resposta: resposta,
                modo: 'desenvolvimento'
            });
        }

        // 🔥 CONEXÃO COM DEEPSEEK REAL
        console.log('🚀 Conectando com DeepSeek...');
        
        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    {
                        role: 'system',
                        content: `Você é a "Lumi", uma mentora escolar brasileira especializada em ajudar estudantes.
                        
CARACTERÍSTICAS:
- Linguagem: Português brasileiro claro e acessível
- Tom: Empático, encorajador e prático
- Personalidade: Acolhedora, positiva e profissional
- Formato: Respostas curtas (100-200 palavras) com emojis relevantes

ÁREAS DE ATUAÇÃO:
1. TÉCNICAS DE ESTUDO: Pomodoro, mapas mentais, revisão espaçada
2. ORGANIZAÇÃO: Cronogramas, listas de tarefas, priorização
3. SAÚDE EMOCIONAL: Ansiedade, stress, motivação
4. ORIENTAÇÃO: Dúvidas sobre matérias específicas

REGRA IMPORTANTE: Seja prática e ofereça 1-2 ações concretas.`
                    },
                    {
                        role: 'user',
                        content: mensagem
                    }
                ],
                max_tokens: 500,
                temperature: 0.7,
                stream: false
            }),
            timeout: 10000
        });

        if (!response.ok) {
            throw new Error(`Erro DeepSeek: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            throw new Error('Resposta inválida da API');
        }

        const resposta = data.choices[0].message.content;
        console.log('✅ Resposta recebida:', resposta.substring(0, 100) + '...');

        res.status(200).json({ 
            resposta: resposta,
            modo: 'deepseek',
            tokens: data.usage?.total_tokens
        });

    } catch (error) {
        console.error('💥 Erro no backend:', error);
        
        // Resposta de fallback
        const fallback = "💡 Lumi está temporariamente offline. Usei minhas respostas locais para ajudar!";
        
        res.status(200).json({ 
            resposta: fallback,
            modo: 'fallback',
            erro: error.message
        });
    }
}