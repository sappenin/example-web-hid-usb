import 'core-js/actual';
import {listen} from "@ledgerhq/logs";

// BTC
import AppBtc from "@ledgerhq/hw-app-btc";

// XRP
// import Transport from "@ledgerhq/hw-transport-node-hid";
// import Transport from "@ledgerhq/hw-transport-u2f";
import Transport from "@ledgerhq/hw-transport-webusb";
// for browser
import Xrp from "@ledgerhq/hw-app-xrp";
import {encode} from 'ripple-binary-codec';

// Keep this import if you want to use a Ledger Nano S/X with the USB protocol and delete the @ledgerhq/hw-transport-webhid import
// import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
// Keep this import if you want to use a Ledger Nano S/X with the HID protocol and delete the @ledgerhq/hw-transport-webusb import
// import TransportWebHID from "@ledgerhq/hw-transport-webhid";

function establishConnection() {
    return Transport.create().then(transport => new Xrp(transport));
}

function fetchAddress(xrp) {
    return xrp.getAddress("44'/144'/0'/0/0");
}

function signTransaction(xrp, deviceData, seqNo) {
    let transactionJSON = {
        TransactionType: "Payment",
        Account: deviceData.address,
        Destination: "rTooLkitCksh5mQa67eaa2JaWHDBnHkpy",
        Amount: "1000000",
        Fee: "15",
        Flags: 2147483648,
        Sequence: seqNo,
        SigningPubKey: deviceData.publicKey.toUpperCase()
    };
    const transactionBlob = encode(transactionJSON);
    console.log('Sending transaction to device for approval...');
    return xrp.signTransaction("44'/144'/0'/0/0", transactionBlob);
}

function prepareAndSign(xrp, seqNo) {
    return fetchAddress(xrp).then(deviceData => signTransaction(xrp, deviceData, seqNo));
}

//Display the header in the div which has the ID "main"
const initial = "<h1>Connect your Nano and open the XRP app. Click anywhere to start...</h1>";
const $main = document.getElementById("main");
$main.innerHTML = initial;

document.body.addEventListener("click", async () => {

    const h2 = document.getElementById("h2");
    if (h2 && h2.textContent !== "") {
        return;
    }
    $main.innerHTML = initial;
    try {

        //trying to connect to your Ledger device with USB protocol
        // const transport = await TransportWebUSB.create();

        //trying to connect to your Ledger device with HID protocol
        // const transport = await TransportWebHID.create();

        //listen to the events which are sent by the Ledger packages in order to debug the app
        listen(log => console.log(log))

        //When the Ledger device connected it is trying to display the bitcoin address
        // const appBtc = new AppBtc(transport);
        // const xrp = establishConnection();


        establishConnection()
            .then(xrp => {
                const result = xrp.getAddress("44'/144'/0'/0/0");
                // const {publicKey, address} = result;
                return result;
            })
            .then(result => {
                const {publicKey, address} = result;

                //Display your bitcoin address on the screen
                const h2 = document.createElement("h2");
                // h2.textContent = bitcoinAddress;
                h2.textContent = address
                $main.innerHTML = "<h1>Your XRP address:</h1>";
                $main.appendChild(h2);
            })
            // .then(xrp => prepareAndSign(xrp, 123))
            // .then(signature => console.log(`Signature: ${signature}`))
            .catch(e => console.log(`An error occurred (${e.message})`));

        // const {bitcoinAddress} = await appBtc.getWalletPublicKey(
        //     "44'/0'/0'/0/0",
        //     {verify: false, format: "legacy"}
        // );


        // await appBtc.getWalletPublicKey("44'/0'/0'/0/0", {format: "legacy", verify: true});
    } catch (e) {
        console.log(e);
        //Catch any error thrown and displays it on the screen
        const $err = document.createElement("code");
        $err.style.color = "#f66";
        $err.textContent = String(e.message || e);
        $main.appendChild($err);
    }
});