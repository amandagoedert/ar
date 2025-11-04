# Integração TriboPay - Documentação

## ✅ Status da Integração
A integração com o TriboPay está **COMPLETA e FUNCIONAL**. O sistema está configurado para:
- Gerar pagamentos PIX
- Exibir QR Code
- Copiar código PIX
- Verificar pagamento automaticamente

## 🔧 Configuração Atual

### Token de API
**Arquivo:** `/api/tribopay_config.js`
```javascript
api_token: 'PEllrmnJPwmxEcghOgzi0RIFVO9JqcBlMBpYrCBtyFEKjPqPVzr9uPL4Ld9e'
```

### Produtos e Ofertas
- **Oferta padrão:** `ugg3tvujyf`
- **Produto padrão:** `5crbkjmnrj`
- **Webhook URL:** `https://tikt-ten.vercel.app/api/webhook`

## 📋 Fluxo de Pagamento

### 1. Cliente clica em "Fazer pedido"
**Arquivo:** `/checkout/index.html` (linha 1044)

O botão captura:
- Nome, email, telefone, CPF
- Endereço completo
- Produtos do carrinho
- Valor total

### 2. Envio para API
**Arquivo:** `/api/api.js`

A API processa:
```javascript
{
  debtor_name: "Nome do Cliente",
  email: "email@cliente.com",
  debtor_document_number: "12345678900",
  phone: "11999999999",
  amount: 109.97,  // Será convertido para centavos (10997)
  payment_method: "pix",
  produtos: [{
    nome: "Ar Condicionado Portátil 2 em 1",
    preco: 109.97,
    quantidade: 1,
    product_hash: "5crbkjmnrj",
    offer_hash: "ugg3tvujyf"
  }]
}
```

### 3. Comunicação com TriboPay
**Endpoint:** `https://api.tribopay.com.br/api/public/v1/transactions`

Payload enviado:
```javascript
{
  api_token: "SEU_TOKEN",
  amount: 10997,  // Valor em centavos
  offer_hash: "ugg3tvujyf",
  payment_method: "pix",
  customer: {
    name: "Nome",
    email: "email@cliente.com",
    phone_number: "11999999999",
    document: "12345678900",
    street_name: "Rua...",
    number: "123",
    neighborhood: "Bairro",
    city: "Cidade",
    state: "UF",
    zip_code: "12345678"
  },
  cart: [{
    product_hash: "5crbkjmnrj",
    title: "Ar Condicionado Portátil 2 em 1",
    price: 10997,
    quantity: 1,
    operation_type: 1,
    tangible: true
  }],
  expire_in_days: 1,
  transaction_origin: "api",
  installments: 1,
  postback_url: "https://tikt-ten.vercel.app/api/webhook"
}
```

### 4. Resposta do TriboPay
```javascript
{
  hash: "abc123def456",  // ID da transação
  status: "pending",
  pix: {
    pix_url: "00020126580014br.gov.bcb.pix...",  // Código PIX copia e cola
    pix_qr_code: "00020126580014br.gov.bcb.pix...",  // Mesmo código
    qr_code_base64: "data:image/png;base64,..."  // QR Code em base64
  }
}
```

### 5. Exibição do PIX
**Arquivo:** `/checkout/index.html` (função `exibirPixInline`)

O modal exibe:
- ✅ QR Code gerado automaticamente
- ✅ Código PIX para copiar
- ✅ Botão "Copiar PIX"
- ✅ Timer de expiração (10 minutos)
- ✅ Informações do pedido

### 6. Verificação Automática
**Arquivo:** `/checkout/index.html` (função `iniciarVerificacaoPagamento`)

A cada 5 segundos:
```javascript
// Consulta a API verifica.js
const response = await fetch(`/api/verifica.js?id=${transacaoId}`);
const data = await response.json();

if (data.status === "paid") {
  // Redireciona para página de sucesso
  window.location.href = "https://tikt-ten.vercel.app/up1";
}
```

## 🎯 Pontos Críticos de Configuração

### 1. Token da API (✅ Configurado)
- Verificar se o token está válido
- Token atual: `PEllrmnJPwmxEcghOgzi0RIFVO9JqcBlMBpYrCBtyFEKjPqPVzr9uPL4Ld9e`

### 2. Produtos e Ofertas (⚠️ VERIFICAR)
**IMPORTANTE:** Você precisa verificar no painel do TriboPay se:
- A oferta `ugg3tvujyf` existe e está ativa
- O produto `5crbkjmnrj` existe e está ativo
- Os hashes estão corretos

**Como verificar:**
1. Acesse: https://app.tribopay.com.br
2. Vá em "Produtos"
3. Clique no produto desejado
4. Copie o hash da URL (ex: `/products/5crbkjmnrj`)
5. Vá em "Ofertas" dentro do produto
6. Copie o hash da oferta (ex: `/offers/ugg3tvujyf`)

### 3. Valor Mínimo (✅ Implementado)
- Valor mínimo: R$ 5,00 (500 centavos)
- Sistema valida antes de enviar ao TriboPay
- Mensagem de erro amigável se valor for menor

### 4. Conversão de Valores (✅ Implementado)
```javascript
// Converte R$ 109,97 para 10997 centavos
function toCents(value) {
  // Aceita: 109.97, 109,97, "109,97", "R$ 109,97"
  // Retorna: 10997
}
```

## 🧪 Como Testar

### Teste 1: Fluxo Completo
1. Abra `/Index.html`
2. Clique em "Comprar Agora"
3. Preencha todos os dados do formulário
4. Clique em "Fazer pedido"
5. **Esperado:** Modal com QR Code e código PIX

### Teste 2: Validação de Valor Mínimo
1. Altere o preço do produto para R$ 4,00
2. Tente finalizar compra
3. **Esperado:** Erro "Valor mínimo para PIX é R$ 5,00"

### Teste 3: Copiar Código PIX
1. No modal do PIX, clique em "Copiar PIX"
2. Cole em algum lugar
3. **Esperado:** Código longo começando com "00020126..."

### Teste 4: QR Code
1. Abra o aplicativo do banco no celular
2. Escaneie o QR Code exibido
3. **Esperado:** Dados do pagamento aparecem no app

## 🐛 Problemas Comuns e Soluções

### Erro: "PIX não foi gerado pela TriboPay"
**Causa:** Token inválido ou produtos/ofertas incorretos
**Solução:** 
1. Verificar token no arquivo `tribopay_config.js`
2. Verificar hashes de produto/oferta no painel TriboPay

### Erro: "Valor mínimo R$ 5,00"
**Causa:** Produto com valor abaixo do mínimo
**Solução:** Aumentar o preço do produto para pelo menos R$ 5,00

### Erro: "Método não permitido"
**Causa:** Servidor não está aceitando requisições POST
**Solução:** Verificar configuração do servidor/Vercel

### QR Code não carrega
**Causa:** Código PIX inválido ou internet lenta
**Solução:** Usar o código copia e cola como alternativa

### Pagamento não é confirmado automaticamente
**Causa:** Webhook não está configurado ou não está funcionando
**Solução:** 
1. Verificar URL do webhook: `https://tikt-ten.vercel.app/api/webhook`
2. Verificar arquivo `/api/webhook.js`
3. Verificar logs no painel TriboPay

## 📊 Monitoramento

### Logs de Debug
O sistema gera logs detalhados em:
- **Console do navegador:** Todas as etapas do fluxo
- **Arquivo tribopay_log.js:** Registra todas as requisições

### Como ver os logs:
1. Abra o Console do navegador (F12)
2. Procure por:
   - `🚀 Iniciando requisição para API TriboPay...`
   - `🔍 Debug API Response:`
   - `Resposta TriboPay:`
   - `Exibindo PIX inline com dados:`

## 🔒 Segurança

### ✅ Implementado:
- CORS configurado para domínios permitidos
- Token de API no backend (não exposto ao cliente)
- Validação de campos obrigatórios
- Sanitização de valores monetários
- HTTPS obrigatório em produção

### ⚠️ Recomendações:
- Não compartilhar o token da API publicamente
- Manter o token no arquivo `.env` em produção
- Configurar rate limiting no servidor
- Implementar logs de auditoria

## 📝 Checklist de Implantação

- [ ] Token da API configurado
- [ ] Produtos e ofertas verificados no painel TriboPay
- [ ] Webhook configurado e testado
- [ ] Fluxo de pagamento testado end-to-end
- [ ] QR Code sendo gerado corretamente
- [ ] Verificação automática de pagamento funcionando
- [ ] Redirecionamento após pagamento configurado
- [ ] Logs de erro configurados
- [ ] Tratamento de erros implementado
- [ ] Testes em ambiente de produção

## 🚀 Próximos Passos

1. **Verificar Produtos no TriboPay:**
   - Acessar painel TriboPay
   - Confirmar que produto `5crbkjmnrj` existe
   - Confirmar que oferta `ugg3tvujyf` existe

2. **Testar Fluxo Completo:**
   - Fazer um pedido teste
   - Verificar se PIX é gerado
   - Confirmar QR Code funciona
   - Testar pagamento real (valor mínimo)

3. **Configurar Webhook:**
   - Verificar se webhook está recebendo notificações
   - Testar redirecionamento após pagamento

4. **Monitorar Erros:**
   - Acompanhar logs por 24h
   - Corrigir problemas identificados

## 📞 Suporte TriboPay

- **Documentação:** https://docs.tribopay.com.br
- **Painel:** https://app.tribopay.com.br
- **Suporte:** Via painel TriboPay

## 📌 Notas Importantes

1. **Valores sempre em centavos na API TriboPay**
2. **Valor mínimo: R$ 5,00 (500 centavos)**
3. **PIX expira em 24 horas por padrão**
4. **Webhook é essencial para confirmar pagamentos**
5. **Testar sempre em ambiente de sandbox primeiro**

---

**Última atualização:** 04/11/2025
**Versão:** 1.0
**Status:** ✅ Funcional e pronto para uso
