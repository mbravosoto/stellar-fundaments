import { Horizon } from '@stellar/stellar-sdk';

const server = new Horizon.Server('https://horizon-testnet.stellar.org');
const ACCOUNTS = [
    { publicKey: "GANHX7DX634IN553B4CZHVVFQLK53YPTG5E7KSPWVWZ3W5RTTVGZRWTI", memo: "Pago-001", amount: "2" },
    { publicKey: "GAMDVWG2YGERXYOVTBJTKI4OUYYYEB2MM7WSNJU3X2M7TX6QTRLWB6WL", memo: "Pago-002", amount: "2" },
    { publicKey: "GB5T4MDTUB5XBHDLVFKNVCFZ3S7NOPNAOZFSQDTKOI3RZDM7R3QY6BOX", memo: "Pago-003", amount: "2" }
];

async function consultarBalances(ACCOUNTS) {
  try {
    const totalCuentas = ACCOUNTS.length;
    const accountsReturn = ACCOUNTS;
    console.log('===📊 MONITOR DE CUENTAS ===');

    for (let i = 0; i < totalCuentas; i++) {
        const account = ACCOUNTS[i].publicKey;
        const accountLoad = await server.loadAccount(account);

        // Get account ID
        console.log(`📧 Cuenta: ${accountLoad.id}`);

        // Get Balance
        accountLoad.balances.forEach((balance, index) => {
          if (balance.asset_type === 'native') {
              console.log(`   Balance: ${balance.balance} XLM`);
              
              const baseReserve = 0.5;
              const subentryReserve = accountLoad.subentry_count * 0.5;
              const totalReserve = baseReserve + subentryReserve;
              const available = parseFloat(balance.balance) - totalReserve;
          } else {
              console.log(`${index + 1}. 🪙 ${balance.asset_code}:`);
              console.log(`   Balance: ${balance.balance}`);
          }
        });
        
        // Get Trustlines
        const trustlines = accountLoad.balances.filter(
          (b) => b.asset_type !== "native"
        ).length;
        console.log(`   Trustlines: ${trustlines}`);
        console.log(`   Sequence: ${accountLoad.sequenceNumber()}\n`);
        accountsReturn[i] = accountLoad;
    }
    
    return accountsReturn;
    
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.error('❌ Cuenta no encontrada');
      console.log('💡 Posibles causas:');
      console.log('   - La cuenta nunca fue creada/fondeada');
      console.log('   - Error de tipeo en la public key\n');
    } else {
      console.error('❌ Error:', error.message);
    }
    throw error;
  }
}

consultarBalances(ACCOUNTS);