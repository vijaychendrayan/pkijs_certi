import * as pvutils from "pvutils";
import * as pkijs from "pkijs";



 // Global variables
  // using ec signed certificate 
  certificateBASE64:string ="MIIBpzCCAQgCFE6S1tskWsR3IeRLm2p9aRtoVFt+MAoGCCqGSM49BAMEMBAxDjAMBgNVBAMMBU15IENBMB4XDTIzMDQxMzA2MzUwM1oXDTI0MDQxMjA2MzUwM1owFDESMBAGA1UEAwwJTXkgRUMgS2V5MIGbMBAGByqGSM49AgEGBSuBBAAjA4GGAAQALQY0TA+NEahinYZVRgnHv34GA9QM0shIdqSPXoXy4sDBiv/3kdlBItXA021FltRgTzc5DMW82cy0Sk3RrlrbUcMBedvta2WHd+zywfLMGUAmazmFzpivXEJ9a9ZyU3PKVXBu2cJIyFQ6slpHlJR4Oxk2aGvilF36MZYq+8t187lJR+AwCgYIKoZIzj0EAwQDgYwAMIGIAkIB+vefofgxlaUw6GrjtCtRRg9BJimp4yAPi6LobT1Azf8BLXm6vAcZYYukbn+clnCSzhWzRQl+fGMFfF8Ktnc2hRECQgHkUWeTH5liwSBul9HCPOYAo5IPGt+JZghu3yRRhgl4p0Q4sEqqS1AuaMIjrjuLr/U2+bWxNyzmm9evk6Vrmd76Zw==";

 //using ec private key
  privateKeyBASE64:string = "MIHcAgEBBEIAabsjFnLwZFiHxyx2PeWymP+MUUx30JHuZkYWw/842RKlCI3pNceS/oYQH2ZR494SalTCoXpkaMKgHiz7k1F+HHygBwYFK4EEACOhgYkDgYYABAAtBjRMD40RqGKdhlVGCce/fgYD1AzSyEh2pI9ehfLiwMGK//eR2UEi1cDTbUWW1GBPNzkMxbzZzLRKTdGuWttRwwF52+1rZYd37PLB8swZQCZrOYXOmK9cQn1r1nJTc8pVcG7ZwkjIVDqyWkeUlHg7GTZoa+KUXfoxlir7y3XzuUlH4A==";

  async passwordBasedIntegrity(): Promise<ArrayBuffer> {
    const password = "hashranga";
    const hash = "SHA-512"
    //#region Create simplified structires for certificate and private key
    const certRaw = pvutils.stringToArrayBuffer(pvutils.fromBase64(this.certificateBASE64));
    const certSimpl = pkijs.Certificate.fromBER(certRaw);

    const pkcs8Raw = pvutils.stringToArrayBuffer(pvutils.fromBase64(this.privateKeyBASE64));
    const pkcs8Simpl = pkijs.PrivateKeyInfo.fromBER(pkcs8Raw);
    //#endregion
    //#region Put initial values for PKCS#12 structures
    const pkcs12 = new pkijs.PFX({
      parsedValue: {
        integrityMode: 0,
        authenticatedSafe: new pkijs.AuthenticatedSafe({
          parsedValue: {
            safeContents: [
              {
                privacyMode: 0,
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
    //#endregion
    //#region Encode internal values for all "SafeContents" firts (create all "Privacy Protection" envelopes)
    if (!(pkcs12.parsedValue && pkcs12.parsedValue.authenticatedSafe)) {
      throw new Error("pkcs12.parsedValue.authenticatedSafe is empty");
    }
    await pkcs12.parsedValue.authenticatedSafe.makeInternalValues({
      safeContents: [
        {
          // Empty parameters since we have "No Privacy" protection level for SafeContents
        }
      ]
    });
    //#endregion
    //#region Encode internal values for "Integrity Protection" envelope
    await pkcs12.makeInternalValues({
      password: pvutils.stringToArrayBuffer(password),
      iterations: 1,
      pbkdf2HashAlgorithm: hash,
      hmacHashAlgorithm: hash
    });
    //#endregion
    // Encode pkcs12 as DER
    const pkcs12Der = pkcs12.toSchema().toBER(false);

    // Convert DER to base64
    const pkcs12Base64: any = pvutils.toBase64(pvutils.arrayBufferToString(pkcs12Der), true);

    // Log to console
    console.log(pkcs12Base64);


    const pkcs12Blob = new Blob([pkcs12Base64], { type: 'application/x-pkcs12' });
    saveAs(pkcs12Blob, 'certificate.p12'); // Trigger a file download saveAs(pkcs12Blob, 'certificate.p12');

    return pkcs12.toSchema().toBER();


  }
