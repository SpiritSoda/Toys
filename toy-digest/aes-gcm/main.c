#include <stdio.h>
#include "aes.h"

#define ENCRYPT_FUNCTION MixColumns
#define DECRYPT_FUNCTION iMixColumns

int main() {
    aes_config_t aes_config = UseAlgorithm(AES_128);
    // aes_t data = ALLOCATE(aes_config.group_length);
    // int bytes = aes_config.group_length;
    // for(int i = 0; i < bytes; i++) {
    //     SET_BYTE_AES(data, i, (2 * i) & 0xFF);
    // }
    // printf("origin: \n");
    // for(int i = 0; i < 4; i++) {
    //     for(int j = 0; j < 4; j++) {
    //         printf("%d ", BYTE_AT_AES(data, i * 4 + j));
    //     }
    //     printf("\n");
    // }
    // aes_t encrypted = ENCRYPT_FUNCTION(data);
    // printf("encrypted: \n");
    // for(int i = 0; i < 4; i++) {
    //     for(int j = 0; j < 4; j++) {
    //         printf("%d ", BYTE_AT_AES(encrypted, i * 4 + j));
    //     }
    //     printf("\n");
    // }
    // aes_t decrypted = DECRYPT_FUNCTION(encrypted);
    // printf("decrypted: \n");
    // for(int i = 0; i < 4; i++) {
    //     for(int j = 0; j < 4; j++) {
    //         printf("%d ", BYTE_AT_AES(decrypted, i * 4 + j));
    //     }
    //     printf("\n");
    // }
    aes_t data = "Hello everyone, we gonna Make America Great Again!";
    // aes_config.nr = 1;
    // aes_t data = "123456789012345";
    int keylen = aes_config.key_length >> 3;
    aes_t key = ALLOCATE(keylen);
    for(int i = 0; i < keylen; i ++) {
        key[i] = i;
    }
    int encrptlen = 0;
    aes_t encrypted = AESEncrypt(data, strlen(data), key, &encrptlen, aes_config);
    printf("encrypt: %d\n", encrptlen);
    int decriptlen = 0;
    aes_t decripted = AESDecrypt(encrypted, encrptlen, key, &decriptlen, aes_config);
    printf("%d: %s\n", decriptlen, decripted);
}