import {
  Keypair,
  Horizon,
  TransactionBuilder,
  Networks,
  Operation,
  Asset,
  BASE_FEE,
  Memo
} from '@stellar/stellar-sdk';

const server = new Horizon.Server("https://horizon-testnet.stellar.org");
const networkPassphrase = Networks.TESTNET;

//const SOURCE = 'GDZGUSCXTUQAVB57SNLL26SHJEQRT7WSRG5SYHHVWIJ35SE4GK6OBLNR'; // Source account
const SECRET_KEY = 'SDRSJHNTQRTO47OID4ER3ET3NJIKRNNGJVYTZ62QHJOPHBB3JXX5BVRF'; // Secret key
const results = []; 

const DESTINATIONS = [
    { publicKey: "GANHX7DX634IN553B4CZHVVFQLK53YPTG5E7KSPWVWZ3W5RTTVGZRWTI", memo: "Pago-001", amount: "2" },
    { publicKey: "GAMDVWG2YGERXYOVTBJTKI4OUYYYEB2MM7WSNJU3X2M7TX6QTRLWB6WL", memo: "Pago-002", amount: "2" },
    { publicKey: "GB5T4MDTUB5XBHDLVFKNVCFZ3S7NOPNAOZFSQDTKOI3RZDM7R3QY6BOX", memo: "Pago-003", amount: "2" }
];

async function enviarPagos(DESTINATIONS) {
  try {
    console.log('🚀 Iniciando pago...\n');
    
    // Paso 1: Cargar tu cuenta
    const totalDestinatarios = DESTINATIONS.length;
    console.log(`Total cuentas a pagar: ${totalDestinatarios}`);
    const sourceKeys = Keypair.fromSecret(SECRET_KEY);
    const sourceAccount = await server.loadAccount(sourceKeys.publicKey());
    console.log(`Balance actual: ${sourceAccount.balances[0].balance} XLM\n`);

    for (let i = 0; i < totalDestinatarios; i++) {
        try {
            // Paso 2: Construir transacción
            if (parseFloat(sourceAccount.balances[0].balance) < DESTINATIONS[i].amount) {
                throw new Error('Balance insuficiente');
            }
            const transaction = new TransactionBuilder(sourceAccount, {
                fee: BASE_FEE,
                networkPassphrase: networkPassphrase
            })
            .addOperation(Operation.payment({
                destination: DESTINATIONS[i].publicKey,
                asset: Asset.native(),
                amount: DESTINATIONS[i].amount.toString()
            }))
            .addMemo(DESTINATIONS[i].memo ? Memo.text(DESTINATIONS[i].memo) : Memo.none())
            .setTimeout(30)
            .build();
            
            // Paso 3: Firmar
            transaction.sign(sourceKeys);
            
            // Paso 4: Enviar
            const result = await server.submitTransaction(transaction);
            results[i] = result;
            //const balance = DESTINATIONS[i].publicKey.balance;
            const publicKey = DESTINATIONS[i].publicKey;
            if (result.successful) {
                // Consultar balance
                const account = await server.loadAccount(publicKey);
                const balance = account.balances.map(b => ({
                    balance: b.balance
                }));

                console.log('🎉 ¡PAGO EXITOSO!');
                console.log(`🚀 Memo: ${result.memo}`);
                console.log(`💰 Enviaste: ${DESTINATIONS[i].amount} XLM a Cuenta ${i+1} - ${DESTINATIONS[i].publicKey}`);
                console.log(`🔗 Hash: ${result.hash}`);
                balance.forEach(b => {
                    console.log(`💳 Balance actual: ${b.balance} XLM\n`);
                });
            }
        }
        catch(error){
            console.error(`❌ Error en el pago a Cuenta ${i + 1}:`, error.message);
            console.log('⛔ Deteniendo ejecución. No se enviarán pagos posteriores.\n');
            break;
        }
    }
    return results;
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    throw error;
  }
}

enviarPagos(DESTINATIONS);

