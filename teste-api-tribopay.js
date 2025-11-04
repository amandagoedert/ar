#!/usr/bin/env node

/**
 * Script de Teste da Integração TriboPay
 * Execute: node teste-api-tribopay.js
 */

const https = require('https');

// Configuração
const CONFIG = {
    api_token: 'PEllrmnJPwmxEcghOgzi0RIFVO9JqcBlMBpYrCBtyFEKjPqPVzr9uPL4Ld9e',
    default_offer_hash: 'ugg3tvujyf',
    default_product_hash: '5crbkjmnrj',
    postback_url: 'https://tikt-ten.vercel.app/api/webhook'
};

const TRIBOPAY_ENDPOINT = 'https://api.tribopay.com.br/api/public/v1/transactions';

// Cores para terminal
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
    console.log('\n' + '='.repeat(60));
    log(title, 'bright');
    console.log('='.repeat(60) + '\n');
}

function toCents(value) {
    if (typeof value === 'number') {
        return Math.round(value * 100);
    }
    if (typeof value === 'string') {
        let cleaned = value.replace(/[^\d,.]/g, '');
        if (cleaned.includes(',')) {
            if (cleaned.includes('.') && cleaned.includes(',')) {
                cleaned = cleaned.replace(/\./g, '').replace(',', '.');
            } else {
                cleaned = cleaned.replace(',', '.');
            }
        }
        return Math.round(parseFloat(cleaned) * 100);
    }
    return Math.round(parseFloat(value || 0) * 100);
}

// Teste 1: Valor Mínimo
function testeValorMinimo() {
    logSection('TESTE 1: Validação de Valor Mínimo');
    
    const testes = [
        { valor: 4.99, esperado: false, descricao: 'R$ 4,99 (abaixo do mínimo)' },
        { valor: 5.00, esperado: true, descricao: 'R$ 5,00 (mínimo aceito)' },
        { valor: 109.97, esperado: true, descricao: 'R$ 109,97 (valor do produto)' }
    ];
    
    let passou = true;
    
    testes.forEach(teste => {
        const centavos = toCents(teste.valor);
        const valido = centavos >= 500;
        const testePassa = valido === teste.esperado;
        
        if (testePassa) {
            log(`✅ ${teste.descricao}`, 'green');
            log(`   Valor em centavos: ${centavos}`, 'cyan');
            log(`   Validação: ${valido ? 'ACEITO' : 'REJEITADO'}`, 'cyan');
        } else {
            log(`❌ ${teste.descricao}`, 'red');
            log(`   Valor em centavos: ${centavos}`, 'cyan');
            log(`   Validação: ${valido ? 'ACEITO' : 'REJEITADO'}`, 'cyan');
            passou = false;
        }
    });
    
    return passou;
}

// Teste 2: Conversão de Valores
function testeConversaoValores() {
    logSection('TESTE 2: Conversão de Valores');
    
    const testes = [
        { input: 109.97, esperado: 10997 },
        { input: '109,97', esperado: 10997 },
        { input: 'R$ 109,97', esperado: 10997 },
        { input: 5.00, esperado: 500 },
        { input: '5', esperado: 500 },
        { input: 1000.50, esperado: 100050 }
    ];
    
    let passou = true;
    
    testes.forEach(teste => {
        const resultado = toCents(teste.input);
        const testePassa = resultado === teste.esperado;
        
        if (testePassa) {
            log(`✅ Input: ${JSON.stringify(teste.input)}`, 'green');
            log(`   Esperado: ${teste.esperado} centavos | Obtido: ${resultado} centavos`, 'cyan');
        } else {
            log(`❌ Input: ${JSON.stringify(teste.input)}`, 'red');
            log(`   Esperado: ${teste.esperado} centavos | Obtido: ${resultado} centavos`, 'cyan');
            passou = false;
        }
    });
    
    return passou;
}

// Teste 3: Geração de PIX via API TriboPay
async function testeGeracaoPix(valor, descricao) {
    logSection(`TESTE 3: Geração de PIX - ${descricao}`);
    
    const payload = {
        api_token: CONFIG.api_token,
        amount: toCents(valor),
        offer_hash: CONFIG.default_offer_hash,
        payment_method: 'pix',
        customer: {
            name: 'Cliente Teste',
            email: 'teste@email.com',
            phone_number: '11999999999',
            document: '12345678900',
            street_name: 'Rua Teste',
            number: '123',
            neighborhood: 'Centro',
            city: 'São Paulo',
            state: 'SP',
            zip_code: '01234567'
        },
        cart: [{
            product_hash: CONFIG.default_product_hash,
            title: descricao,
            price: toCents(valor),
            quantity: 1,
            operation_type: 1,
            tangible: true
        }],
        expire_in_days: 1,
        transaction_origin: 'api',
        installments: 1,
        postback_url: CONFIG.postback_url
    };
    
    return new Promise((resolve) => {
        log('📤 Enviando requisição para TriboPay...', 'yellow');
        log(`   Valor: R$ ${valor.toFixed(2)}`, 'cyan');
        log(`   Valor em centavos: ${payload.amount}`, 'cyan');
        
        const url = new URL(TRIBOPAY_ENDPOINT);
        const options = {
            hostname: url.hostname,
            port: 443,
            path: url.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': 'TriboPay-Test/1.0'
            }
        };
        
        const req = https.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    
                    if (res.statusCode === 201 || res.statusCode === 200) {
                        log('\n✅ PIX gerado com sucesso!', 'green');
                        log(`   Hash da Transação: ${response.hash}`, 'cyan');
                        log(`   Status: ${response.status}`, 'cyan');
                        
                        if (response.pix) {
                            log(`   Código PIX: ${response.pix.pix_qr_code ? response.pix.pix_qr_code.substring(0, 50) + '...' : 'N/A'}`, 'cyan');
                            log(`   QR Code Base64: ${response.pix.qr_code_base64 ? 'Disponível' : 'Não disponível'}`, 'cyan');
                            
                            if (response.pix.pix_qr_code) {
                                log('\n📋 Código PIX Completo:', 'yellow');
                                console.log(response.pix.pix_qr_code);
                            }
                        }
                        
                        resolve(true);
                    } else {
                        log(`\n❌ Erro ao gerar PIX (HTTP ${res.statusCode})`, 'red');
                        log(`   Mensagem: ${response.message || 'Erro desconhecido'}`, 'red');
                        
                        if (response.errors) {
                            log('   Detalhes:', 'red');
                            console.log(response.errors);
                        }
                        
                        resolve(false);
                    }
                } catch (error) {
                    log(`\n❌ Erro ao processar resposta: ${error.message}`, 'red');
                    log('   Resposta raw:', 'red');
                    console.log(data);
                    resolve(false);
                }
            });
        });
        
        req.on('error', (error) => {
            log(`\n❌ Erro na requisição: ${error.message}`, 'red');
            resolve(false);
        });
        
        req.write(JSON.stringify(payload));
        req.end();
    });
}

// Executar todos os testes
async function executarTestes() {
    log('\n🧪 INICIANDO TESTES DA INTEGRAÇÃO TRIBOPAY', 'bright');
    log('Data: ' + new Date().toLocaleString('pt-BR'), 'cyan');
    
    const resultados = {
        valorMinimo: false,
        conversao: false,
        pixMinimo: false,
        pixProduto: false
    };
    
    // Teste 1
    resultados.valorMinimo = testeValorMinimo();
    
    // Teste 2
    resultados.conversao = testeConversaoValores();
    
    // Teste 3A - PIX de R$ 5,00
    resultados.pixMinimo = await testeGeracaoPix(5.00, 'Produto de Teste (Valor Mínimo)');
    
    // Aguardar um pouco entre requisições
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Teste 3B - PIX do produto (R$ 109,97)
    resultados.pixProduto = await testeGeracaoPix(109.97, 'Ar Condicionado Portátil 2 em 1');
    
    // Resumo
    logSection('RESUMO DOS TESTES');
    
    const total = Object.keys(resultados).length;
    const passou = Object.values(resultados).filter(r => r).length;
    
    log(`✅ Testes Passados: ${passou}/${total}`, passou === total ? 'green' : 'yellow');
    log(`   1. Validação de Valor Mínimo: ${resultados.valorMinimo ? '✅' : '❌'}`, resultados.valorMinimo ? 'green' : 'red');
    log(`   2. Conversão de Valores: ${resultados.conversao ? '✅' : '❌'}`, resultados.conversao ? 'green' : 'red');
    log(`   3. Geração de PIX (R$ 5,00): ${resultados.pixMinimo ? '✅' : '❌'}`, resultados.pixMinimo ? 'green' : 'red');
    log(`   4. Geração de PIX (R$ 109,97): ${resultados.pixProduto ? '✅' : '❌'}`, resultados.pixProduto ? 'green' : 'red');
    
    if (passou === total) {
        log('\n🎉 Todos os testes passaram! A integração está funcionando perfeitamente.', 'green');
    } else {
        log('\n⚠️  Alguns testes falharam. Verifique os erros acima.', 'yellow');
    }
    
    log('\n📄 Para mais detalhes, consulte: INTEGRACAO_TRIBOPAY.md', 'cyan');
    log('🌐 Para testes visuais, abra: checkout/teste-tribopay.html\n', 'cyan');
}

// Executar
executarTestes().catch(error => {
    log(`\n❌ Erro fatal: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
});
