import { Component } from '@angular/core';
import * as pvutils from "pvutils";
import * as pkijs from "pkijs";
import * as saveAs from 'file-saver';
import { PrivateKeyInfo } from 'pkijs';
import { Certificate } from 'pkijs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'pkijs_certi';

  trimMessage(str: any) {
    return (str.replaceAll(/.*----.*----/g, "").replace(/(\r\n|\n|\r)/gm, ""))
  }

  destroyClickedElement(event: any) {
    document.body.removeChild(event.target);
  }

  // Global variables
  // using ec signed certificate 


  saveFile(result: any) {
    const pkcs12AsBlob = new Blob([result], { type: "application/x-pkcs12" });
    const downloadLink = document.createElement("a");
    downloadLink.download = "certificate.p12";
    downloadLink.innerHTML = "Download File";
    downloadLink.href = window.URL.createObjectURL(pkcs12AsBlob);
    downloadLink.onclick = this.destroyClickedElement;
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);
    downloadLink.click();
  }


  async generateCertificatePFX() {
    const pwd = "welogical";

    // const cert:any = `-----BEGIN CERTIFICATE-----
    // MIICajCCAcwCFDynpN5Ssw9J1++fMnasb87rfJrgMAoGCCqGSM49BAMCMHQxCzAJ
    // BgNVBAYTAklOMRAwDgYDVQQIDAdHVUpBUkFUMQ8wDQYDVQQHDAZWQUxTQUQxCzAJ
    // BgNVBAoMAlBQMQswCQYDVQQLDAJQUDELMAkGA1UEAwwCUFAxGzAZBgkqhkiG9w0B
    // CQEWDHBwQGdtYWlsLmNvbTAeFw0yMzA0MDQwOTU4MzZaFw0yMzA1MDQwOTU4MzZa
    // MHQxCzAJBgNVBAYTAklOMRAwDgYDVQQIDAdHVUpBUkFUMQ8wDQYDVQQHDAZWQUxT
    // QUQxCzAJBgNVBAoMAkFQMQswCQYDVQQLDAJBUDELMAkGA1UEAwwCQVAxGzAZBgkq
    // hkiG9w0BCQEWDGFwQGdtYWlsLmNvbTCBmzAQBgcqhkjOPQIBBgUrgQQAIwOBhgAE
    // AAuJXGrhINQZRFVKeCTw1Wu2ote3HYXfTpuscRSicZjFRJchjTVDecQEAdiURmwK
    // O4oBtQTfnjLWn1iw8AjNu58/AePKbpoHPO/0BH/5IeZ+XhdQELS2QbyQb8C8ZIzO
    // ayAHZkyu3Osuyo63j2/JFHI7k22CKjUeTuo+lWdvag9cmX4PMAoGCCqGSM49BAMC
    // A4GLADCBhwJBVCgEy9cJdHpmbgQSUdutgoARyWxDgOR9RXxeYcvoQbq8epUpwc6n
    // nJfQpgGQuhhUNizEaTedMA1vGNs5QRu3fBwCQgGtXm7H/YEbv+SbmRZLS/EsNqKC
    // JKqqmNIjKItrvsmoktHELDg+ciS67iGEdqKH1RW5a/m0Vr9L5u8Eq6U4WZEa0A==
    // -----END CERTIFICATE-----`;

    // //using ec private key
    // const key:any = `-----BEGIN EC PRIVATE KEY-----
    // MIHcAgEBBEIApLmnlJFKswUbZzxrVfT5YcUHt+uISytpBXn+L9KJCSQjv8AP/heJ
    // xoJoX6ghqpXmBcaj6MEU1yPBH7vZjAcPr+igBwYFK4EEACOhgYkDgYYABAALiVxq
    // 4SDUGURVSngk8NVrtqLXtx2F306brHEUonGYxUSXIY01Q3nEBAHYlEZsCjuKAbUE
    // 354y1p9YsPAIzbufPwHjym6aBzzv9AR/+SHmfl4XUBC0tkG8kG/AvGSMzmsgB2ZM
    // rtzrLsqOt49vyRRyO5Ntgio1Hk7qPpVnb2oPXJl+Dw==
    // -----END EC PRIVATE KEY-----`;

    // console.log('-----inside generateCertificate------')
    // console.log('Key      : ',key);
    // console.log('Cert     : ',cert);
    // console.log('Password : ',pwd)
    const certificateBASE64:any = "MIICajCCAcwCFDynpN5Ssw9J1++fMnasb87rfJrgMAoGCCqGSM49BAMCMHQxCzAJBgNVBAYTAklOMRAwDgYDVQQIDAdHVUpBUkFUMQ8wDQYDVQQHDAZWQUxTQUQxCzAJBgNVBAoMAlBQMQswCQYDVQQLDAJQUDELMAkGA1UEAwwCUFAxGzAZBgkqhkiG9w0BCQEWDHBwQGdtYWlsLmNvbTAeFw0yMzA0MDQwOTU4MzZaFw0yMzA1MDQwOTU4MzZaMHQxCzAJBgNVBAYTAklOMRAwDgYDVQQIDAdHVUpBUkFUMQ8wDQYDVQQHDAZWQUxTQUQxCzAJBgNVBAoMAkFQMQswCQYDVQQLDAJBUDELMAkGA1UEAwwCQVAxGzAZBgkqhkiG9w0BCQEWDGFwQGdtYWlsLmNvbTCBmzAQBgcqhkjOPQIBBgUrgQQAIwOBhgAEAAuJXGrhINQZRFVKeCTw1Wu2ote3HYXfTpuscRSicZjFRJchjTVDecQEAdiURmwKO4oBtQTfnjLWn1iw8AjNu58/AePKbpoHPO/0BH/5IeZ+XhdQELS2QbyQb8C8ZIzOayAHZkyu3Osuyo63j2/JFHI7k22CKjUeTuo+lWdvag9cmX4PMAoGCCqGSM49BAMCA4GLADCBhwJBVCgEy9cJdHpmbgQSUdutgoARyWxDgOR9RXxeYcvoQbq8epUpwc6nnJfQpgGQuhhUNizEaTedMA1vGNs5QRu3fBwCQgGtXm7H/YEbv+SbmRZLS/EsNqKCJKqqmNIjKItrvsmoktHELDg+ciS67iGEdqKH1RW5a/m0Vr9L5u8Eq6U4WZEa0A=="
    const privateKeyBASE64:any = "MIHcAgEBBEIApLmnlJFKswUbZzxrVfT5YcUHt+uISytpBXn+L9KJCSQjv8AP/heJxoJoX6ghqpXmBcaj6MEU1yPBH7vZjAcPr+igBwYFK4EEACOhgYkDgYYABAALiVxq4SDUGURVSngk8NVrtqLXtx2F306brHEUonGYxUSXIY01Q3nEBAHYlEZsCjuKAbUE354y1p9YsPAIzbufPwHjym6aBzzv9AR/+SHmfl4XUBC0tkG8kG/AvGSMzmsgB2ZMrtzrLsqOt49vyRRyO5Ntgio1Hk7qPpVnb2oPXJl+Dw=="
    // const password = 'welogical'
    // const certificateBASE64 = this.trimMessage(cert)
    // console.log(certificateBASE64,"ankit");
    // const privateKeyBASE64 = this.trimMessage(key)
    // console.log(privateKeyBASE64,"abhishek")
    const password = pwd
    //#region Create simplified structires for certificate and private key
    const certRaw = pvutils.stringToArrayBuffer(pvutils.fromBase64(certificateBASE64));
    console.log(certRaw, "certRaw");
    const certSimpl = pkijs.Certificate.fromBER(certRaw);
    console.log(certSimpl, "certSimpl");

    const pkcs8Raw = pvutils.stringToArrayBuffer(pvutils.fromBase64(privateKeyBASE64));
    console.log(pkcs8Raw, "pkcs8Raw")
    //  const pkcs8Simpl = pkijs.PrivateKeyInfo.fromBER(pkcs8Raw);
    const pkcs8Simpl:any = pkijs.ECPrivateKey.fromBER(pkcs8Raw);
    console.log(pkcs8Simpl, "pkcs8Simpl");

    //#region Put initial values for PKCS#12 structures
    const pkcs12 = new pkijs.PFX({
      parsedValue: {
        integrityMode: 0,
        authenticatedSafe: new pkijs.AuthenticatedSafe({
          parsedValue: {
            safeContents: [
              {
                privacyMode: 2,
                value: new pkijs.SafeContents({
                  safeBags: [
                    new pkijs.SafeBag({
                      bagId: "1.2.840.113549.1.12.10.1.1",
                      bagValue: pkcs8Simpl
                    }),
                    new pkijs.SafeBag({
                      bagId: "1.2.840.113549.1.12.10.1.3",
                      bagValue: new pkijs.CertBag({
                        parsedValue: certSimpl
                      })
                    })
                  ]
                })
              }
            ]
          }
        })
      }
    });

       //#region Encode internal values for all "SafeContents" firts (create all "Privacy Protection" envelopes)
       if (!(pkcs12.parsedValue && pkcs12.parsedValue.authenticatedSafe)) {
        throw new Error("pkcs12.parsedValue.authenticatedSafe is empty");
    }
    await pkcs12.parsedValue.authenticatedSafe.makeInternalValues({
        safeContents: [
            {
                encryptingCertificate: certSimpl,
                encryptionAlgorithm: {
                    name: "AES-CBC",
                    length: 128
                }
            }
        ]
    });
    //#endregion
    //#region Encode internal values for "Integrity Protection" envelope
    await pkcs12.makeInternalValues({
        password: pvutils.stringToArrayBuffer(password),
        iterations: 100000,
        pbkdf2HashAlgorithm: "SHA-256",
        hmacHashAlgorithm: "SHA-256"
    });
    //#endregion
    //#region Save encoded data
     console.log(pkcs12.toString())
    return pkcs12.toSchema().toBER(false);

  }
  // Code to generate the PFX file and download the file -- End



}
