import { Keypair, Horizon } from '@stellar/stellar-sdk';
import fs from 'fs';

const server = new Horizon.Server("https://horizon-testnet.stellar.org");
let accounts = 5;

async function crearCuentas(accounts) {
  // Generar multiples llaves aleatorias
  const dataAccounts = []; // Arreglo para guardar info de cada cuenta
  for (let i = 0; i < accounts; i++) {
    console.log(`🔐 Generando tu nuevo par de llaves...\n`);
    const pair = Keypair.random();
    const publicKey = pair.publicKey();
    const secretKey = pair.secret();

    console.log(`✅ ¡Cuenta ${i + 1} creada!\n`);
    console.log('📧 PUBLIC KEY (puedes compartir):');
    console.log(pair.publicKey());
    console.log('\n🔑 SECRET KEY (NUNCA COMPARTIR):');
    console.log(pair.secret());

    // Fondear con Friendbot
    console.log('\n💰 Fondeando con Friendbot...');

    try {
        const response = await fetch(
        `https://friendbot.stellar.org/?addr=${pair.publicKey()}`
        );
        
        const result = await response.json();
        
        if (result.successful || response.ok) {
            console.log('✅ ¡Cuenta fondeada con 10,000 XLM!\n');
            console.log('🔗 Transaction hash:', result.hash);
            
            // Consultar balance
            const account = await server.loadAccount(publicKey);
            const balances = account.balances.map(b => ({
            tipo: b.asset_type,
            balance: b.balance
            }));

            // Guardar en arreglo
            dataAccounts.push({
                publicKey,
                secretKey,
                balances
            });

            // Mostrar balance
            console.log('📊 Balance inicial:');
            balances.forEach(b => {
                console.log(`💳 Tipo: ${b.tipo}, Balance: ${b.balance} XLM`);
            });
        }
    } catch (error) {
        console.error('❌ Error al fondear:', error.message);
    }
    
    console.log('\n⚠️  IMPORTANTE: Guarda estas llaves en un lugar seguro\n');
    console.log('---------------------------------------------------------------------------------------------\n');
    }
    // Mostrar arreglo final
    console.log('📁 Resumen de cuentas generadas:\n');
    fs.writeFileSync('accounts.json', JSON.stringify(dataAccounts, null, 2));
    console.log(JSON.stringify(dataAccounts, null, 2));
}

crearCuentas(accounts);